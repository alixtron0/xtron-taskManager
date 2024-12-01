const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

// Create a new database connection
const db = new sqlite3.Database(path.join(__dirname, 'task_manager.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Promisify database methods
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

// Function to create tables
const createTables = async () => {
    try {
        await db.runAsync(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            display_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )`);

        await db.runAsync(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            color TEXT,
            date TEXT,
            time TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            position INTEGER,
            is_pinned BOOLEAN DEFAULT 0,
            is_completed BOOLEAN DEFAULT 0,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        await db.runAsync(`CREATE TABLE IF NOT EXISTS task_shares (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            owner_id INTEGER,
            shared_with_id INTEGER,
            permission_level TEXT CHECK(permission_level IN ('view', 'edit')) DEFAULT 'view',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            accepted BOOLEAN DEFAULT 0,
            FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
            FOREIGN KEY (owner_id) REFERENCES users (id),
            FOREIGN KEY (shared_with_id) REFERENCES users (id)
        )`);

        await db.runAsync(`CREATE TABLE IF NOT EXISTS share_invitations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            from_user_id INTEGER,
            to_user_id INTEGER,
            permission_level TEXT CHECK(permission_level IN ('view', 'edit')) DEFAULT 'view',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
            FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
            FOREIGN KEY (from_user_id) REFERENCES users (id),
            FOREIGN KEY (to_user_id) REFERENCES users (id)
        )`);

        await db.runAsync(`CREATE TRIGGER IF NOT EXISTS update_task_timestamp
            AFTER UPDATE ON tasks
            BEGIN
                UPDATE tasks SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `);

        await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_task_position 
            ON tasks(userId, position);
        `);

        await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_task_shares 
            ON task_shares(shared_with_id, task_id);
        `);

        await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_share_invitations 
            ON share_invitations(to_user_id, status);
        `);

        console.log('All tables and indexes created successfully');
    } catch (err) {
        console.error('Error creating tables:', err);
        throw err;
    }
};

// Function to update task positions
const updateTaskPositions = async (userId, taskId, newPosition) => {
    try {
        await db.runAsync('BEGIN TRANSACTION');

        const task = await db.getAsync(
            'SELECT position FROM tasks WHERE id = ? AND userId = ?',
            [taskId, userId]
        );

        if (!task) {
            await db.runAsync('ROLLBACK');
            throw new Error('Task not found');
        }

        const currentPosition = task.position;

        if (newPosition > currentPosition) {
            await db.runAsync(
                `UPDATE tasks 
                SET position = position - 1 
                WHERE userId = ? 
                AND position > ? 
                AND position <= ?`,
                [userId, currentPosition, newPosition]
            );
        } else {
            await db.runAsync(
                `UPDATE tasks 
                SET position = position + 1 
                WHERE userId = ? 
                AND position >= ? 
                AND position < ?`,
                [userId, newPosition, currentPosition]
            );
        }

        await db.runAsync(
            'UPDATE tasks SET position = ? WHERE id = ?',
            [newPosition, taskId]
        );

        await db.runAsync('COMMIT');
    } catch (err) {
        await db.runAsync('ROLLBACK');
        throw err;
    }
};

// Initialize database
createTables().catch(console.error);

// Export database and utility functions
module.exports = {
    db,
    runAsync: db.runAsync,
    getAsync: db.getAsync,
    allAsync: db.allAsync,
    updateTaskPositions
};
