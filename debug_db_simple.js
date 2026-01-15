require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
      rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
});

async function run() {
    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('Connected!');
        
        const res = await client.query('SELECT id, title FROM products LIMIT 5');
        console.log('Products:', res.rows);
        
        client.release();
    } catch(e) {
        console.error('DB Error:', e);
    } finally {
        pool.end();
    }
}
run();
