import crypto from 'node:crypto'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query as sqlQuery, withTransaction, pool, db } from './db-sqlite.js'
import './initDb-sqlite.js' // Initialize database schema on startup

// Convert PostgreSQL SQL to SQLite SQL
function toSQLite(sql, params = []) {
  // Replace $1, $2, etc with ?
  let converted = sql
  for (let i = params.length; i > 0; i--) {
    converted = converted.replace(new RegExp('\\$' + i, 'g'), '?')
  }
  // Remove RETURNING clause
  converted = converted.replace(/\s+RETURNING\s+.*/gi, '')
  return { sql: converted, params }
}

async function query(sql, params = []) {
  const { sql: sqliteSql, params: sqliteParams } = toSQLite(sql, params)
  return sqlQuery(sqliteSql, sqliteParams)
}

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT || 8000)
const HOST = process.env.HOST || '0.0.0.0'
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const GST_RATE = 0.18
const DELIVERY_CHARGE = 60
const PLATFORM_FEE = 8

function toCamelBook(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    coverImage: row.cover_image,
    price: row.price_inr,
    currency: row.currency,
    stockQuantity: row.stock_quantity,
    buyLinks: row.buy_links || [],
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function makeOrderNumber() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  return `ORD-${stamp}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

function authorize(req, res, next) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required' })
  }

  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to access this resource' })
  }
  next()
}

app.get('/health', async (_req, res) => {
  try {
    const [books, anthologies, orders, contacts] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM books'),
      query('SELECT COUNT(*)::int AS count FROM anthologies'),
      query('SELECT COUNT(*)::int AS count FROM orders'),
      query('SELECT COUNT(*)::int AS count FROM contacts'),
    ])

    res.json({
      status: 'ok',
      database: 'ready',
      counts: {
        books: books.rows[0].count,
        anthologies: anthologies.rows[0].count,
        orders: orders.rows[0].count,
        contacts: contacts.rows[0].count,
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Health check failed', details: String(error.message || error) })
  }
})

app.get('/public/books', async (_req, res) => {
  const result = await query('SELECT * FROM books WHERE is_active = true ORDER BY id ASC')
  res.json({ books: result.rows.map(toCamelBook) })
})

app.get('/public/anthologies', async (_req, res) => {
  const result = await query('SELECT * FROM anthologies WHERE is_active = true ORDER BY id ASC')
  res.json({ anthologies: result.rows })
})

app.post('/signup', async (req, res) => {
  const name = String(req.body.name || req.body.fullName || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const username = String(req.body.username || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'name, email, username, and password are required' })
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'username must be at least 3 characters long' })
  }

  if (!/^[a-z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: 'username can only contain lowercase letters, numbers, underscores, and hyphens' })
  }

  const emailExists = await query('SELECT id FROM users WHERE email = ?', [email])
  if (emailExists.rowCount > 0) {
    return res.status(409).json({ error: 'An account with that email already exists' })
  }

  const usernameExists = await query('SELECT id FROM users WHERE username = ?', [username])
  if (usernameExists.rowCount > 0) {
    return res.status(409).json({ error: 'That username is already taken' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await query(
    `INSERT INTO users(name, email, username, password_hash, role)
     VALUES (?, ?, ?, ?, 'customer')`,
    [name, email, username, passwordHash],
  )

  // Fetch the created user
  const result = await query('SELECT * FROM users WHERE email = ?', [email])
  const user = result.rows[0]
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email, username: user.username, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
  return res.status(201).json({
    message: 'Account created',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  })
})

app.post('/signin', async (req, res) => {
  const emailOrUsername = String(req.body.emailOrUsername || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'email/username and password are required' })
  }

  // Try to find user by email or username
  const result = await query(
    'SELECT * FROM users WHERE email = ? OR username = ?',
    [emailOrUsername, emailOrUsername]
  )
  
  if (result.rowCount === 0) {
    return res.status(401).json({ error: 'Invalid email/username or password' })
  }

  const user = result.rows[0]
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email/username or password' })
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email, username: user.username, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
  return res.json({
    message: 'Signed in',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  })
})

// OAuth user sync endpoint - for Clerk and other OAuth providers
app.post('/auth/oauth-sync', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    let username = String(req.body.username || '').trim().toLowerCase()

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' })
    }

    // Check if user exists by email
    const existingUser = await query('SELECT * FROM users WHERE email = ?', [email])
    
    if (existingUser.rowCount > 0) {
      // User exists, return their JWT
      const user = existingUser.rows[0]
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email, username: user.username, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      return res.json({
        message: 'OAuth user authenticated',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      })
    }

    // User doesn't exist - create new account
    // Generate username from email first
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 20)
    
    // Check if provided username is valid and not taken
    let finalUsername = null
    if (username && username.length >= 3 && /^[a-z0-9_-]+$/.test(username)) {
      const usernameCheck = await query('SELECT id FROM users WHERE username = ?', [username])
      if (usernameCheck.rowCount === 0) {
        finalUsername = username
      }
    }
    
    // If provided username is invalid/taken, generate a unique one
    if (!finalUsername) {
      let counter = 0
      let checkUsername = baseUsername
      while (true) {
        const check = await query('SELECT id FROM users WHERE username = ?', [checkUsername])
        if (check.rowCount === 0) {
          finalUsername = checkUsername
          break
        }
        counter += 1
        checkUsername = `${baseUsername}${counter}`
        if (counter > 100) throw new Error('Could not generate unique username')
      }
    }

    // Generate a random password hash for OAuth users (they won't use it)
    const randomPassword = crypto.randomBytes(32).toString('hex')
    const passwordHash = await bcrypt.hash(randomPassword, 10)

    // Create new user
    await query(
      `INSERT INTO users(name, email, username, password_hash, role)
       VALUES (?, ?, ?, ?, 'customer')`,
      [name, email, finalUsername, passwordHash]
    )

    // Fetch the created user
    const result = await query('SELECT * FROM users WHERE email = ?', [email])
    const user = result.rows[0]
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, username: user.username, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      message: 'OAuth user created and authenticated',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('OAuth sync error:', error)
    res.status(500).json({ error: error.message || 'OAuth synchronization failed' })
  }
})

app.get('/cart', authorize, async (req, res) => {
  const result = await query(
    `SELECT c.id AS item_id, c.quantity, b.*
     FROM cart_items c
     JOIN books b ON b.id = c.book_id
     WHERE c.user_id = $1
     ORDER BY c.updated_at DESC`,
    [req.user.id],
  )

  const items = result.rows.map((row) => ({
    itemId: row.item_id,
    quantity: row.quantity,
    lineTotal: row.quantity * row.price_inr,
    book: toCamelBook(row),
  }))

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0)
  res.json({ items, total, currency: 'INR' })
})

app.post('/cart/add', authorize, async (req, res) => {
  const bookId = Number(req.body.bookId || req.body.book_id)
  const quantity = Number(req.body.quantity || 1)

  if (!Number.isInteger(bookId) || bookId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'bookId and quantity must be positive integers' })
  }

  const book = await query('SELECT id FROM books WHERE id = $1 AND is_active = true', [bookId])
  if (book.rowCount === 0) {
    return res.status(404).json({ error: 'Book not found' })
  }

  await query(
    `INSERT INTO cart_items(user_id, book_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, book_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()`,
    [req.user.id, bookId, quantity],
  )

  res.status(201).json({ message: 'Item added to cart' })
})

app.post('/cart/checkout', authorize, async (req, res) => {
  const shippingName = String(req.body.shippingName || req.body.shipping_name || '').trim() || null
  const shippingEmail = String(req.body.shippingEmail || req.body.shipping_email || '').trim() || null
  const shippingAddress = String(req.body.shippingAddress || req.body.shipping_address || '').trim() || null
  const shippingCity = String(req.body.shippingCity || req.body.shipping_city || '').trim() || null
  const shippingPincode = String(req.body.shippingPincode || req.body.shipping_pincode || '').trim() || null
  const shippingPhone = String(req.body.shippingPhone || req.body.shipping_phone || '').trim() || null
  const notes = String(req.body.notes || '').trim() || null

  try {
    const payload = await withTransaction(async (client) => {
      const cart = await client.query(
        `SELECT c.book_id, c.quantity, b.title, b.cover_image, b.price_inr, b.stock_quantity
         FROM cart_items c
         JOIN books b ON b.id = c.book_id
         WHERE c.user_id = $1
         ORDER BY c.id ASC`,
        [req.user.id],
      )

      if (cart.rowCount === 0) {
        throw new Error('Cart is empty')
      }

      for (const row of cart.rows) {
        if (row.quantity > row.stock_quantity) {
          throw new Error(`Insufficient stock for ${row.title}`)
        }
      }

      const subtotalRupees = cart.rows.reduce((sum, row) => sum + row.quantity * row.price_inr, 0)
      const subtotalPaise = subtotalRupees * 100
      const gstPaise = Math.round(subtotalPaise * GST_RATE)
      const deliveryPaise = DELIVERY_CHARGE * 100
      const platformPaise = PLATFORM_FEE * 100
      const totalPaise = subtotalPaise + gstPaise + deliveryPaise + platformPaise
      const orderNumber = makeOrderNumber()

      const insertOrder = await client.query(
        `INSERT INTO orders(
          order_number, user_id, status, payment_status, source,
          subtotal_inr, delivery_charge_inr, platform_fee_inr, gst_amount_inr, total_amount_inr,
          shipping_name, shipping_email, shipping_address, shipping_city, shipping_pincode, shipping_phone, notes
        ) VALUES ($1, $2, 'payment_pending', 'pending', 'cart', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          orderNumber,
          req.user.id,
          subtotalPaise,
          deliveryPaise,
          platformPaise,
          gstPaise,
          totalPaise,
          shippingName,
          shippingEmail,
          shippingAddress,
          shippingCity,
          shippingPincode,
          shippingPhone,
          notes,
        ],
      )

      const order = insertOrder.rows[0]

      for (const item of cart.rows) {
        await client.query(
          `INSERT INTO order_items(order_id, book_id, title_snapshot, cover_image_snapshot, unit_price_inr, quantity, line_total_inr)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [order.id, item.book_id, item.title, item.cover_image, item.price_inr, item.quantity, item.price_inr * item.quantity],
        )
      }

      await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id])

      return {
        order,
        priceBreakdown: {
          subtotal: `₹${(subtotalPaise / 100).toFixed(2)}`,
          gst: `₹${(gstPaise / 100).toFixed(2)}`,
          delivery: `₹${(deliveryPaise / 100).toFixed(2)}`,
          platformFee: `₹${(platformPaise / 100).toFixed(2)}`,
          total: `₹${(totalPaise / 100).toFixed(2)}`,
        },
      }
    })

    res.status(201).json({
      message: 'Order created. Proceed to payment.',
      order: {
        id: payload.order.id,
        orderNumber: payload.order.order_number,
        status: payload.order.status,
        paymentStatus: payload.order.payment_status,
        source: payload.order.source,
        totalAmountInr: payload.order.total_amount_inr,
        priceBreakdown: payload.priceBreakdown,
      },
      priceBreakdown: payload.priceBreakdown,
    })
  } catch (error) {
    const message = String(error.message || error)
    if (message === 'Cart is empty' || message.startsWith('Insufficient stock')) {
      return res.status(400).json({ error: message })
    }
    return res.status(500).json({ error: 'Checkout failed', details: message })
  }
})

app.get('/customer/orders', authorize, async (req, res) => {
  const result = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id])
  res.json({
    orders: result.rows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      paymentStatus: row.payment_status,
      source: row.source,
      totalAmountInr: row.total_amount_inr,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  })
})

app.post('/admin/books/:id/stock', authorize, requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const operation = String(req.body.operation || 'add').trim().toLowerCase()
  const quantity = Number(req.body.quantity)

  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'Invalid stock request' })
  }

  const result = await withTransaction(async (client) => {
    const before = await client.query('SELECT * FROM books WHERE id = $1', [id])
    if (before.rowCount === 0) {
      throw new Error('Book not found')
    }

    const current = before.rows[0].stock_quantity
    let next = current
    if (operation === 'set') next = quantity
    else if (operation === 'subtract') next = current - quantity
    else next = current + quantity

    if (next < 0) {
      throw new Error('Resulting stock cannot be negative')
    }

    const updated = await client.query(
      'UPDATE books SET stock_quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [next, id],
    )

    return { before: current, after: next, book: updated.rows[0] }
  })

  res.json({
    message: 'Stock updated',
    previousStock: result.before,
    newStock: result.after,
    book: toCamelBook(result.book),
  })
})

app.post('/initiate-payment', authorize, async (req, res) => {
  const orderId = String(req.body.orderId || '').trim()
  if (!orderId) return res.status(400).json({ error: 'orderId is required' })

  const select = await query(
    'SELECT * FROM orders WHERE order_number = $1 AND user_id = $2',
    [orderId, req.user.id],
  )
  if (select.rowCount === 0) return res.status(404).json({ error: 'Order not found' })

  const order = select.rows[0]
  if (order.payment_status === 'completed') return res.status(400).json({ error: 'Order is already paid' })

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return res.status(400).json({ error: 'Razorpay is not configured' })
  }

  const payload = {
    amount: order.total_amount_inr,
    currency: 'INR',
    receipt: `receipt#${order.order_number}`,
    notes: {
      order_id: order.order_number,
      customer_email: req.user.email,
    },
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    return res.status(400).json({ error: 'Failed to initialize payment', details: data.error?.description || 'Razorpay error' })
  }

  await query('UPDATE orders SET razorpay_order_id = $1, updated_at = NOW() WHERE id = $2', [data.id, order.id])

  res.json({
    message: 'Payment initialization successful',
    order_number: order.order_number,
    razorpay_order_id: data.id,
    amount: order.total_amount_inr,
    currency: 'INR',
    customer_email: req.user.email,
    customer_name: req.user.name,
  })
})

