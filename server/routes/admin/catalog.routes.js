const express      = require('express');
const sql          = require('mssql');
const { getPool }  = require('../../config/db');
const requireAdmin = require('../../middleware/requireAdmin');

const router = express.Router();
router.use(requireAdmin);

// === CATEGORIES ===

router.get('/categories', async (req, res) => {
  try {
    const { search } = req.query;
    const p = await getPool();
    const request = p.request();
    
    if (search) {
      request.input('search', sql.NVarChar, search);
    } else {
      request.input('search', sql.NVarChar, null);
    }

    const result = await request.query(`
      SELECT * FROM categories
      WHERE (@search IS NULL OR name LIKE '%' + @search + '%')
      ORDER BY sort_order
    `);
    res.json(result.recordset);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/categories', async (req, res) => {
  const { name, slug, color_hex, sort_order, is_active } = req.body;
  try {
    const p = await getPool();
    const result = await p.request()
      .input('name', sql.NVarChar, name)
      .input('slug', sql.NVarChar, slug)
      .input('color_hex', sql.NVarChar, color_hex)
      .input('sort_order', sql.Int, sort_order)
      .input('is_active', sql.Bit, is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        INSERT INTO categories (name, slug, color_hex, sort_order, is_active)
        OUTPUT INSERTED.*
        VALUES (@name, @slug, @color_hex, @sort_order, @is_active)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (e) {
    if (e.number === 2627) return res.status(409).json({ error: 'Категория с таким slug уже существует' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  const { name, slug, color_hex, sort_order, is_active } = req.body;
  try {
    const p = await getPool();
    const result = await p.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .input('name', sql.NVarChar, name)
      .input('slug', sql.NVarChar, slug)
      .input('color_hex', sql.NVarChar, color_hex)
      .input('sort_order', sql.Int, sort_order)
      .input('is_active', sql.Bit, is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        UPDATE categories
        SET name = @name, slug = @slug, color_hex = @color_hex, sort_order = @sort_order,
            is_active = @is_active, updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Категория не найдена' });
    res.json(result.recordset[0]);
  } catch (e) {
    if (e.number === 2627) return res.status(409).json({ error: 'Категория с таким slug уже существует' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const p = await getPool();
    const transaction = new sql.Transaction(p);
    await transaction.begin();
    try {
      const reqTx = new sql.Request(transaction);
      reqTx.input('id', sql.UniqueIdentifier, req.params.id);
      
      // Сначала удаляем продукты (жестко)
      await reqTx.query(`DELETE FROM products WHERE category_id = @id`);
      
      // Затем удаляем саму категорию
      const result = await reqTx.query(`
        DELETE FROM categories
        OUTPUT DELETED.id
        WHERE id = @id
      `);
      
      if (result.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Категория не найдена' });
      }
      
      await transaction.commit();
      res.json({ status: 'ok', id: result.recordset[0].id });
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === PRODUCTS ===

router.get('/products', async (req, res) => {
  try {
    const { search, category_id, price_min, price_max, limit = 20, offset = 0 } = req.query;
    const p = await getPool();
    const request = p.request();
    
    request.input('search', sql.NVarChar, search || null);
    request.input('categoryId', sql.UniqueIdentifier, category_id || null);
    request.input('priceMin', sql.Decimal(10, 2), price_min ? parseFloat(price_min) : null);
    request.input('priceMax', sql.Decimal(10, 2), price_max ? parseFloat(price_max) : null);
    request.input('limit', sql.Int, parseInt(limit, 10));
    request.input('offset', sql.Int, parseInt(offset, 10));

    const result = await request.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE (@search IS NULL OR p.name LIKE '%' + @search + '%')
        AND (@categoryId IS NULL OR p.category_id = @categoryId)
        AND (@priceMin IS NULL OR p.price >= @priceMin)
        AND (@priceMax IS NULL OR p.price <= @priceMax)
      ORDER BY c.name, p.name
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);
    
    // Подсчет общего количества для пагинации
    const countRequest = p.request();
    countRequest.input('search', sql.NVarChar, search || null);
    countRequest.input('categoryId', sql.UniqueIdentifier, category_id || null);
    countRequest.input('priceMin', sql.Decimal(10, 2), price_min ? parseFloat(price_min) : null);
    countRequest.input('priceMax', sql.Decimal(10, 2), price_max ? parseFloat(price_max) : null);
    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      FROM products p
      WHERE (@search IS NULL OR p.name LIKE '%' + @search + '%')
        AND (@categoryId IS NULL OR p.category_id = @categoryId)
        AND (@priceMin IS NULL OR p.price >= @priceMin)
        AND (@priceMax IS NULL OR p.price <= @priceMax)
    `);

    res.json({
      items: result.recordset,
      total: countResult.recordset[0].total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/products', async (req, res) => {
  const { category_id, name, brand, description, price, unit_name, emoji, badge, bg_color, attributes, stock_quantity, is_active } = req.body;
  try {
    const p = await getPool();
    const result = await p.request()
      .input('category_id', sql.UniqueIdentifier, category_id)
      .input('name', sql.NVarChar, name)
      .input('brand', sql.NVarChar, brand || null)
      .input('description', sql.NVarChar, description || null)
      .input('price', sql.Decimal(10, 2), price)
      .input('unit_name', sql.NVarChar, unit_name || null)
      .input('emoji', sql.NVarChar, emoji || null)
      .input('badge', sql.NVarChar, badge || null)
      .input('bg_color', sql.NVarChar, bg_color || null)
      .input('attributes', sql.NVarChar, attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null)
      .input('stock_quantity', sql.Int, stock_quantity || 0)
      .input('is_active', sql.Bit, is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        INSERT INTO products (category_id, name, brand, description, price, unit_name, emoji, badge, bg_color, attributes, stock_quantity, is_active)
        OUTPUT INSERTED.*
        VALUES (@category_id, @name, @brand, @description, @price, @unit_name, @emoji, @badge, @bg_color, @attributes, @stock_quantity, @is_active)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/products/:id', async (req, res) => {
  const { category_id, name, brand, description, price, unit_name, emoji, badge, bg_color, attributes, stock_quantity, is_active } = req.body;
  try {
    const p = await getPool();
    const result = await p.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .input('category_id', sql.UniqueIdentifier, category_id)
      .input('name', sql.NVarChar, name)
      .input('brand', sql.NVarChar, brand || null)
      .input('description', sql.NVarChar, description || null)
      .input('price', sql.Decimal(10, 2), price)
      .input('unit_name', sql.NVarChar, unit_name || null)
      .input('emoji', sql.NVarChar, emoji || null)
      .input('badge', sql.NVarChar, badge || null)
      .input('bg_color', sql.NVarChar, bg_color || null)
      .input('attributes', sql.NVarChar, attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null)
      .input('stock_quantity', sql.Int, stock_quantity || 0)
      .input('is_active', sql.Bit, is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        UPDATE products
        SET category_id = @category_id, name = @name, brand = @brand, description = @description,
            price = @price, unit_name = @unit_name, emoji = @emoji, badge = @badge,
            bg_color = @bg_color, attributes = @attributes, stock_quantity = @stock_quantity,
            is_active = @is_active, updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Продукт не найден' });
    res.json(result.recordset[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const p = await getPool();
    const result = await p.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query(`
        DELETE FROM products
        OUTPUT DELETED.id
        WHERE id = @id
      `);

    if (result.recordset.length === 0) return res.status(404).json({ error: 'Продукт не найден' });
    res.json({ status: 'ok', id: result.recordset[0].id });
  } catch (e) {
    if (e.number === 547) return res.status(409).json({ error: 'Невозможно удалить продукт, так как он используется в заказах (FK constraint)' });
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
