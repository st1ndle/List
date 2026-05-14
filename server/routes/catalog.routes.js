/**
 * server/routes/catalog.routes.js — Маршруты публичного каталога.
 *
 * Этот файл монтируется в app.js под корневым префиксом '/', поэтому
 * URL маршрутов совпадают с теми, что объявлены в router.get/post:
 *   GET  /categories                      — список всех категорий товаров
 *   GET  /products?category_id=<uuid>     — список товаров (фильтр по категории)
 *   POST /api/categories/lowest-prices    — категории с минимальными ценами (для главной страницы)
 *
 * Все маршруты публичны — авторизация не требуется.
 */

const express     = require('express');
const sql         = require('mssql');
const { getPool } = require('../config/db');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET /categories
// Возвращает список всех категорий товаров, упорядоченных по полю sort_order.
//
// Ответ: массив объектов категорий из таблицы categories
// ─────────────────────────────────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const p      = await getPool();
    // ORDER BY sort_order позволяет управлять порядком отображения категорий
    // через поле в БД, не меняя код
    const result = await p.request().query('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order');
    res.json(result.recordset);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /products?category_id=<uuid>
// Возвращает список товаров, опционально отфильтрованных по категории.
//
// Query-параметры:
//   category_id {UUID} — если указан, возвращаем только товары этой категории;
//                        если не указан — все товары
//
// Ответ: массив объектов товаров; поле attributes разбирается из JSON-строки в объект.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/products', async (req, res) => {
  try {
    const p               = await getPool();
    const { category_id } = req.query; // Читаем параметр из URL (?category_id=...)
    let result;

    if (category_id) {
      // Если category_id передан — фильтруем товары по нему
      result = await p.request()
        .input('categoryId', sql.UniqueIdentifier, category_id)
        .query('SELECT * FROM products WHERE category_id = @categoryId AND is_active = 1 ORDER BY name');
    } else {
      // Иначе возвращаем все активные товары
      result = await p.request().query('SELECT * FROM products WHERE is_active = 1 ORDER BY name');
    }

    // Поле attributes хранится в БД как JSON-строка (NVarChar).
    // Здесь мы парсим её в JavaScript-объект, чтобы клиент получил
    // готовый объект, а не строку.
    const products = result.recordset.map(product => {
      if (product.attributes && typeof product.attributes === 'string') {
        try {
          product.attributes = JSON.parse(product.attributes);
        } catch (_) {
          // Если JSON некорректный — оставляем как есть (строку), не ломаем ответ
        }
      }
      return product;
    });

    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/categories/lowest-prices
// Возвращает категории с минимальными ценами на товары.
// Используется на главной странице для отображения "блоков с ценами".
//
// Тело запроса (JSON, опционально):
//   categories {string[]} — массив id или name категорий для фильтрации.
//                           Если не указан — возвращаем N самых дешёвых.
//   limit      {number}   — количество категорий (по умолчанию 4, макс. 50)
//
// Ответ: массив { category_id, category_name, min_price, category_icon }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/api/categories/lowest-prices', async (req, res) => {
  try {
    const { categories, limit = 4 } = req.body || {};
    const p = await getPool();

    if (categories && Array.isArray(categories) && categories.length > 0) {
      // Режим 1: Конкретные категории переданы — ищем по id ИЛИ по name.
      //
      // Проблема: нельзя передать массив напрямую в параметризованный запрос MSSQL.
      // Решение: создаём отдельный параметр для каждого элемента (@cat0, @cat1, ...)
      // и динамически собираем SQL-строку с перечислением этих параметров.
      const request      = p.request();
      const placeholders = categories.map((c, i) => {
        request.input(`cat${i}`, sql.NVarChar, c); // Регистрируем параметр @catN
        return `@cat${i}`;                          // Добавляем его в список подстановок
      }).join(','); // Результат: "@cat0,@cat1,@cat2"

      const result = await request.query(`
        SELECT c.id AS category_id, c.name AS category_name, MIN(p.price) AS min_price,
          (SELECT TOP 1 p2.emoji FROM products p2
           WHERE p2.category_id = c.id ORDER BY p2.price ASC, p2.name ASC) AS category_icon
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
        WHERE (c.id IN (${placeholders}) OR c.name IN (${placeholders})) AND c.is_active = 1
        GROUP BY c.id, c.name
      `);
      return res.json(result.recordset);
    }

    // Режим 2: Конкретные категории не заданы — возвращаем N категорий с наименьшей ценой.
    // Math.max/min ограничивают диапазон допустимых значений limit: от 1 до 50.
    const limitVal = Math.max(1, Math.min(parseInt(limit, 10) || 4, 50));

    // SELECT TOP N — MSSQL-синтаксис для ограничения количества строк.
    // Здесь limitVal безопасно вставляется напрямую (уже провалидированное число),
    // поэтому SQL-инъекция исключена.
    const result = await p.request().query(`
      SELECT TOP ${limitVal}
        c.id AS category_id, c.name AS category_name, MIN(p.price) AS min_price,
        (SELECT TOP 1 p2.emoji FROM products p2
         WHERE p2.category_id = c.id ORDER BY p2.price ASC, p2.name ASC) AS category_icon
      FROM categories c
      JOIN products p ON c.id = p.category_id  -- INNER JOIN: исключаем категории без товаров
      WHERE c.is_active = 1 AND p.is_active = 1
      GROUP BY c.id, c.name
      ORDER BY min_price ASC  -- Сортируем по минимальной цене: сначала дешёвые
    `);
    res.json(result.recordset);
  } catch (e) {
    console.error('Lowest prices error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
