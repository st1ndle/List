const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const session = require('express-session');
const MSSQLStore = require('connect-mssql-v2');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Логирование входящих запросов
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', { ...req.body, password: req.body.password ? '***' : undefined });
  }
  next();
});

const PORT = process.env.PORT || 3000;

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'StrongP@ssw0rd!',
  server: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME || 'master',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
  },
};

let pool;

async function getPool() {
  if (pool) return pool;
  pool = await sql.connect(dbConfig);
  return pool;
}

// Middleware: только для авторизованных администраторов
async function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const p = await getPool();
    const result = await p.request()
      .input('id', sql.UniqueIdentifier, req.session.userId)
      .query('SELECT role FROM users WHERE id = @id');
    if (result.recordset.length === 0 || result.recordset[0].role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.use(session({
  store: new MSSQLStore(dbConfig),
  secret: process.env.SESSION_SECRET || 'diplom-super-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  name: 'diplom.sid', // Custom cookie name to avoid conflicts
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: false, // set to true if using https
    sameSite: 'lax'
  }
}));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;
    if (!firstName || (!phone && !email) || !password) {
      return res.status(400).json({ error: 'Заполните обязательные поля (имя, телефон/email, пароль)' });
    }
    const cleanP = phone ? phone.replace(/\D/g, '') : null;
    const cleanE = email ? email.toLowerCase().trim() : null;

    const p = await getPool();
    const checkUser = await p.request()
      .input('phone', sql.NVarChar, cleanP)
      .input('email', sql.NVarChar, cleanE)
      .query('SELECT id FROM users WHERE (phone = @phone AND phone IS NOT NULL) OR (email = @email AND email IS NOT NULL)');
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ error: 'Пользователь с такими контактами уже существует' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await p.request()
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName || null)
      .input('phone', sql.NVarChar, cleanP)
      .input('email', sql.NVarChar, cleanE)
      .input('hash', sql.NVarChar, hash)
      .query('INSERT INTO users (first_name, last_name, phone, email, password_hash) OUTPUT INSERTED.id VALUES (@firstName, @lastName, @phone, @email, @hash)');

    const userId = result.recordset[0].id;
    req.session.userId = userId;
    res.json({ status: 'ok', userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: 'Введите логин и пароль' });
    }

    let isEmail = login.includes('@');
    let searchValue = isEmail ? login.toLowerCase().trim() : login.replace(/\D/g, '');

    const p = await getPool();

    let query = isEmail
      ? 'SELECT * FROM users WHERE email = @val'
      : 'SELECT * FROM users WHERE phone = @val';

    console.log(`Поиск пользователя: isEmail=${isEmail}, searchValue='${searchValue}'`);

    const result = await p.request()
      .input('val', sql.NVarChar, searchValue)
      .query(query);

    console.log(`Найдено пользователей: ${result.recordset.length}`);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`Проверка пароля: isMatch=${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    req.session.userId = user.id;
    console.log(`Успешный вход! userId=${user.id}, sessionId=${req.sessionID}`);
    res.json({ status: 'ok', userId: user.id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const userId = req.session.userId;
  console.log(`\n--- /api/auth/logout ---`);
  console.log(`User attempting logout: userId=${userId}`);

  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('diplom.sid');
    console.log(`Logout successful for userId=${userId}`);
    res.json({ status: 'ok' });
  });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    console.log('--- /api/auth/me ---');
    console.log('Session ID:', req.sessionID);
    console.log('Session userId:', req.session.userId);
    console.log('Cookies:', req.headers.cookie);

    if (!req.session.userId) {
      return res.json({ user: null });
    }
    const p = await getPool();
    const result = await p.request()
      .input('id', sql.UniqueIdentifier, req.session.userId)
      .query('SELECT id, first_name, last_name, phone, email, role FROM users WHERE id = @id');

    if (result.recordset.length === 0) {
      console.log('User not found in DB for id:', req.session.userId);
      return res.status(401).json({ error: 'User not found' });
    }
    console.log('User found:', result.recordset[0].email);
    res.json({ user: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { items, total_amount, delivery_address, comment, customer_name, customer_phone, warehouse_code } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Empty cart' });

  try {
    const p = await getPool();
    const transaction = new sql.Transaction(p);
    await transaction.begin();

    try {
      const userRes = await transaction.request()
        .input('userId', sql.UniqueIdentifier, req.session.userId)
        .query('SELECT first_name, last_name, phone FROM users WHERE id = @userId');
      if (userRes.recordset.length === 0) throw new Error('User not found');
      const user = userRes.recordset[0];

      const final_customer_name = customer_name || `${user.first_name} ${user.last_name || ''}`.trim();
      const final_customer_phone = customer_phone || user.phone || '';

      // Если передан warehouse_code — проверяем, что такой склад существует
      let finalWarehouseCode = null;
      if (warehouse_code) {
        const whRes = await transaction.request()
          .input('wcode', sql.NVarChar, warehouse_code)
          .query('SELECT warehouse_code FROM warehouses WHERE warehouse_code = @wcode AND is_active = 1');
        if (whRes.recordset.length > 0) {
          finalWarehouseCode = whRes.recordset[0].warehouse_code;
        }
      }

      const orderRes = await transaction.request()
        .input('userId',        sql.UniqueIdentifier,   req.session.userId)
        .input('warehouseCode', sql.NVarChar,            finalWarehouseCode)
        .input('totalAmount',   sql.Decimal(10, 2),     total_amount)
        .input('customerName',  sql.NVarChar,            final_customer_name)
        .input('customerPhone', sql.NVarChar,            final_customer_phone)
        .input('deliveryAddress', sql.NVarChar,          delivery_address || null)
        .input('comment',       sql.NVarChar,            comment || null)
        .query(`
          INSERT INTO orders (user_id, warehouse_code, status, total_amount, customer_name, customer_phone, delivery_address, comment)
          OUTPUT INSERTED.id, INSERTED.order_number, INSERTED.public_id
          VALUES (@userId, @warehouseCode, 'new', @totalAmount, @customerName, @customerPhone, @deliveryAddress, @comment)
        `);

      const orderId     = orderRes.recordset[0].id;
      const orderNumber = orderRes.recordset[0].order_number;
      const publicId    = orderRes.recordset[0].public_id;

      for (const item of items) {
        await transaction.request()
          .input('orderId',          sql.UniqueIdentifier, orderId)
          .input('productId',        sql.UniqueIdentifier, String(item.id))
          .input('quantity',         sql.Int,              item.quantity)
          .input('priceAtPurchase',  sql.Decimal(10, 2),   item.price_at_purchase)
          .query(`
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES (@orderId, @productId, @quantity, @priceAtPurchase)
          `);
      }

      await transaction.commit();
      res.json({ status: 'ok', order_id: orderId, order_number: orderNumber, public_id: publicId });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/orders', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const p = await getPool();
    const ordersRes = await p.request()
      .input('userId', sql.UniqueIdentifier, req.session.userId)
      .query('SELECT * FROM orders WHERE user_id = @userId ORDER BY created_at DESC');
    const userOrders = ordersRes.recordset;

    if (userOrders.length > 0) {
      const itemsRes = await p.request()
        .input('userId', sql.UniqueIdentifier, req.session.userId)
        .query(`
          SELECT oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name, p.emoji
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE o.user_id = @userId
        `);
      
      const itemsByOrder = {};
      itemsRes.recordset.forEach(item => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push({
          id: item.product_id,
          name: item.name || 'Неизвестный товар',
          emoji: item.emoji || '📦',
          q: item.quantity,
          price: item.price_at_purchase
        });
      });

      userOrders.forEach(o => {
        o.items = itemsByOrder[o.id] || [];
      });
    }

    res.json(userOrders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', async (req, res) => {
  try {
    const p = await getPool();
    const result = await p.request().query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      db: result.recordset?.[0]?.ok === 1 ? 'connected' : 'unknown',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const p = await getPool();
    const result = await p.request().query('SELECT * FROM categories ORDER BY sort_order');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.get('/products', async (req, res) => {
  try {
    const p = await getPool();
    const categoryId = req.query.category_id;
    let result;

    if (categoryId) {
      result = await p.request()
        .input('categoryId', sql.UniqueIdentifier, categoryId)
        .query('SELECT * FROM products WHERE category_id = @categoryId ORDER BY name');
    } else {
      result = await p.request()
        .query('SELECT * FROM products ORDER BY name');
    }

    const products = result.recordset.map(product => {
      if (product.attributes && typeof product.attributes === 'string') {
        try {
          product.attributes = JSON.parse(product.attributes);
        } catch (e) {
          console.error(`Failed to parse attributes for product ${product.id}`, e);
        }
      }
      return product;
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.post('/api/categories/lowest-prices', async (req, res) => {
  try {
    const { categories, limit = 4 } = req.body || {};
    const p = await getPool();

    if (categories && Array.isArray(categories) && categories.length > 0) {
      const request = p.request();
      let placeholders = categories.map((c, i) => {
        request.input(`cat${i}`, sql.NVarChar, c);
        return `@cat${i}`;
      }).join(',');
      
      const query = `
        SELECT
          c.id as category_id,
          c.name as category_name,
          MIN(p.price) as min_price,
          (
            SELECT TOP 1 p2.emoji
            FROM products p2
            WHERE p2.category_id = c.id
            ORDER BY p2.price ASC, p2.name ASC
          ) as category_icon
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id 
        WHERE c.id IN (${placeholders}) OR c.name IN (${placeholders})
        GROUP BY c.id, c.name
      `;
      const result = await request.query(query);
      res.json(result.recordset);
    } else {
      const limitVal = parseInt(limit, 10) || 4;
      const query = `
        SELECT TOP ${limitVal}
          c.id as category_id,
          c.name as category_name,
          MIN(p.price) as min_price,
          (
            SELECT TOP 1 p2.emoji
            FROM products p2
            WHERE p2.category_id = c.id
            ORDER BY p2.price ASC, p2.name ASC
          ) as category_icon
        FROM categories c
        JOIN products p ON c.id = p.category_id 
        GROUP BY c.id, c.name 
        ORDER BY min_price ASC
      `;
      const result = await p.request().query(query);
      res.json(result.recordset);
    }
  } catch (error) {
    console.error('Lowest prices error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/warehouses', async (req, res) => {
  try {
    const p = await getPool();
    const result = await p.request().query(`
      SELECT
        id, warehouse_code, name, city, address, phone,
        CONVERT(VARCHAR(5), working_hours_start, 108) AS working_hours_start,
        CONVERT(VARCHAR(5), working_hours_end, 108) AS working_hours_end,
        is_active
      FROM warehouses
      WHERE is_active = 1
      ORDER BY city, name
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------
// ADMIN: Поиск и управление заказами
// -------------------------------------------------------

