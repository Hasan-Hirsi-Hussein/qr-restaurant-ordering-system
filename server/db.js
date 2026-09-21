import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'bistro.db');

sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const initDb = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // 1. Tables table
        await run(`
          CREATE TABLE IF NOT EXISTS tables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 2. Categories table
        await run(`
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            display_order INTEGER DEFAULT 0
          )
        `);

        // 3. Products table
        await run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image_url TEXT,
            is_available INTEGER DEFAULT 1,
            doneness_options TEXT,
            addon_options TEXT,
            FOREIGN KEY (category_id) REFERENCES categories (id)
          )
        `);

        // 4. Orders table
        await run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            table_number TEXT NOT NULL,
            customer_name TEXT,
            status TEXT DEFAULT 'New',
            est_prep_time INTEGER DEFAULT 15,
            subtotal REAL NOT NULL,
            tax REAL NOT NULL,
            service_charge REAL DEFAULT 0.00,
            total_amount REAL NOT NULL,
            payment_method TEXT DEFAULT 'Cash',
            payment_status TEXT DEFAULT 'Pending',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Migration check for existing databases: ensure payment_method & payment_status columns exist
        try {
          await run(`ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'Cash'`);
        } catch (e) {}
        try {
          await run(`ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'Pending'`);
        } catch (e) {}

        // 5. Order Items table
        await run(`
          CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER,
            product_name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            options TEXT,
            item_total REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
          )
        `);

        // 6. Users table (Authentication)
        await run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'customer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 7. Reviews & Ratings table
        await run(`
          CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            product_name TEXT,
            table_number TEXT,
            customer_name TEXT,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
          )
        `);

        // Migration check for product ratings
        try {
          await run(`ALTER TABLE products ADD COLUMN rating REAL DEFAULT 4.8`);
        } catch (e) {}
        try {
          await run(`ALTER TABLE products ADD COLUMN rating_count INTEGER DEFAULT 12`);
        } catch (e) {}

        // Seed initial reviews if empty
        try {
          const revCount = await getOne(`SELECT COUNT(*) as count FROM reviews`);
          if (!revCount || revCount.count === 0) {
            await run(`
              INSERT INTO reviews (product_id, product_name, table_number, customer_name, rating, comment)
              VALUES 
                (1, 'Classic Smash Burger', 'TB-04', 'Axmed Nuur', 5, 'Burger-ka ugu fiican ee aan abid cuno! Aad buu u macaan yahay.'),
                (2, 'Truffle Mushroom Burger', 'TB-07', 'Deeqa Cali', 5, 'Suugada Truffle-ka waa mid heersare ah.'),
                (3, 'Margherita Wood-Fired Pizza', 'TB-02', 'Cumar Faarax', 4, 'Jiiska iyo cajiinka aad bay u jilicsan yihiin.')
            `);
          }
        } catch (e) {}

        // Seed Users if empty
        const userCount = await getOne(`SELECT COUNT(*) as count FROM users`);
        if (userCount.count === 0) {
          await run(`
            INSERT INTO users (name, email, phone, password, role)
            VALUES 
            ('System Admin', 'admin@lebistro.com', '0615000001', 'admin123', 'admin'),
            ('Chef Marco (Kitchen)', 'kitchen@lebistro.com', '0615000002', 'kitchen123', 'kitchen'),
            ('Abdi Hassan (Customer)', 'abdi@gmail.com', '0615551234', 'user123', 'customer')
          `);
        }

        // 7. Restaurant Settings table (Branding & Logo)
        await run(`
          CREATE TABLE IF NOT EXISTS restaurant_settings (
            id INTEGER PRIMARY KEY,
            restaurant_name TEXT DEFAULT 'Le Bistro',
            restaurant_tagline TEXT DEFAULT 'Fine Dining & Fresh Taste',
            logo_type TEXT DEFAULT 'icon',
            logo_icon TEXT DEFAULT 'Utensils',
            logo_url TEXT DEFAULT '',
            phone TEXT DEFAULT '+252 61 500 0000',
            address TEXT DEFAULT 'Maka Al-Mukarama Street, Mogadishu',
            website TEXT DEFAULT 'www.lebistro-restaurant.com',
            currency TEXT DEFAULT 'USD',
            audio_chime INTEGER DEFAULT 1
          )
        `);

        // 8. Branches table (Locations & Outlets)
        await run(`
          CREATE TABLE IF NOT EXISTS branches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT DEFAULT 'Muqdisho',
            phone TEXT,
            opening_hours TEXT DEFAULT '08:00 AM - 11:30 PM',
            image_url TEXT,
            maps_url TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 9. Waiter Calls table (Call Waiter / Staff Bell Service)
        await run(`
          CREATE TABLE IF NOT EXISTS waiter_calls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number TEXT NOT NULL,
            call_type TEXT DEFAULT 'Caawimaad Guud',
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Seed default branches if empty
        const branchCount = await getOne(`SELECT COUNT(*) as count FROM branches`);
        if (branchCount.count === 0) {
          await run(`
            INSERT INTO branches (name, address, city, phone, opening_hours, image_url, maps_url, is_active)
            VALUES 
            (
              'Laanta Maka Al-Mukarama (Main Branch)',
              'Waddada Maka Al-Mukarama, Degmada Hodan, Muqdisho',
              'Muqdisho',
              '+252 61 500 0001',
              '08:00 AM - 11:30 PM',
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
              'https://maps.google.com/?q=Mogadishu+Somalia',
              1
            ),
            (
              'Laanta KM4 & Taleex',
              'Isgoyska KM4, Wadada Taleex, Muqdisho',
              'Muqdisho',
              '+252 61 500 0002',
              '08:30 AM - 11:00 PM',
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
              'https://maps.google.com/?q=KM4+Mogadishu',
              1
            ),
            (
              'Laanta Liido Beach (Badda Liido)',
              'Waddada Xeebta Liido, Degmada Cabdicasiis, Muqdisho',
              'Muqdisho',
              '+252 61 500 0003',
              '09:00 AM - 12:00 AM',
              'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop',
              'https://maps.google.com/?q=Lido+Beach+Mogadishu',
              1
            ),
            (
              'Laanta Garoonka Diyaaradaha (Aden Adde)',
              'Waddada Garoonka, Degmada Wadajir, Muqdisho',
              'Muqdisho',
              '+252 61 500 0004',
              '24 Saac (24/7 Furan)',
              'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop',
              'https://maps.google.com/?q=Aden+Adde+Airport+Mogadishu',
              1
            )
          `);
        }

        // Seed restaurant settings if empty
        const settingsCount = await getOne(`SELECT COUNT(*) as count FROM restaurant_settings`);
        if (settingsCount.count === 0) {
          await run(`
            INSERT INTO restaurant_settings (id, restaurant_name, restaurant_tagline, logo_type, logo_icon, logo_url, phone, address, website, currency, audio_chime)
            VALUES (1, 'Le Bistro', 'Fine Dining & Fresh Taste', 'icon', 'Utensils', '', '+252 61 500 0000', 'Maka Al-Mukarama Street, Mogadishu', 'www.lebistro-restaurant.com', 'USD', 1)
          `);
        }

        // Seed initial data if tables empty
        const tableCount = await getOne(`SELECT COUNT(*) as count FROM tables`);
        if (tableCount.count === 0) {
          await run(`INSERT INTO tables (table_number) VALUES ('TB-01'), ('TB-03'), ('TB-07'), ('TB-12')`);
        }

        const catCount = await getOne(`SELECT COUNT(*) as count FROM categories`);
        if (catCount.count === 0) {
          await run(`INSERT INTO categories (name, display_order) VALUES ('Popular', 1), ('Burgers', 2), ('Pizza', 3), ('Sides & Extras', 4), ('Drinks & Desserts', 5)`);
        }

        const prodCount = await getOne(`SELECT COUNT(*) as count FROM products`);
        if (prodCount.count === 0) {
          // Add default products
          await run(`
            INSERT INTO products (category_id, name, description, price, image_url, is_available, doneness_options, addon_options)
            VALUES 
            (2, 'Double Truffle Smash Burger', 'Two 100% Angus beef smashed patties with crispy caramelized edges, melted aged Wisconsin cheddar, balsamic caramelized sweet onions, and house-made truffle mayo on a toasted brioche bun.', 14.50, '/images/smash_burger.jpg', 1, '["Medium Well", "Well Done"]', '[{"name":"Applewood Smoked Bacon", "price":2.00}, {"name":"Double Wisconsin Cheddar", "price":1.50}, {"name":"Gluten-Free Brioche Bun", "price":1.00}]'),
            (3, 'Rustic Margherita Pizza', 'Artisanal wood-fired sourdough crust topped with San Marzano tomato sauce, fresh buffalo mozzarella, virgin olive oil, and fresh aromatic basil leaves.', 16.00, '/images/margherita_pizza.jpg', 1, '[]', '[{"name":"Extra Buffalo Mozzarella", "price":2.50}, {"name":"Truffle Oil Drizzle", "price":1.50}]'),
            (4, 'Rosemary Garlic Fries', 'Golden crispy thick-cut potatoes tossed in rosemary sea salt, minced roasted garlic, and freshly grated parmesan cheese. Served with house aioli.', 6.50, '/images/garlic_fries.jpg', 1, '[]', '[{"name":"Extra House Aioli", "price":0.75}, {"name":"Truffle Cheese Dip", "price":1.50}]'),
            (5, 'Sparkling Strawberry Lemonade', 'Freshly squeezed Sicilian lemons combined with organic strawberry puree, sparkling water, mint leaves, and crushed ice.', 6.50, '/images/strawberry_lemonade.jpg', 1, '[]', '[{"name":"Less Sugar", "price":0}, {"name":"Extra Mint", "price":0.50}]')
          `);
        }

        console.log('Database initialized successfully!');
        resolve();
      } catch (err) {
        console.error('Failed to initialize database:', err);
        reject(err);
      }
    });
  });
};

export default db;
