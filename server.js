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
      .input('id', sql.NVarChar, req.session.userId)
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
        .input('categoryId', sql.VarChar, categoryId)
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
