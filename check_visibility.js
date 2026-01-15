const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkColumn() {
  try {
    const client = await pool.connect();
    console.log('Connected to DB');
    
    // Check for column
    const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_visible'
    `);

    if (res.rows.length > 0) {
        console.log('✅ Column is_visible EXISTS');
        console.log(res.rows[0]);
    } else {
        console.log('❌ Column is_visible is MISSING');
    }
    
    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

checkColumn();
