const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
