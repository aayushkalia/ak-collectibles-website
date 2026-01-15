const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Use connection string from env
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('POSTGRES_URL is not defined');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    const client = await pool.connect();
    console.log('Connected to database...');

    try {
        console.log('Adding is_visible column to products table...');
        
        // Add column if not exists
        await client.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE
        `);

        console.log('✅ Successfully added is_visible column');

        // Verify
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'is_visible'
        `);

        if (res.rows.length > 0) {
            console.log('Verification: Column exists:', res.rows[0]);
        } else {
            console.error('❌ Verification Failed: Column not found!');
        }

    } catch (e) {
        console.error('Migration Error:', e);
    } finally {
        client.release();
    }
  } catch (err) {
    console.error('Connection Error:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
