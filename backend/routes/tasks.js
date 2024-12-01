const express = require('express');
const { db, updateTaskPositions } = require('../db');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

// Create a new task
router.post('/', verifyToken, async (req, res) => {
    const { title, description, color, date, time } = req.body;
    const userId = req.userId;

    try {
        // Get the highest position for the user's tasks
        const maxPosition = await new Promise((resolve, reject) => {
            db.get(
                'SELECT MAX(position) as maxPos FROM tasks WHERE userId = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row?.maxPos || 0);
                }
            );
        });

        db.run(
            `INSERT INTO tasks (userId, title, description, color, date, time, position) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, description, color, date, time, maxPosition + 1],
            function(err) {
                if (err) {
                    return res.status(400).json({ message: 'Error creating task' });
                }
                res.status(201).json({ 
                    message: 'Task created successfully', 
                    taskId: this.lastID 
                });
            }
        );
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all tasks for a user (including shared tasks)
router.get('/', verifyToken, (req, res) => {
    const userId = req.userId;

    db.all(
        `SELECT t.*, u.username as owner_name,
         CASE 
            WHEN t.userId = ? THEN 'owner'
            ELSE ts.permission_level 
         END as access_level
         FROM tasks t
         LEFT JOIN users u ON t.userId = u.id
         LEFT JOIN task_shares ts ON t.id = ts.task_id AND ts.shared_with_id = ?
         WHERE t.userId = ? OR (ts.shared_with_id = ? AND ts.accepted = 1)
         ORDER BY t.is_pinned DESC, t.position ASC`,
        [userId, userId, userId, userId],
        (err, tasks) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(200).json(tasks);
        }
    );
});

// Update a task
router.put('/:taskId', verifyToken, async (req, res) => {
    const { taskId } = req.params;
    const { title, description, color, date, time } = req.body;
    const userId = req.userId;

    try {
        // Check if user has permission to edit
        const permission = await new Promise((resolve, reject) => {
            db.get(
                `SELECT 
                    CASE 
                        WHEN t.userId = ? THEN 'owner'
                        ELSE ts.permission_level 
                    END as access_level
                FROM tasks t
                LEFT JOIN task_shares ts ON t.id = ts.task_id AND ts.shared_with_id = ?
                WHERE t.id = ?`,
                [userId, userId, taskId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row?.access_level);
                }
            );
        });

        if (!permission || (permission !== 'owner' && permission !== 'edit')) {
            return res.status(403).json({ message: 'No permission to edit this task' });
        }

        db.run(
            `UPDATE tasks 
             SET title = ?, description = ?, color = ?, date = ?, time = ? 
             WHERE id = ?`,
            [title, description, color, date, time, taskId],
            (err) => {
                if (err) {
                    return res.status(400).json({ message: 'Error updating task' });
                }
                res.status(200).json({ message: 'Task updated successfully' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a task
router.delete('/:taskId', verifyToken, async (req, res) => {
    const { taskId } = req.params;
    const userId = req.userId;

    try {
        // Check if user is the owner
        const isOwner = await new Promise((resolve, reject) => {
            db.get(
                'SELECT userId FROM tasks WHERE id = ?',
                [taskId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row?.userId === userId);
                }
            );
        });

        if (!isOwner) {
            return res.status(403).json({ message: 'Only task owner can delete tasks' });
        }

        db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
            if (err) {
                return res.status(400).json({ message: 'Error deleting task' });
            }
            res.status(200).json({ message: 'Task deleted successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle task pin status
router.patch('/:taskId/pin', verifyToken, async (req, res) => {
    const { taskId } = req.params;
    const userId = req.userId;

    try {
        // Check if user is the owner
        const isOwner = await new Promise((resolve, reject) => {
            db.get(
                'SELECT userId, is_pinned FROM tasks WHERE id = ?',
                [taskId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row?.userId === userId ? row : null);
                }
            );
        });

        if (!isOwner) {
            return res.status(403).json({ message: 'Only task owner can pin/unpin tasks' });
        }

        db.run(
            'UPDATE tasks SET is_pinned = NOT is_pinned WHERE id = ?',
            [taskId],
            (err) => {
                if (err) {
                    return res.status(400).json({ message: 'Error updating pin status' });
                }
                res.status(200).json({ message: 'Pin status updated successfully' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle task completion status
router.patch('/:taskId/complete', verifyToken, async (req, res) => {
    const { taskId } = req.params;
    const userId = req.userId;

    try {
        // Check if user has permission
        const permission = await new Promise((resolve, reject) => {
            db.get(
                `SELECT 
                    CASE 
                        WHEN t.userId = ? THEN 'owner'
                        ELSE ts.permission_level 
                    END as access_level
                FROM tasks t
                LEFT JOIN task_shares ts ON t.id = ts.task_id AND ts.shared_with_id = ?
                WHERE t.id = ?`,
                [userId, userId, taskId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row?.access_level);
                }
            );
        });

        if (!permission || (permission !== 'owner' && permission !== 'edit')) {
            return res.status(403).json({ message: 'No permission to complete this task' });
        }

        db.run(
            'UPDATE tasks SET is_completed = NOT is_completed WHERE id = ?',
            [taskId],
            (err) => {
                if (err) {
                    return res.status(400).json({ message: 'Error updating completion status' });
                }
                res.status(200).json({ message: 'Completion status updated successfully' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task position
router.patch('/:taskId/position', verifyToken, async (req, res) => {
    const { taskId } = req.params;
    const { newPosition } = req.body;
    const userId = req.userId;

    try {
        await updateTaskPositions(userId, taskId, newPosition);
        res.status(200).json({ message: 'Task position updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating task position' });
    }
});

// Share a task
router.post('/:taskId/share', verifyToken, async (req, res) => {
    const { taskId } = req.params;
    const { shareWithUsername, permissionLevel } = req.body;
    const userId = req.userId;

    try {
        // Check if user is the owner
        const isOwner = await new Promise((resolve, reject) => {
            db.get(
                'SELECT userId FROM tasks WHERE id = ?',
                [taskId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row?.userId === userId);
                }
            );
        });

        if (!isOwner) {
            return res.status(403).json({ message: 'Only task owner can share tasks' });
        }

        // Get user to share with
        const shareWithUser = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM users WHERE username = ?',
                [shareWithUsername],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!shareWithUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create share invitation
        db.run(
            `INSERT INTO share_invitations 
             (task_id, from_user_id, to_user_id, permission_level) 
             VALUES (?, ?, ?, ?)`,
            [taskId, userId, shareWithUser.id, permissionLevel],
            (err) => {
                if (err) {
                    return res.status(400).json({ message: 'Error creating share invitation' });
                }
                res.status(201).json({ message: 'Share invitation sent successfully' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Respond to share invitation
router.patch('/share-invitations/:invitationId', verifyToken, async (req, res) => {
    const { invitationId } = req.params;
    const { accept } = req.body;
    const userId = req.userId;

    try {
        const invitation = await new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM share_invitations 
                 WHERE id = ? AND to_user_id = ? AND status = 'pending'`,
                [invitationId, userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (accept) {
            // Create task share
            db.run(
                `INSERT INTO task_shares 
                 (task_id, owner_id, shared_with_id, permission_level) 
                 VALUES (?, ?, ?, ?)`,
                [invitation.task_id, invitation.from_user_id, userId, invitation.permission_level],
                (err) => {
                    if (err) {
                        return res.status(400).json({ message: 'Error accepting invitation' });
                    }
                }
            );
        }

        // Update invitation status
        db.run(
            `UPDATE share_invitations 
             SET status = ? 
             WHERE id = ?`,
            [accept ? 'accepted' : 'rejected', invitationId],
            (err) => {
                if (err) {
                    return res.status(400).json({ message: 'Error updating invitation status' });
                }
                res.status(200).json({ 
                    message: `Invitation ${accept ? 'accepted' : 'rejected'} successfully` 
                });
            }
        );
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending share invitations
router.get('/share-invitations/pending', verifyToken, (req, res) => {
    const userId = req.userId;

    db.all(
        `SELECT si.*, t.title as task_title, u.username as from_username
         FROM share_invitations si
         JOIN tasks t ON si.task_id = t.id
         JOIN users u ON si.from_user_id = u.id
         WHERE si.to_user_id = ? AND si.status = 'pending'`,
        [userId],
        (err, invitations) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(200).json(invitations);
        }
    );
});

module.exports = router;
