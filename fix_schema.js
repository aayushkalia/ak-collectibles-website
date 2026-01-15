const Database = require('better-sqlite3');
const db = new Database('antiques.db');

try {
    console.log('--- Migrating PRODUCTS ---');
    const productsInfo = db.prepare('PRAGMA table_info(products)').all();
    
    if (!productsInfo.some(c => c.name === 'shipping_cost')) {
        console.log('Adding shipping_cost to products...');
        db.prepare('ALTER TABLE products ADD COLUMN shipping_cost REAL DEFAULT 0').run();
    }
    
    if (!productsInfo.some(c => c.name === 'status')) {
        console.log('Adding status to products...');
        db.prepare("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'available'").run();
    }

    console.log('--- Migrating ORDERS ---');
    const ordersInfo = db.prepare('PRAGMA table_info(orders)').all();
    
    if (!ordersInfo.some(c => c.name === 'status')) {
         console.log('Adding status to orders...');
         db.prepare("ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'").run();
    }

    console.log('\n--- VERIFICATION ---');
    console.log('Products:', db.prepare('PRAGMA table_info(products)').all().map(c => c.name));
    console.log('Orders:', db.prepare('PRAGMA table_info(orders)').all().map(c => c.name));

} catch (err) {
    console.error('Migration Failed:', err);
}
