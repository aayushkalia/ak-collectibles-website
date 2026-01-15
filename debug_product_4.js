require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

console.log('Script started');
if (!process.env.POSTGRES_URL) {
    console.error('ERROR: POSTGRES_URL is missing in environment!');
    process.exit(1);
} else {
    console.log('POSTGRES_URL found (length: ' + process.env.POSTGRES_URL.length + ')');
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000 // Fail fast
});

async function checkProduct() {
  try {
    console.log('Connecting to DB...');
    const client = await pool.connect();
    console.log('Connected!');
    
    console.log('Fetching Product #4...');
    const res = await client.query('SELECT * FROM products WHERE id = $1', [4]);
    console.log('Product count:', res.rows.length);
    if (res.rows.length > 0) {
        console.log('Product Data:', JSON.stringify(res.rows[0], null, 2));
    } else {
        console.log('Product #4 NOT FOUND in DB');
    }

    console.log('Fetching Media for #4...');
    const mediaRes = await client.query('SELECT * FROM product_media WHERE product_id = $1', [4]);
    console.log('Media count:', mediaRes.rows.length);
    console.log('Media Data:', JSON.stringify(mediaRes.rows, null, 2));

    client.release();
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    console.log('Closing pool...');
    await pool.end();
    console.log('Done.');
  }
}

checkProduct();
