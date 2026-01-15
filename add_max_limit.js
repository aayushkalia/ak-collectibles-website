const Database = require('better-sqlite3');
const db = new Database('antiques.db');

try {
    console.log('--- Migrating PRODUCTS (Adding max_per_user) ---');
    const productsInfo = db.prepare('PRAGMA table_info(products)').all();
    
    if (!productsInfo.some(c => c.name === 'max_per_user')) {
         console.log('Adding max_per_user to products...');
         db.prepare("ALTER TABLE products ADD COLUMN max_per_user INTEGER DEFAULT NULL").run();
    } else {
        console.log('max_per_user column already exists.');
    }

    console.log('\n--- VERIFICATION ---');
    console.log('Products Columns:', db.prepare('PRAGMA table_info(products)').all().map(c => c.name));
    console.log('Orders Columns:', db.prepare('PRAGMA table_info(orders)').all().map(c => c.name));

} catch (err) {
    console.error('Migration Failed:', err);
}
