const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const LOG_FILE = 'debug_simple_log.txt';
function log(msg) {
  fs.appendFileSync(LOG_FILE, msg + '\n');
  console.log(msg);
}

try {
  fs.writeFileSync(LOG_FILE, 'Starting debug...\n');
  const dbPath = path.join(process.cwd(), 'database.db');
  log('DB Path: ' + dbPath);

  const db = new Database(dbPath);
  log('DB Connected.');

  // Check user table schema
  const tableInfo = db.pragma('table_info(users)');
  log('Users Table Schema: ' + JSON.stringify(tableInfo));

  // Try insert
  const email = 'simple_test_' + Date.now() + '@test.com';
  const hashed = bcrypt.hashSync('pass', 10); // Sync version
  
  const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  const info = stmt.run('Test', email, hashed, 'user');
  log('Insert ID: ' + info.lastInsertRowid);

  // Try read
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  log('Read User: ' + (user ? user.email : 'NOT FOUND'));

  if (user && bcrypt.compareSync('pass', user.password)) {
    log('SUCCESS: Read/Write match.');
  } else {
    log('FAILURE: Password mismatch or read failure.');
  }

} catch (e) {
  log('ERROR: ' + e.message);
}
