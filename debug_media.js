const Database = require('better-sqlite3');
const db = new Database('database.db');

console.log('--- Products ---');
const products = db.prepare('SELECT id, title, image_url FROM products').all();
console.table(products);

console.log('--- Product Media ---');
const media = db.prepare('SELECT * FROM product_media').all();
console.table(media);
