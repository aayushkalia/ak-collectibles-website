const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'database.db');
const db = new Database(dbPath);

async function fix() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Upsert admin
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Admin User', 'admin@kalia.com', ?, 'admin')
      ON CONFLICT(email) DO UPDATE SET password = excluded.password, role = 'admin'
    `);
    
    stmt.run(hashedPassword);
    
    fs.writeFileSync('fix_log.txt', 'Admin user reset successful. Creds: admin@kalia.com / password123');
    console.log('Admin user reset successful.');
  } catch (error) {
    fs.writeFileSync('fix_log.txt', 'Error: ' + error.message);
    console.error(error);
  }
}

fix();
