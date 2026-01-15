const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.db');
const db = new Database(dbPath);

console.log('Checking schema for "bids" table:');
try {
  const info = db.prepare("PRAGMA table_info(bids)").all();
  console.log(info);
} catch (e) {
  console.error(e);
}
