const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node create_admin.js <email> <password> [name]');
  process.exit(1);
}

const email = args[0];
const password = args[1];
const name = args[2] || 'Admin';

try {
  // Check if user exists
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (existing) {
    console.log(`User ${email} already exists. Updating role to Admin...`);
    db.prepare('UPDATE users SET role = ?, password = ? WHERE email = ?').run('admin', hashedPassword, email);
  } else {
    console.log(`Creating new Admin user: ${email}...`);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hashedPassword, 'admin');
  }

  console.log('Success! Admin account is ready.');

} catch (error) {
  console.error('Error:', error.message);
}
