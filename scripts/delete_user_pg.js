const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email to delete.');
  console.log('Usage: node scripts/delete_user_pg.js <email>');
  process.exit(1);
}

async function deleteUser() {
  const client = await pool.connect();
  try {
    const res = await client.query('DELETE FROM users WHERE email = $1 RETURNING id, name, role', [email]);
    
    if (res.rowCount === 0) {
      console.log(`User with email ${email} not found.`);
    } else {
      console.log(`✅ User deleted successfully:`);
      console.log(`   Name: ${res.rows[0].name}`);
      console.log(`   Role: ${res.rows[0].role}`);
    }
  } catch (err) {
    console.error('Error deleting user:', err);
  } finally {
    client.release();
    pool.end();
  }
}

deleteUser();
