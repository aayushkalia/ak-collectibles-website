import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'database.db');
console.log('Opening database at:', dbPath); // LOG THE PATH

let db;

function initDB(database) {
  try {
    console.log('Checking database schema...');
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        price REAL,
        shipping_cost REAL DEFAULT 0,
        category TEXT,
        image_url TEXT,
        is_auction INTEGER DEFAULT 0,
        auction_end_time DATETIME,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        url TEXT,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_amount REAL,
        status TEXT DEFAULT 'pending',
        shipping_address TEXT,
        payment_method TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS bids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        user_id INTEGER,
        amount REAL,
        status TEXT DEFAULT 'valid',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // Self-healing: Check products schema 
    try {
      const prodInfo = database.prepare("PRAGMA table_info(products)").all();
      
      const hasStatus = prodInfo.some(col => col.name === 'status');
      if (!hasStatus) {
        console.log('Migrating products table: Ensuring status column...');
        database.prepare("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'available'").run();
      }

      const hasShipping = prodInfo.some(col => col.name === 'shipping_cost');
      if (!hasShipping) {
         console.log('Migrating products table: Ensuring shipping_cost column...');
         database.prepare("ALTER TABLE products ADD COLUMN shipping_cost REAL DEFAULT 0").run();
      }

      const hasStock = prodInfo.some(col => col.name === 'stock');
      if (!hasStock) {
         console.log('Migrating products table: Ensuring stock column...');
         database.prepare("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 1").run();
      }

      const hasMaxLimit = prodInfo.some(col => col.name === 'max_per_user');
      if (!hasMaxLimit) {
         console.log('Migrating products table: Ensuring max_per_user column...');
         database.prepare("ALTER TABLE products ADD COLUMN max_per_user INTEGER DEFAULT NULL").run();
      }

    } catch (migErr) {
      console.error('Product Migration check failed:', migErr);
    }

    // Self-healing: Check Orders Schema
    try {
        const orderInfo = database.prepare("PRAGMA table_info(orders)").all();
        if (!orderInfo.some(col => col.name === 'tracking_id')) {
             console.log('Migrating orders table: Ensuring tracking_id column...');
             database.prepare("ALTER TABLE orders ADD COLUMN tracking_id TEXT").run();
        }
    } catch (err) {
        console.error('Order Migration check failed:', err);
    }

    // Self-healing: Check schema (user_id and status)
    try {
      const bidInfo = database.prepare("PRAGMA table_info(bids)").all();
      const hasUserId = bidInfo.some(col => col.name === 'user_id');
      const hasStatus = bidInfo.some(col => col.name === 'status');
      
      if (!hasUserId || !hasStatus) {
        console.log('Migrating bids table: Ensuring user_id and status columns...');
        // Drop and recreate to be safe and clean
        database.exec('DROP TABLE IF EXISTS bids');
        database.exec(`
          CREATE TABLE bids (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            user_id INTEGER,
            amount REAL,
            status TEXT DEFAULT 'valid',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
          );
        `);
        console.log('Bids table migrated successfully.');
      }
    } catch (migErr) {
      console.error('Migration check failed:', migErr);
    }
    console.log('Database schema ensured.');
    
    // Check for admin
    const admin = database.prepare('SELECT * FROM users WHERE email = ?').get('admin@kalia.com');
    if (!admin) {
        console.log('Creating default admin user...');
        const hashed = bcrypt.hashSync('password123', 10);
        database.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin User', 'admin@kalia.com', hashed, 'admin');
        console.log('Default admin user created.');
    }
  } catch (error) {
    console.error('FAILED to initialize database schema:', error);
  }
}

if (process.env.NODE_ENV === 'production') {
  db = new Database(dbPath);
  initDB(db);
} else {
  if (!global.db) {
    global.db = new Database(dbPath, { verbose: console.log });
    global.db.pragma('journal_mode = WAL');
    initDB(global.db);
  }
  db = global.db;
}

export default db;
