const Database = require('better-sqlite3');
const db = new Database('database.db');

console.log('Migrating settings table...');

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed default values if not exists
const insert = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
insert.run('upi_id', '9876543210@upi');
insert.run('whatsapp_number', '9876543210');
insert.run('instructions', 'Please share the screenshot of your payment.');

console.log('Settings table ready.');
