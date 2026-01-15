const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('Usage: node delete_user.js <email>');
  process.exit(1);
}

const email = args[0];

try {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    console.log(`User with email ${email} not found.`);
    process.exit(1);
  }

  // Optional: Prevent deleting the last admin? 
  // For now, simple delete.

  const confirm = process.argv.includes('--force'); // Simple safety, though CLI usually assumes intent. 
  // Let's just delete for simplicity as requested, or maybe just ask for confirmation?
  // Scripts are synchronous.

  db.prepare('DELETE FROM users WHERE email = ?').run(email);
  console.log(`Success! User ${email} has been deleted.`);

} catch (error) {
  console.error('Error:', error.message);
}
