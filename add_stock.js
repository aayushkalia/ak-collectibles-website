const Database = require('better-sqlite3');
const db = new Database('antiques.db');

try {
    console.log('--- Migrating PRODUCTS (Adding stock) ---');
    const productsInfo = db.prepare('PRAGMA table_info(products)').all();
    
    if (!productsInfo.some(c => c.name === 'stock')) {
         console.log('Adding stock to products...');
         db.prepare("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 1").run();
    } else {
        console.log('stock column already exists.');
    }

    console.log('\n--- VERIFICATION ---');
    console.log('Products Columns:', db.prepare('PRAGMA table_info(products)').all().map(c => c.name));

} catch (err) {
    console.error('Migration Failed:', err);
}
