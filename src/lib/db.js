import { Pool } from 'pg';

let pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  if (!global.pool) {
    global.pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  pool = global.pool;
}

const db = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};

export default db;
