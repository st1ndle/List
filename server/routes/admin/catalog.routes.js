/**
 * server/routes/admin/catalog.routes.js — Управление каталогом (категории и товары).
 *
 * Все маршруты этого файла защищены requireAdmin и монтируются с префиксом /api/admin/catalog.
 * Позволяют выполнять CRUD-операции над категориями и товарами.
 *
 * Маршруты категорий:
 *   GET    /api/admin/catalog/categories      — список категорий (с поиском)
 *   POST   /api/admin/catalog/categories      — создание новой категории
 *   PUT    /api/admin/catalog/categories/:id  — обновление категории
 *   DELETE /api/admin/catalog/categories/:id  — удаление категории и её товаров
 *
 * Маршруты товаров:
 *   GET    /api/admin/catalog/products        — список товаров (с фильтрами и пагинацией)
 *   POST   /api/admin/catalog/products        — создание нового товара
 *   PUT    /api/admin/catalog/products/:id    — обновление товара
 *   DELETE /api/admin/catalog/products/:id    — удаление товара
 */

const express      = require('express');
const sql          = require('mssql');
const { getPool }  = require('../../config/db');
const requireAdmin = require('../../middleware/requireAdmin');

const router = express.Router();

// Применяем проверку прав администратора ко всем маршрутам в этом файле
router.use(requireAdmin);

