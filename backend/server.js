const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const db = require('./db');  
const app = express();  
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Use authentication and task management routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Task Manager API');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