app.post('/verify-payment', authorize, async (req, res) => {
  const orderId = String(req.body.orderId || '').trim()
  const razorpayOrderId = String(req.body.razorpayOrderId || '').trim()
  const razorpayPaymentId = String(req.body.razorpayPaymentId || '').trim()
  const razorpaySignature = String(req.body.razorpaySignature || '').trim()

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ error: 'orderId, razorpayOrderId, razorpayPaymentId, and razorpaySignature are required' })
  }

  const orderResult = await query('SELECT * FROM orders WHERE order_number = $1 AND user_id = $2', [orderId, req.user.id])
  if (orderResult.rowCount === 0) {
    return res.status(404).json({ error: 'Order not found' })
  }

  const order = orderResult.rows[0]
  if (order.razorpay_order_id !== razorpayOrderId) {
    return res.status(403).json({ error: 'Razorpay order ID mismatch' })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return res.status(400).json({ error: 'Razorpay is not configured' })
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expected !== razorpaySignature) {
    return res.status(403).json({ error: 'Payment signature verification failed' })
  }

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE orders
       SET razorpay_payment_id = $1, payment_status = 'completed', status = 'paid', updated_at = NOW()
       WHERE id = $2`,
      [razorpayPaymentId, order.id],
    )

    const items = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order.id])
    for (const item of items.rows) {
      if (item.book_id) {
        await client.query('UPDATE books SET stock_quantity = stock_quantity - $1, updated_at = NOW() WHERE id = $2', [item.quantity, item.book_id])
      }
    }
  })

  const updated = await query('SELECT * FROM orders WHERE id = $1', [order.id])
  const row = updated.rows[0]
  return res.json({
    message: 'Payment verified successfully',
    status: 'paid',
    order: {
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      paymentStatus: row.payment_status,
      source: row.source,
      totalAmountInr: row.total_amount_inr,
    },
  })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Resource not found' })
})

app.use((error, _req, res, _next) => {
  res.status(500).json({ error: 'Internal server error', details: String(error.message || error) })
})

const server = app.listen(PORT, HOST, () => {
  console.log(`Backend running at http://${HOST}:${PORT}`)
  console.log('Admin login: admin@vivekanjan.com / Admin@12345')
  console.log('Customer login: customer@vivekanjan.com / Customer@12345')
})

process.on('SIGINT', async () => {
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
})
