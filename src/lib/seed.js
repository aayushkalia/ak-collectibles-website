const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.db');
const db = new Database(dbPath);

const bcrypt = require('bcryptjs');

// ... (existing imports)

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- 'user' or 'admin'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL,
    image_url TEXT,
    category TEXT,
    is_auction BOOLEAN DEFAULT 0,
    auction_end_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`;

const seedData = [
  {
    title: 'Ancient Roman Coin',
    description: 'Authentic silver denarius from the 2nd century AD.',
    price: 150.00,
    image_url: 'https://placehold.co/400x400/1A3C2A/D4AF37?text=Roman+Coin',
    category: 'Coins',
    is_auction: 1,
    auction_end_time: new Date(Date.now() + 86400000 * 3).toISOString() // 3 days from now
  },
  {
    title: 'Rare Penny Black Stamp',
    description: 'The world\'s first adhesive postage stamp used in a public postal system.',
    price: 1200.00,
    image_url: 'https://placehold.co/400x400/1A3C2A/D4AF37?text=Penny+Black',
    category: 'Stamps',
    is_auction: 0,
    auction_end_time: null
  },
  {
    title: 'Vintage Pocket Watch',
    description: 'Gold-plated mechanical pocket watch from the 1920s.',
    price: 350.00,
    image_url: 'https://placehold.co/400x400/1A3C2A/D4AF37?text=Pocket+Watch',
    category: 'Antiques',
    is_auction: 0,
    auction_end_time: null
  }
];

async function seed() {
  console.log('Seeding database...');
  db.exec(schema);

  // Seed Users
  const userCount = db.prepare('SELECT count(*) as count FROM users').get();
  if (userCount.count === 0) {
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
    `);

    insertUser.run('Admin User', 'admin@kalia.com', hashedPassword, 'admin');
    insertUser.run('Test User', 'user@test.com', hashedPassword, 'user');
    console.log('Inserted seed users.');
  }

  // Seed Products
  const insertProduct = db.prepare(`
    INSERT INTO products (title, description, price, image_url, category, is_auction, auction_end_time)
    VALUES (@title, @description, @price, @image_url, @category, @is_auction, @auction_end_time)
  `);

  const count = db.prepare('SELECT count(*) as count FROM products').get();
  
  if (count.count === 0) {
    for (const product of seedData) {
      insertProduct.run(product);
    }
    console.log('Inserted seed data.');
  } else {
    console.log('Products already exist. Skipping product seed.');
  }
}

seed();
