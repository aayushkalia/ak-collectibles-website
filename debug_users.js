const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.db');
const db = new Database(dbPath);

async function checkAndFixUsers() {
  try {
    // Check if table exists
    try {
      const users = db.prepare('SELECT * FROM users').all();
      console.log('Current users in DB:', users);
      
      const admin = users.find(u => u.email === 'admin@kalia.com');
      
      if (!admin) {
        console.log('Admin user missing. Creating...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin User', 'admin@kalia.com', hashedPassword, 'admin');
        console.log('Admin user created successfully.');
      } else {
        console.log('Admin user exists. Verifying password...');
        // Test password
        const isMatch = await bcrypt.compare('password123', admin.password);
        console.log('Password "password123" matches:', isMatch);
        
        if (!isMatch) {
            console.log('Password incorrect. Updating password...');
            const hashedPassword = await bcrypt.hash('password123', 10);
            db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, 'admin@kalia.com');
            console.log('Password updated to "password123".');
        }
      }
      
    } catch (e) {
      console.log('Error checking users (table might be missing):', e.message);
      if (e.message.includes('no such table: users')) {
         console.log('Creating users table...');
         db.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user', -- 'user' or 'admin'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
         `);
         const hashedPassword = await bcrypt.hash('password123', 10);
         db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin User', 'admin@kalia.com', hashedPassword, 'admin');
         console.log('Users table created and admin inserted.');
      }
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkAndFixUsers();
