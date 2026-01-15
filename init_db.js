const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(process.cwd(), 'database.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('Initializing database schema...');

try {
  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Users table created (or already exists).');

  // Check if admin exists
  const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@kalia.com');
  
  if (!admin) {
    console.log('Creating default admin user...');
    const hashed = bcrypt.hashSync('password123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@kalia.com', hashed, 'admin');
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

} catch (err) {
  console.error('Error initializing DB:', err);
}
