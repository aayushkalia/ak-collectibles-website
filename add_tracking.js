const Database = require('better-sqlite3');
const db = new Database('antiques.db');

try {
    console.log('--- Migrating ORDERS (Adding tracking_id) ---');
    const ordersInfo = db.prepare('PRAGMA table_info(orders)').all();
    
    if (!ordersInfo.some(c => c.name === 'tracking_id')) {
         console.log('Adding tracking_id to orders...');
         db.prepare("ALTER TABLE orders ADD COLUMN tracking_id TEXT").run();
    } else {
        console.log('tracking_id column already exists.');
    }

    console.log('\n--- VERIFICATION ---');
    console.log('Orders Columns:', db.prepare('PRAGMA table_info(orders)').all().map(c => c.name));

} catch (err) {
    console.error('Migration Failed:', err);
}
