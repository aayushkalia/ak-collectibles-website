const Database = require('better-sqlite3');
const db = new Database('database.db');

console.log('Fixing stale product statuses...');

// Fix: Set status='available' if stock > 0 (for non-auctions or active auctions)
const result = db.prepare(`
  UPDATE products 
  SET status = 'available' 
  WHERE stock > 0 AND status = 'sold'
`).run();

console.log(`Updated ${result.changes} products to 'available'.`);

// Verify 'hg'
const hg = db.prepare("SELECT title, stock, status FROM products WHERE title LIKE '%hg%'").all();
console.log('Current state of "hg" products:', hg);
