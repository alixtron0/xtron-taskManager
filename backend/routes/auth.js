const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db, getAsync, runAsync } = require('../db');  // Import the original db object too
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '24h';
const REMEMBER_ME_EXPIRY = '30d';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Password validation middleware
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase || !hasLowerCase) {
        return 'Password must contain both uppercase and lowercase letters';
    }
    if (!hasNumbers) {
        return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
        return 'Password must contain at least one special character';
    }
    return null;
};

// User registration route
router.post('/register', async (req, res) => {
    console.log('Registration request received:', req.body);
    const { username: email, password } = req.body;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
        console.log('Password validation failed:', passwordError);
        return res.status(400).json({ message: passwordError });
    }

    try {
        // Check if user already exists
        const existingUser = await getAsync(
            'SELECT id FROM users WHERE username = ?',
            [email]
        );

        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password and create user
        const hash = await bcrypt.hash(password, 10);
        
        // Use regular callback for insert to get lastID
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [email, hash],
                function(err) {
                    if (err) {
                        console.error('Database error during user creation:', err);
                        reject(err);
                        return;
                    }
                    console.log('User registered successfully:', email);
                    res.status(201).json({ 
                        message: 'User registered successfully',
                        userId: this.lastID 
                    });
                    resolve();
                }
            );
        });
    } catch (err) {
        console.error('Server error during registration:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

// User login route
router.post('/login', async (req, res) => {
    const { username: email, password, rememberMe } = req.body;

    try {
        // Find user in database
        const user = await getAsync(
            'SELECT * FROM users WHERE username = ?',
            [email]
        );

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login time
        await runAsync(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: rememberMe ? REMEMBER_ME_EXPIRY : TOKEN_EXPIRY }
        );

        res.status(200).json({
            message: 'Login successful',
            userId: user.id,
            token,
            expiresIn: rememberMe ? REMEMBER_ME_EXPIRY : TOKEN_EXPIRY
        });
    } catch (err) {
        console.error('Server error during login:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Token verification route
router.post('/verify', verifyToken, (req, res) => {
    res.status(200).json({ 
        message: 'Token is valid',
        userId: req.userId
    });
});

// Update user profile route
router.put('/profile', verifyToken, async (req, res) => {
    const { currentPassword, newPassword, newUsername: newEmail } = req.body;

    try {
        // Get current user
        const user = await getAsync(
            'SELECT * FROM users WHERE id = ?',
            [req.userId]
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        let updates = [];
        let params = [];

        // Handle password update
        if (newPassword) {
            const passwordError = validatePassword(newPassword);
            if (passwordError) {
                return res.status(400).json({ message: passwordError });
            }
            const hash = await bcrypt.hash(newPassword, 10);
            updates.push('password = ?');
            params.push(hash);
        }

        // Handle email update
        if (newEmail && newEmail !== user.username) {
            // Check if new email is available
            const existingUser = await getAsync(
                'SELECT id FROM users WHERE username = ? AND id != ?',
                [newEmail, req.userId]
            );

            if (existingUser) {
                return res.status(400).json({ message: 'Email already taken' });
            }

            updates.push('username = ?');
            params.push(newEmail);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        // Update user profile
        params.push(req.userId);
        await runAsync(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Server error during profile update:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
