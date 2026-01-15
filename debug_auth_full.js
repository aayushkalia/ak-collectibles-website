const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Mimic the db.js logic
const dbPath = path.join(process.cwd(), 'database.db');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath, { verbose: console.log });
  console.log('Database connected successfully.');

  // Test 1: Check Users Table
  try {
    const users = db.prepare('SELECT * FROM users').all();
    console.log('Existing users:', users.length);
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
  } catch (err) {
    console.error('FAILED to read users table:', err.message);
  }

  // Test 2: Mimic Registration
  const testEmail = 'debug_test@example.com';
  const testPass = 'password123';
  
  try {
    // Cleanup first
    db.prepare('DELETE FROM users WHERE email = ?').run(testEmail);
    
    console.log('Attempting registration...');
    const hashed = await bcrypt.hash(testPass, 10);
    const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Debug User', testEmail, hashed, 'user');
    console.log('Registration successful, ID:', result.lastInsertRowid);
  } catch (err) {
    console.error('FAILED registration:', err.message);
  }

  // Test 3: Mimic Login
  try {
    console.log('Attempting login...');
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
    if (!user) throw new Error('User not found after registration');
    
    const isMatch = await bcrypt.compare(testPass, user.password);
    console.log('Password match result:', isMatch);
    
    if (isMatch) console.log('Login logic SUCCESS');
    else console.error('Login logic FAILED (password mismatch)');
  } catch (err) {
    console.error('FAILED login:', err.message);
  }

} catch (err) {
  console.error('CRITICAL DB ERROR:', err);
}
