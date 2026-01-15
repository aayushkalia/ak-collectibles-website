const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('database.db', { readonly: true });

const products = db.prepare('PRAGMA table_info(products)').all().map(c => c.name);
const orders = db.prepare('PRAGMA table_info(orders)').all().map(c => c.name);

fs.writeFileSync('final_check.txt', `Products: ${products.join(',')}\nOrders: ${orders.join(',')}`);
