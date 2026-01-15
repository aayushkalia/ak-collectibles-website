const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Database = require('better-sqlite3');

const dbPath = path.join(process.cwd(), 'database.db');

try {
  // 1. Delete existing database
  if (fs.existsSync(dbPath)) {
    console.log('Deleting existing database...');
    fs.unlinkSync(dbPath);
  }

  // 2. Run seed script
  console.log('Running seed script...');
  execSync('node src/lib/seed.js', { stdio: 'inherit' });

  // 3. Verify data
  const db = new Database(dbPath);
  const products = db.prepare('SELECT * FROM products').all();
  
  console.log('\nVerification Results:');
  console.log(`Total products found: ${products.length}`);
  products.forEach(p => {
    console.log(`- ${p.title} (Auction: ${p.is_auction}, End: ${p.auction_end_time})`);
  });

  if (products.length === 3) {
    console.log('\nSUCCESS: All products seeded correctly.');
  } else {
    console.error(`\nFAILURE: Expected 3 products, found ${products.length}`);
  }

} catch (error) {
  console.error('\nVerification failed:', error.message);
}