// ─────────────────────────────────────────────────────────────────────────────
// РАЗДЕЛ: КАТЕГОРИИ (CATEGORIES)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/catalog/categories
// Получение списка всех категорий.
//
// Query параметры:
//   search {string} — фильтр по названию категории (опционально)
//
// Ответ: Массив объектов категорий [ { id, name, slug, ... }, ... ]
// ─────────────────────────────────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const { search } = req.query;
    const p = await getPool();
    const request = p.request();
    
    // Если передан поисковый запрос, добавляем его как входной параметр
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
    console.error('[Admin Catalog] Get categories error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/catalog/categories
// Создание новой категории.
//
// Тело запроса (JSON):
//   name       {string}  — Название категории
//   slug       {string}  — URL-идентификатор (уникальный)
//   color_hex  {string}  — HEX-код цвета для UI
//   sort_order {number}  — Порядок сортировки
//   is_active  {boolean} — Статус активности
//
// Ответ: Объект созданной категории со статусом 201
// ─────────────────────────────────────────────────────────────────────────────
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
    // 2627 — нарушение уникальности (slug)
    if (e.number === 2627) return res.status(409).json({ error: 'Категория с таким slug уже существует' });
    console.error('[Admin Catalog] Create category error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/catalog/categories/:id
// Обновление данных существующей категории.
// ─────────────────────────────────────────────────────────────────────────────
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
    console.error('[Admin Catalog] Update category error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/catalog/categories/:id
// Удаление категории. 
// ВАЖНО: При удалении категории удаляются все связанные с ней товары (CASCADE логика в коде).
// Используется транзакция для обеспечения целостности данных.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/categories/:id', async (req, res) => {
  try {
    const p = await getPool();
    const transaction = new sql.Transaction(p);
    await transaction.begin();
    try {
      const reqTx = new sql.Request(transaction);
      reqTx.input('id', sql.UniqueIdentifier, req.params.id);
      
      // Шаг 1: Деактивируем все продукты этой категории
      await reqTx.query(`UPDATE products SET is_active = 0, updated_at = SYSUTCDATETIME() WHERE category_id = @id`);
      
      // Шаг 2: Деактивируем саму категорию
      const result = await reqTx.query(`
        UPDATE categories
        SET is_active = 0, updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.id
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
    console.error('[Admin Catalog] Delete category error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// РАЗДЕЛ: ТОВАРЫ (PRODUCTS)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/catalog/products
// Список товаров с расширенной фильтрацией и офсетной пагинацией.
//
// Query параметры:
//   search      {string} — поиск по названию товара
//   category_id {UUID}   — фильтр по категории
//   price_min   {number} — минимальная цена
//   price_max   {number} — максимальная цена
//   limit       {number} — количество записей (default 20)
//   offset      {number} — смещение для пагинации (default 0)
//
// Ответ: { items: [], total: number, limit: number, offset: number }
// ─────────────────────────────────────────────────────────────────────────────
router.get('/products', async (req, res) => {
  try {
    const { search, category_id, price_min, price_max, limit = 20, offset = 0 } = req.query;
    const p = await getPool();
    const request = p.request();
    
    // Подготовка параметров
    const params = {
      search: search || null,
      categoryId: category_id || null,
      priceMin: price_min ? parseFloat(price_min) : null,
      priceMax: price_max ? parseFloat(price_max) : null,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };

    // Функция для наполнения запроса параметрами
    const applyParams = (req) => {
      req.input('search',     sql.NVarChar,         params.search);
      req.input('categoryId', sql.UniqueIdentifier, params.categoryId);
      req.input('priceMin',   sql.Decimal(10, 2),   params.priceMin);
      req.input('priceMax',   sql.Decimal(10, 2),   params.priceMax);
      return req;
    };

    // Шаг 1: Получаем товары
    const dataReq = applyParams(p.request());
    dataReq.input('limit',  sql.Int, params.limit);
    dataReq.input('offset', sql.Int, params.offset);

    const result = await dataReq.query(`
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
    
    // Шаг 2: Подсчет общего количества
    const countReq = applyParams(p.request());
    const countResult = await countReq.query(`
      SELECT COUNT(*) as total
      FROM products p
      WHERE (@search IS NULL OR p.name LIKE '%' + @search + '%')
        AND (@categoryId IS NULL OR p.category_id = @categoryId)
        AND (@priceMin IS NULL OR p.price >= @priceMin)
        AND (@priceMax IS NULL OR p.price <= @priceMax)
    `);

    // Шаг 3: Парсим атрибуты для каждого товара
    const items = result.recordset.map(product => {
      if (product.attributes && typeof product.attributes === 'string') {
        try { product.attributes = JSON.parse(product.attributes); } catch (e) {}
      }
      return product;
    });

    res.json({
      items,
      total: countResult.recordset[0].total,
      limit: params.limit,
      offset: params.offset
    });
  } catch (e) {
    console.error('[Admin Catalog] Get products error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/catalog/products
// Добавление нового товара в каталог.
// ─────────────────────────────────────────────────────────────────────────────
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
      // Атрибуты хранятся как JSON-строка в БД
      .input('attributes', sql.NVarChar, attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null)
      .input('stock_quantity', sql.Int, stock_quantity || 0)
      .input('is_active', sql.Bit, is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        INSERT INTO products (category_id, name, brand, description, price, unit_name, emoji, badge, bg_color, attributes, stock_quantity, is_active)
        OUTPUT INSERTED.*
        VALUES (@category_id, @name, @brand, @description, @price, @unit_name, @emoji, @badge, @bg_color, @attributes, @stock_quantity, @is_active)
      `);
    const product = result.recordset[0];
    if (product && product.attributes && typeof product.attributes === 'string') {
      try { product.attributes = JSON.parse(product.attributes); } catch (e) {}
    }
    res.status(201).json(product);
  } catch (e) {
    console.error('[Admin Catalog] Create product error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/catalog/products/:id
// Обновление данных существующего товара.
// ─────────────────────────────────────────────────────────────────────────────
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
    const product = result.recordset[0];
    if (product && product.attributes && typeof product.attributes === 'string') {
      try { product.attributes = JSON.parse(product.attributes); } catch (e) {}
    }
    res.json(product);
  } catch (e) {
    console.error('[Admin Catalog] Update product error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/catalog/products/:id
// Удаление товара из базы данных.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/products/:id', async (req, res) => {
  try {
    const p = await getPool();
    const result = await p.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query(`
        UPDATE products
        SET is_active = 0, updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.id
        WHERE id = @id
      `);

    if (result.recordset.length === 0) return res.status(404).json({ error: 'Продукт не найден' });
    res.json({ status: 'ok', id: result.recordset[0].id });
  } catch (e) {
    // 547 — ошибка нарушения внешнего ключа (товар привязан к существующим заказам)
    if (e.number === 547) return res.status(409).json({ error: 'Невозможно удалить продукт, так как он используется в заказах (FK constraint)' });
    console.error('[Admin Catalog] Delete product error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
