require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createAdmin() {
  const email = 'admin@kalia.com'; // Change this if you want a different email
  const password = 'password123'; // Change this if needed
  
  if (!process.argv[2]) {
      console.log('Usage: node scripts/create_admin_pg.js [email] [password]');
      console.log('Using defaults: admin@kalia.com / password123');
  }
  
  const targetEmail = process.argv[2] || email;
  const targetPass = process.argv[3] || password;

  const client = await pool.connect();
  try {
    const hashedPassword = await bcrypt.hash(targetPass, 10);
    
    // Check if exists
    const res = await client.query('SELECT * FROM users WHERE email = $1', [targetEmail]);
    if (res.rows.length > 0) {
        console.log(`User ${targetEmail} already exists. Updating to admin...`);
        await client.query('UPDATE users SET role = $1, password = $2 WHERE email = $3', ['admin', hashedPassword, targetEmail]);
    } else {
        console.log(`Creating new admin user ${targetEmail}...`);
        await client.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', 
            ['Admin User', targetEmail, hashedPassword, 'admin']);
    }
    console.log('Admin user ensured.');
  } catch (e) {
    console.error('Failed to create admin:', e);
  } finally {
    client.release();
    pool.end();
  }
}

createAdmin();
