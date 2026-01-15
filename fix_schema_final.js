const Database = require('better-sqlite3');
const db = new Database('database.db');

function addColumn(table, column, definition) {
    try {
        console.log(`Attempting to add ${column} to ${table}...`);
        db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
        console.log(`✅ Successfully added ${column} to ${table}`);
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log(`ℹ️ Column ${column} already exists in ${table}`);
        } else {
            console.error(`❌ Failed to add ${column} to ${table}:`, err.message);
        }
    }
}

console.log('--- STARTING SCHEMA REPAIR ---');

// 1. Fix Orders Table
addColumn('orders', 'tracking_id', 'TEXT');

// 2. Fix Products Table
addColumn('products', 'stock', 'INTEGER DEFAULT 1');
addColumn('products', 'max_per_user', 'INTEGER');

// 3. Verify
console.log('\n--- VERIFICATION ---');
const productsCols = db.prepare('PRAGMA table_info(products)').all();
const ordersCols = db.prepare('PRAGMA table_info(orders)').all();

console.log('Orders Columns:', ordersCols.map(c => c.name).join(', '));
console.log('Products Columns:', productsCols.map(c => c.name).join(', '));

if (!ordersCols.some(c => c.name === 'tracking_id')) console.error('CRITICAL: tracking_id still missing!');
if (!productsCols.some(c => c.name === 'stock')) console.error('CRITICAL: stock still missing!');
if (!productsCols.some(c => c.name === 'max_per_user')) console.error('CRITICAL: max_per_user still missing!');
