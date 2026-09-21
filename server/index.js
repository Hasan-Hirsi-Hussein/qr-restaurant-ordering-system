import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDb, query, getOne, run } from './db.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static images if requested directly
app.use('/images', express.static('public/images'));

// Socket.io Real-time connection
io.on('connection', (socket) => {
  console.log('⚡ Client connected to Socket.io:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to generate Order Number (e.g. TB-4092)
const generateOrderNumber = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TB-${randomNum}`;
};

// ------------------- API ROUTES -------------------

// POST Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await getOne(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const userRole = role || 'customer';
    const result = await run(
      `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), phone || '', password, userRole]
    );

    const newUser = await getOne(`SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?`, [result.id]);
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getOne(`SELECT * FROM users WHERE email = ? AND password = ?`, [
      email.toLowerCase().trim(),
      password,
    ]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Menu (Categories & Products)
app.get('/api/menu', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const categories = await query(`SELECT * FROM categories ORDER BY display_order ASC`);
    
    let sql = `SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id`;
    if (!showAll) {
      sql += ` WHERE p.is_available = 1`;
    }
    sql += ` ORDER BY p.id ASC`;

    const productsRaw = await query(sql);

    const products = productsRaw.map((p) => ({
      ...p,
      is_available: Boolean(p.is_available),
      doneness_options: p.doneness_options ? JSON.parse(p.doneness_options) : [],
      addon_options: p.addon_options ? JSON.parse(p.addon_options) : [],
    }));

    res.json({ categories, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Tables
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await query(`SELECT * FROM tables ORDER BY id ASC`);
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Table
app.post('/api/tables', async (req, res) => {
  try {
    const { table_number } = req.body;
    if (!table_number) return res.status(400).json({ error: 'Table number required' });
    const formatted = table_number.toUpperCase().startsWith('TB-')
      ? table_number.toUpperCase()
      : `TB-${table_number.padStart(2, '0')}`;
    
    const result = await run(`INSERT INTO tables (table_number) VALUES (?)`, [formatted]);
    const newTable = await getOne(`SELECT * FROM tables WHERE id = ?`, [result.id]);
    res.json(newTable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Table
app.delete('/api/tables/:id', async (req, res) => {
  try {
    await run(`DELETE FROM tables WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const { table_number, customer_name, items, notes, payment_method, payment_status } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.item_total;
    });

    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const service_charge = 0.00;
    const total_amount = Math.round((subtotal + tax + service_charge) * 100) / 100;
    const order_number = generateOrderNumber();
    const finalPayMethod = payment_method || 'Pay Cash at Table';
    const isCashMethod = finalPayMethod.toLowerCase().includes('cash');
    const finalPayStatus = payment_status || (isCashMethod ? 'Pending' : 'Paid');

    const orderRes = await run(
      `INSERT INTO orders (order_number, table_number, customer_name, status, est_prep_time, subtotal, tax, service_charge, total_amount, payment_method, payment_status, notes)
       VALUES (?, ?, ?, 'New', 15, ?, ?, ?, ?, ?, ?, ?)`,
      [order_number, table_number || 'TB-07', customer_name || 'Guest', subtotal, tax, service_charge, total_amount, finalPayMethod, finalPayStatus, notes || '']
    );

    const orderId = orderRes.id;

    for (const item of items) {
      await run(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, options, item_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.name,
          item.price,
          item.quantity,
          JSON.stringify(item.selectedOptions || []),
          item.item_total,
        ]
      );
    }

    const createdOrder = await getOne(`SELECT * FROM orders WHERE id = ?`, [orderId]);
    const createdItems = await query(`SELECT * FROM order_items WHERE order_id = ?`, [orderId]);
    
    const fullOrder = {
      ...createdOrder,
      items: createdItems.map((i) => ({
        ...i,
        options: i.options ? JSON.parse(i.options) : [],
      })),
    };

    // Calculate queue position (number of active orders ahead or including this one)
    const pendingOrders = await query(`SELECT id FROM orders WHERE status IN ('New', 'Accepted', 'Preparing') ORDER BY id ASC`);
    const queuePosition = pendingOrders.findIndex(o => o.id === orderId) + 1 || 1;
    fullOrder.queuePosition = queuePosition;

    // Broadcast to kitchen and customers
    io.emit('order_created', fullOrder);

    res.json(fullOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Update Order Payment Status
app.patch('/api/orders/:id/pay', async (req, res) => {
  try {
    const { payment_status, payment_method } = req.body;
    const orderId = req.params.id;

    let updateFields = [];
    let params = [];

    if (payment_status) {
      updateFields.push('payment_status = ?');
      params.push(payment_status);
    }
    if (payment_method) {
      updateFields.push('payment_method = ?');
      params.push(payment_method);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(orderId);

    await run(`UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`, params);

    const updatedOrder = await getOne(`SELECT * FROM orders WHERE id = ?`, [orderId]);
    const items = await query(`SELECT * FROM order_items WHERE order_id = ?`, [orderId]);

    const fullOrder = {
      ...updatedOrder,
      items: items.map((i) => ({
        ...i,
        options: i.options ? JSON.parse(i.options) : [],
      })),
    };

    io.emit('order_updated', fullOrder);
    res.json(fullOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Orders (for Kitchen & Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await query(`SELECT * FROM orders ORDER BY id DESC`);
    const fullOrders = [];

    for (const order of orders) {
      const items = await query(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
      fullOrders.push({
        ...order,
        items: items.map((i) => ({
          ...i,
          options: i.options ? JSON.parse(i.options) : [],
        })),
      });
    }

    res.json(fullOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Order by ID or Order Number
app.get('/api/orders/:id', async (req, res) => {
  try {
    const param = req.params.id;
    let order;
    if (isNaN(param)) {
      order = await getOne(`SELECT * FROM orders WHERE order_number = ?`, [param]);
    } else {
      order = await getOne(`SELECT * FROM orders WHERE id = ?`, [param]);
    }

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = await query(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);

    // Compute live queue position
    const pendingOrders = await query(`SELECT id FROM orders WHERE status IN ('New', 'Accepted', 'Preparing') AND id <= ? ORDER BY id ASC`, [order.id]);
    const queuePosition = pendingOrders.length || 1;

    res.json({
      ...order,
      queuePosition,
      items: items.map((i) => ({
        ...i,
        options: i.options ? JSON.parse(i.options) : [],
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Update Order Status & Est Prep Time
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, est_prep_time } = req.body;
    const orderId = req.params.id;

    let updateFields = [];
    let params = [];

    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }
    if (est_prep_time !== undefined) {
      updateFields.push('est_prep_time = ?');
      params.push(est_prep_time);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(orderId);

    await run(`UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`, params);

    const updatedOrder = await getOne(`SELECT * FROM orders WHERE id = ?`, [orderId]);
    const items = await query(`SELECT * FROM order_items WHERE order_id = ?`, [orderId]);

    const fullOrder = {
      ...updatedOrder,
      items: items.map((i) => ({
        ...i,
        options: i.options ? JSON.parse(i.options) : [],
      })),
    };

    // Broadcast update in real-time
    io.emit('order_updated', fullOrder);

    res.json(fullOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Admin Metrics & Daily Analytics Breakdown
app.get('/api/admin/metrics', async (req, res) => {
  try {
    const activeTables = await getOne(`SELECT COUNT(DISTINCT table_number) as count FROM orders WHERE status IN ('New', 'Preparing', 'Ready')`);
    const totalTables = await getOne(`SELECT COUNT(*) as count FROM tables`);
    const pendingOrders = await getOne(`SELECT COUNT(*) as count FROM orders WHERE status IN ('New', 'Preparing')`);
    const revenueRes = await getOne(`SELECT SUM(total_amount) as total, COUNT(*) as total_orders FROM orders WHERE status != 'Cancelled'`);

    // Today's date string YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRevenueRes = await getOne(`
      SELECT SUM(total_amount) as today_total, COUNT(*) as today_orders 
      FROM orders 
      WHERE status != 'Cancelled' AND substr(created_at, 1, 10) = ?
    `, [todayStr]);

    // First and latest order dates
    const dateRangeRes = await getOne(`
      SELECT MIN(substr(created_at, 1, 10)) as first_date, MAX(substr(created_at, 1, 10)) as latest_date 
      FROM orders
    `);

    // Daily breakdown from first launch day to current live orders
    const dailyBreakdown = await query(`
      SELECT 
        substr(created_at, 1, 10) as order_date,
        COUNT(*) as orders_count,
        ROUND(SUM(total_amount), 2) as daily_revenue,
        ROUND(SUM(CASE WHEN payment_status = 'Paid' THEN total_amount ELSE 0 END), 2) as paid_revenue,
        ROUND(SUM(CASE WHEN payment_status != 'Paid' THEN total_amount ELSE 0 END), 2) as pending_revenue,
        ROUND(SUM(CASE WHEN payment_method LIKE '%EVC%' THEN total_amount ELSE 0 END), 2) as evc_amount,
        ROUND(SUM(CASE WHEN payment_method LIKE '%ZAAD%' THEN total_amount ELSE 0 END), 2) as zaad_amount,
        ROUND(SUM(CASE WHEN payment_method LIKE '%Sahal%' THEN total_amount ELSE 0 END), 2) as sahal_amount,
        ROUND(SUM(CASE WHEN payment_method LIKE '%Card%' THEN total_amount ELSE 0 END), 2) as card_amount,
        ROUND(SUM(CASE WHEN payment_method LIKE '%Cash%' THEN total_amount ELSE 0 END), 2) as cash_amount
      FROM orders 
      WHERE status != 'Cancelled'
      GROUP BY substr(created_at, 1, 10)
      ORDER BY order_date DESC
    `);

    // Top selling dishes
    const topProducts = await query(`
      SELECT 
        oi.product_name,
        SUM(oi.quantity) as total_sold,
        ROUND(SUM(oi.item_total), 2) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'Cancelled'
      GROUP BY oi.product_name
      ORDER BY total_sold DESC
      LIMIT 6
    `);

    res.json({
      activeTablesCount: activeTables.count || 0,
      totalTablesCount: totalTables.count || 12,
      pendingOrdersCount: pendingOrders.count || 0,
      grossRevenue: revenueRes.total || 0,
      totalOrdersCount: revenueRes.total_orders || 0,
      todayRevenue: todayRevenueRes.today_total || 0,
      todayOrdersCount: todayRevenueRes.today_orders || 0,
      firstOrderDate: dateRangeRes.first_date || null,
      latestOrderDate: dateRangeRes.latest_date || todayStr,
      dailyBreakdown: dailyBreakdown || [],
      topProducts: topProducts || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN Products CRUD
app.post('/api/admin/products', async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, doneness_options, addon_options } = req.body;
    const result = await run(
      `INSERT INTO products (category_id, name, description, price, image_url, is_available, doneness_options, addon_options)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        category_id || 1,
        name,
        description || '',
        price,
        image_url || '/images/smash_burger.jpg',
        JSON.stringify(doneness_options || []),
        JSON.stringify(addon_options || []),
      ]
    );

    const newProd = await getOne(`SELECT * FROM products WHERE id = ?`, [result.id]);
    io.emit('menu_updated');
    res.json(newProd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, is_available, doneness_options, addon_options } = req.body;
    await run(
      `UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ?, doneness_options = ?, addon_options = ? WHERE id = ?`,
      [
        category_id,
        name,
        description,
        price,
        image_url,
        is_available ? 1 : 0,
        JSON.stringify(doneness_options || []),
        JSON.stringify(addon_options || []),
        req.params.id,
      ]
    );

    const updated = await getOne(`SELECT * FROM products WHERE id = ?`, [req.params.id]);
    io.emit('menu_updated');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/products/:id/availability', async (req, res) => {
  try {
    const { is_available } = req.body;
    await run(`UPDATE products SET is_available = ? WHERE id = ?`, [is_available ? 1 : 0, req.params.id]);
    const updated = await getOne(`SELECT * FROM products WHERE id = ?`, [req.params.id]);
    
    // Broadcast menu update so customers immediately see sold out status
    io.emit('menu_updated');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await run(`DELETE FROM products WHERE id = ?`, [req.params.id]);
    io.emit('menu_updated');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- RESTAURANT SETTINGS & BRANDING -------------------

// GET Restaurant Settings
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await getOne(`SELECT * FROM restaurant_settings WHERE id = 1`);
    if (!settings) {
      await run(`
        INSERT INTO restaurant_settings (id, restaurant_name, restaurant_tagline, logo_type, logo_icon, logo_url, phone, address, website, currency, audio_chime)
        VALUES (1, 'Le Bistro', 'Fine Dining & Fresh Taste', 'icon', 'Utensils', '', '+252 61 500 0000', 'Maka Al-Mukarama Street, Mogadishu', 'www.lebistro-restaurant.com', 'USD', 1)
      `);
      settings = await getOne(`SELECT * FROM restaurant_settings WHERE id = 1`);
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Restaurant Settings (Branding, Logo, Name, Phone, Address, etc.)
app.put('/api/settings', async (req, res) => {
  try {
    const {
      restaurant_name,
      restaurant_tagline,
      logo_type,
      logo_icon,
      logo_url,
      phone,
      address,
      website,
      currency,
      audio_chime
    } = req.body;

    await run(`
      UPDATE restaurant_settings SET
        restaurant_name = COALESCE(?, restaurant_name),
        restaurant_tagline = COALESCE(?, restaurant_tagline),
        logo_type = COALESCE(?, logo_type),
        logo_icon = COALESCE(?, logo_icon),
        logo_url = COALESCE(?, logo_url),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        website = COALESCE(?, website),
        currency = COALESCE(?, currency),
        audio_chime = COALESCE(?, audio_chime)
      WHERE id = 1
    `, [
      restaurant_name,
      restaurant_tagline,
      logo_type,
      logo_icon,
      logo_url,
      phone,
      address,
      website,
      currency,
      audio_chime !== undefined ? (audio_chime ? 1 : 0) : null
    ]);

    const updated = await getOne(`SELECT * FROM restaurant_settings WHERE id = 1`);

    // Real-time broadcast to all connected devices (Customer, Kitchen, Admin)
    io.emit('settings_updated', updated);

    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- FOOD REVIEWS & RATINGS -------------------

// POST Create Review / Rating
app.post('/api/reviews', async (req, res) => {
  try {
    const { order_id, product_id, product_name, table_number, customer_name, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const result = await run(
      `INSERT INTO reviews (order_id, product_id, product_name, table_number, customer_name, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id || null,
        product_id || null,
        product_name || 'General Order',
        table_number || '',
        customer_name || 'Guest',
        parseInt(rating),
        comment || ''
      ]
    );

    // If product_id specified, update product average rating
    if (product_id) {
      const avgRes = await getOne(`SELECT AVG(rating) as avg_rating, COUNT(*) as total_count FROM reviews WHERE product_id = ?`, [product_id]);
      if (avgRes && avgRes.avg_rating) {
        await run(`UPDATE products SET rating = ?, rating_count = ? WHERE id = ?`, [
          Math.round(avgRes.avg_rating * 10) / 10,
          avgRes.total_count,
          product_id
        ]);
        io.emit('menu_updated');
      }
    }

    const newReview = await getOne(`SELECT * FROM reviews WHERE id = ?`, [result.id]);
    io.emit('new_review', newReview);

    res.json({ success: true, review: newReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Reviews (supports ?product_id=... for specific dish)
app.get('/api/reviews', async (req, res) => {
  try {
    const { product_id } = req.query;
    let reviews;
    let stats;
    if (product_id) {
      reviews = await query(`SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC LIMIT 50`, [product_id]);
      stats = await getOne(`SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = ?`, [product_id]);
    } else {
      reviews = await query(`SELECT * FROM reviews ORDER BY id DESC LIMIT 50`);
      stats = await getOne(`SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews FROM reviews`);
    }
    res.json({
      reviews: reviews || [],
      avgRating: stats?.avg_rating || 4.8,
      totalReviews: stats?.total_reviews || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- BRANCHES / LOCATIONS -------------------

// GET All Branches
app.get('/api/branches', async (req, res) => {
  try {
    const { all } = req.query;
    const sql = all === 'true'
      ? `SELECT * FROM branches ORDER BY id ASC`
      : `SELECT * FROM branches WHERE is_active = 1 ORDER BY id ASC`;
    const branches = await query(sql);
    res.json(branches || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Branch
app.post('/api/branches', async (req, res) => {
  try {
    const { name, address, city, phone, opening_hours, image_url, maps_url } = req.body;
    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }
    const result = await run(
      `INSERT INTO branches (name, address, city, phone, opening_hours, image_url, maps_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name,
        address,
        city || 'Muqdisho',
        phone || '',
        opening_hours || '08:00 AM - 11:30 PM',
        image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
        maps_url || 'https://maps.google.com'
      ]
    );
    const newBranch = await getOne(`SELECT * FROM branches WHERE id = ?`, [result.id]);
    io.emit('branches_updated');
    res.json({ success: true, branch: newBranch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Branch
app.put('/api/branches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, phone, opening_hours, image_url, maps_url, is_active } = req.body;
    await run(
      `UPDATE branches SET
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        phone = COALESCE(?, phone),
        opening_hours = COALESCE(?, opening_hours),
        image_url = COALESCE(?, image_url),
        maps_url = COALESCE(?, maps_url),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [name, address, city, phone, opening_hours, image_url, maps_url, is_active, id]
    );
    const updated = await getOne(`SELECT * FROM branches WHERE id = ?`, [id]);
    io.emit('branches_updated');
    res.json({ success: true, branch: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Branch
app.delete('/api/branches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run(`DELETE FROM branches WHERE id = ?`, [id]);
    io.emit('branches_updated');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- WAITER CALLS / SERVICE BELL -------------------

// POST Create Waiter Call
app.post('/api/waiter-calls', async (req, res) => {
  try {
    const table_number = req.body.table_number || req.body.tableNumber;
    const call_type = req.body.call_type || req.body.callType || 'Caawimaad Guud';
    if (!table_number) {
      return res.status(400).json({ error: 'Table number is required' });
    }
    const result = await run(
      `INSERT INTO waiter_calls (table_number, call_type, status) VALUES (?, ?, 'Pending')`,
      [table_number, call_type]
    );
    const call = await getOne(`SELECT * FROM waiter_calls WHERE id = ?`, [result.id]);
    io.emit('new_waiter_call', call);
    res.json({ success: true, call });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Active Waiter Calls
app.get('/api/waiter-calls', async (req, res) => {
  try {
    const calls = await query(
      `SELECT * FROM waiter_calls WHERE status = 'Pending' ORDER BY id DESC LIMIT 20`
    );
    res.json(calls || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Mark Waiter Call Attended
app.put('/api/waiter-calls/:id/attend', async (req, res) => {
  try {
    const { id } = req.params;
    await run(`UPDATE waiter_calls SET status = 'Attended' WHERE id = ?`, [id]);
    io.emit('waiter_call_resolved', { id: parseInt(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;

initDb().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Restaurant Backend running at http://localhost:${PORT}`);
  });
});