/**
 * GET /api/admin/orders
 * Список заказов с курсорной пагинацией и поиском.
 *
 * Query params:
 *   search  — поиск по public_id / customer_name / customer_phone / email пользователя
 *   cursor  — order_number последнего полученного заказа (для следующей страницы)
 *   limit   — размер страницы (по умолчанию 20, максимум 100)
 *   status  — фильтр по статусу (new / processing / completed / cancelled)
 *
 * Возвращает:
 *   { data: [...], nextCursor: <order_number | null> }
 */
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const p = await getPool();
    const limit  = Math.min(parseInt(req.query.limit  || '20', 10), 100);
    const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : null;
    const search = (req.query.search || '').trim();
    const status = req.query.status || null;

    const request = p.request();
    request.input('limit', sql.Int, limit + 1); // берём на 1 больше, чтобы знать, есть ли следующая страница

    let whereClauses = [];

    // Курсор: следующая страница — заказы с order_number < cursor
    if (cursor !== null) {
      request.input('cursor', sql.Int, cursor);
      whereClauses.push('o.order_number < @cursor');
    }

    // Фильтр по статусу
    if (status) {
      request.input('status', sql.NVarChar, status);
      whereClauses.push('o.status = @status');
    }

    // Поиск: public_id / ФИО / телефон / email пользователя
    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
      request.input('searchExact', sql.NVarChar, search);
      whereClauses.push(`(
        o.public_id        LIKE @search
        OR o.customer_name LIKE @search
        OR o.customer_phone LIKE @search
        OR u.email         LIKE @search
        OR u.first_name + ' ' + ISNULL(u.last_name, '') LIKE @search
        OR CAST(o.order_number AS NVARCHAR) = @searchExact
      )`);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const query = `
      SELECT TOP (@limit)
        o.id, o.order_number, o.public_id, o.status,
        o.total_amount, o.customer_name, o.customer_phone,
        o.delivery_address, o.comment, o.created_at, o.updated_at,
        u.email AS user_email,
        u.first_name AS user_first_name,
        u.last_name  AS user_last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereSQL}
      ORDER BY o.order_number DESC
    `;

    const result = await request.query(query);
    const rows = result.recordset;

    // Если получили limit+1 строк — есть следующая страница
    const hasMore = rows.length > limit;
    if (hasMore) rows.pop();

    const nextCursor = hasMore ? rows[rows.length - 1].order_number : null;

    res.json({ data: rows, nextCursor });
  } catch (err) {
    console.error('Admin orders fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Смена статуса заказа администратором.
 * Body: { status: 'new' | 'processing' | 'completed' | 'cancelled' }
 */
app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['new', 'processing', 'completed', 'cancelled'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `Недопустимый статус. Допустимые: ${allowed.join(', ')}` });
  }
  try {
    const p = await getPool();
    const result = await p.request()
      .input('id',     sql.UniqueIdentifier, id)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE orders
        SET status = @status, updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.id, INSERTED.order_number, INSERTED.public_id, INSERTED.status, INSERTED.updated_at
        WHERE id = @id
      `);
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Заказ не найден' });
    res.json({ status: 'ok', order: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------
// ADMIN: Управление складами
// -------------------------------------------------------

// Список всех складов (включая неактивные)
app.get('/api/admin/warehouses', requireAdmin, async (req, res) => {
  try {
    const p = await getPool();
    const result = await p.request().query(`
      SELECT id, warehouse_code, name, city, address, phone,
             CONVERT(VARCHAR(5), working_hours_start, 108) AS working_hours_start,
             CONVERT(VARCHAR(5), working_hours_end, 108) AS working_hours_end,
             is_active, created_at, updated_at
      FROM warehouses
      ORDER BY city, name
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создание склада
app.post('/api/admin/warehouses', requireAdmin, async (req, res) => {
  const { warehouse_code, name, city, address, phone, working_hours_start, working_hours_end, is_active } = req.body;
  if (!warehouse_code || !name || !city || !address) {
    return res.status(400).json({ error: 'Обязательные поля: warehouse_code, name, city, address' });
  }
  try {
    const p = await getPool();
    const result = await p.request()
      .input('code',   sql.NVarChar,  warehouse_code.toUpperCase().slice(0, 10))
      .input('name',   sql.NVarChar,  name)
      .input('city',   sql.NVarChar,  city)
      .input('addr',   sql.NVarChar,  address)
      .input('phone',  sql.NVarChar,  phone || null)
      .input('start',  sql.Time,      working_hours_start || null)
      .input('end',    sql.Time,      working_hours_end   || null)
      .input('active', sql.Bit,       is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        INSERT INTO warehouses (warehouse_code, name, city, address, phone, working_hours_start, working_hours_end, is_active)
        OUTPUT INSERTED.*
        VALUES (@code, @name, @city, @addr, @phone, @start, @end, @active)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ error: 'Склад с таким warehouse_code уже существует' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Обновление склада
app.put('/api/admin/warehouses/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { warehouse_code, name, city, address, phone, working_hours_start, working_hours_end, is_active } = req.body;
  if (!warehouse_code || !name || !city || !address) {
    return res.status(400).json({ error: 'Обязательные поля: warehouse_code, name, city, address' });
  }
  try {
    const p = await getPool();
    const result = await p.request()
      .input('id',     sql.UniqueIdentifier, id)
      .input('code',   sql.NVarChar,  warehouse_code.toUpperCase().slice(0, 10))
      .input('name',   sql.NVarChar,  name)
      .input('city',   sql.NVarChar,  city)
      .input('addr',   sql.NVarChar,  address)
      .input('phone',  sql.NVarChar,  phone || null)
      .input('start',  sql.Time,      working_hours_start || null)
      .input('end',    sql.Time,      working_hours_end   || null)
      .input('active', sql.Bit,       is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        UPDATE warehouses
        SET warehouse_code = @code, name = @name, city = @city, address = @addr,
            phone = @phone, working_hours_start = @start, working_hours_end = @end,
            is_active = @active, updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Склад не найден' });
    res.json(result.recordset[0]);
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ error: 'Склад с таким warehouse_code уже существует' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Удаление склада (мягкое — деактивация)
app.delete('/api/admin/warehouses/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const p = await getPool();
    const result = await p.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        UPDATE warehouses SET is_active = 0, updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.id
        WHERE id = @id
      `);
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Склад не найден' });
    res.json({ status: 'ok', id: result.recordset[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Отдаем статику (js, css)
app.get('/app.js', (req, res) => res.sendFile(path.join(__dirname, 'app.js')));
app.get('/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'styles.css')));

// SPA Fallback: все остальные GET-запросы возвращают index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
