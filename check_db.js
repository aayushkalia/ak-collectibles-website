const Database = require('better-sqlite3');
const fs = require('fs');

try {
    const db = new Database('antiques.db', { readonly: true }); // Read only to avoid locks
    
    const productsCols = db.prepare('PRAGMA table_info(products)').all().map(c => c.name);
    const ordersCols = db.prepare('PRAGMA table_info(orders)').all().map(c => c.name);
    
    const output = `
Products Columns: ${productsCols.join(', ')}
Orders Columns: ${ordersCols.join(', ')}
    `;
    
    fs.writeFileSync('schema_check.txt', output);
    console.log('Schema check written to schema_check.txt');
} catch (err) {
    fs.writeFileSync('schema_check.txt', 'Error: ' + err.message);
}
