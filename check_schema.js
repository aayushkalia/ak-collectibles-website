const Database = require('better-sqlite3');
const db = new Database('antiques.db');

console.log('--- PRODUCTS Schema ---');
console.log(db.prepare('PRAGMA table_info(products)').all());

console.log('\n--- ORDERS Schema ---');
console.log(db.prepare('PRAGMA table_info(orders)').all());

console.log('\n--- BIDS Schema ---');
console.log(db.prepare('PRAGMA table_info(bids)').all());
