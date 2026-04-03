import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'vivekanjan.db')

console.log(`Initializing SQLite database at ${dbPath}...`)

const db = new Database(dbPath)
db.pragma('foreign_keys = ON')

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image TEXT,
  price_inr INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  stock_quantity INTEGER DEFAULT 0,
  buy_links TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS anthologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT DEFAULT 'payment_pending',
  payment_status TEXT DEFAULT 'pending',
  source TEXT,
  subtotal_inr INTEGER,
  delivery_charge_inr INTEGER DEFAULT 6000,
  platform_fee_inr INTEGER DEFAULT 800,
  gst_amount_inr INTEGER,
  total_amount_inr INTEGER,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shipping_name TEXT,
  shipping_email TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_pincode TEXT,
  shipping_phone TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  book_id INTEGER,
  title_snapshot TEXT,
  cover_image_snapshot TEXT,
  unit_price_inr INTEGER,
  quantity INTEGER,
  line_total_inr INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(book_id) REFERENCES books(id)
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`

schema.split(';').forEach(stmt => {
  if (stmt.trim()) {
    db.exec(stmt)
  }
})

console.log('✅ Database schema initialized')

// Create admin user if it doesn't exist
const bcrypt = await import('bcryptjs')
const adminEmail = 'admin@vivekanjan.com'
const customerEmail = 'customer@vivekanjan.com'

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)
if (!existing) {
  const adminHash = await bcrypt.default.hash('Admin@12345', 10)
  const customerHash = await bcrypt.default.hash('Customer@12345', 10)

  db.prepare(`
    INSERT INTO users(name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run('Admin User', adminEmail, adminHash, 'admin')

  db.prepare(`
    INSERT INTO users(name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run('Test Customer', customerEmail, customerHash, 'customer')

  console.log('✅ Default users created')
}

db.close()
console.log('✅ Initialization complete')
