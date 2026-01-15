const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('❌ Error: POSTGRES_URL is missing from .env.local');
    process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  console.log('✅ Connected to Database');
  
  try {
    console.log('🔄 Checking if column exists...');
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'is_visible'
    `);

    if (checkRes.rows.length === 0) {
        console.log('⚠️ Column missing. Adding is_visible...');
        await client.query(`
            ALTER TABLE products 
            ADD COLUMN is_visible BOOLEAN DEFAULT TRUE
        `);
        console.log('✅ Column is_visible ADDED successfully.');
    } else {
        console.log('ℹ️ Column is_visible already exists.');
    }

  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
