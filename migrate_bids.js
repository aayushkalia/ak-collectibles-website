const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('Migrating "bids" table...');

try {
  // Drop the old table
  db.exec('DROP TABLE IF EXISTS bids');
  console.log('Dropped old bids table.');

  // Create new table with user_id
  db.exec(`
    CREATE TABLE bids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        user_id INTEGER,
        amount REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  console.log('Created new bids table with user_id column.');
} catch (e) {
  console.error('Migration failed:', e);
}
