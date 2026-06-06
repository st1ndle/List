/**
 * server/routes/admin/orders.routes.js — Управление заказами в административной панели.
 *
 * Все маршруты защищены requireAdmin и монтируются с префиксом /api/admin/orders.
 * Позволяют просматривать список заказов с фильтрацией и изменять их статус.
 *
 * Маршруты:
 *   GET   /api/admin/orders            — список всех заказов (фильтры, поиск, курсорная пагинация)
 *   PATCH /api/admin/orders/:id/status — изменение статуса заказа
 */

const express        = require('express');
const sql            = require('mssql');
const { getPool }    = require('../../config/db');
const requireAdmin   = require('../../middleware/requireAdmin');
const { validateOrderStatus } = require('../../validators/order.validator');

const router = express.Router();

// Применяем проверку прав администратора ко всем маршрутам в этом файле
router.use(requireAdmin);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/orders
// Возвращает список заказов с поддержкой курсорной пагинации и сложной фильтрации.
//
// Query параметры:
//   limit     {number} — количество записей (макс. 100, default 20)
//   cursor    {number} — значение order_number для получения следующей страницы
//   search    {string} — поиск по ID, имени, телефону, email или номеру заказа
//   status    {string} — фильтр по статусу (new, processing, completed, cancelled)
//   dateFrom  {string} — дата начала (YYYY-MM-DD)
//   dateTo    {string} — дата окончания (YYYY-MM-DD)
//   amountMin {number} — минимальная сумма заказа
//   amountMax {number} — максимальная сумма заказа
//
// Ответ: { data: [], nextCursor: number | null }
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const p         = await getPool();
    // Ограничиваем лимит сверху, чтобы избежать перегрузки БД
    const limit     = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const cursor    = req.query.cursor ? parseInt(req.query.cursor, 10) : null;
    const search    = (req.query.search || '').trim();
    const status    = req.query.status    || null;
    const dateFrom  = req.query.dateFrom  || null; 
    const dateTo    = req.query.dateTo    || null; 
    const amountMin = req.query.amountMin ? parseFloat(req.query.amountMin) : null;
    const amountMax = req.query.amountMax ? parseFloat(req.query.amountMax) : null;

    const request      = p.request();
    const whereClauses = [];

    // Запрашиваем на один элемент больше (limit + 1), чтобы понять, есть ли следующая страница
    request.input('limit', sql.Int, limit + 1);

    // Шаг 1: Формирование динамических условий WHERE.
    
    // Курсорная пагинация: выбираем записи строго "меньше" (старее) текущего курсора
    if (cursor !== null) {
      request.input('cursor', sql.Int, cursor);
      whereClauses.push('o.order_number < @cursor');
    }
    
    // Фильтр по статусу
    if (status) {
      request.input('status', sql.NVarChar, status);
      whereClauses.push('o.status = @status');
    }

    // Полнотекстовый поиск по нескольким полям сразу
    if (search) {
      request.input('search',      sql.NVarChar, `%${search}%`);
      request.input('searchExact', sql.NVarChar, search);
      whereClauses.push(`(
        o.public_id         LIKE @search
        OR o.customer_name  LIKE @search
        OR o.customer_phone LIKE @search
        OR u.email          LIKE @search
        OR u.first_name + ' ' + ISNULL(u.last_name, '') LIKE @search
        OR CAST(o.order_number AS NVARCHAR) = @searchExact
      )`);
    }

    // Фильтрация по диапазону дат создания
    if (dateFrom) {
      request.input('dateFrom', sql.Date, dateFrom);
      whereClauses.push('o.created_at >= @dateFrom');
    }
    if (dateTo) {
      request.input('dateTo', sql.Date, dateTo);
      // DATEADD используется для захвата всего последнего дня включительно
      whereClauses.push('o.created_at < DATEADD(day, 1, @dateTo)');
    }

    // Фильтрация по сумме заказа
    if (amountMin !== null) {
      request.input('amountMin', sql.Decimal(18, 2), amountMin);
      whereClauses.push('o.total_amount >= @amountMin');
    }
    if (amountMax !== null) {
      request.input('amountMax', sql.Decimal(18, 2), amountMax);
      whereClauses.push('o.total_amount <= @amountMax');
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Шаг 2: Выполнение основного запроса на получение заголовков заказов
    const result   = await request.query(`
      SELECT TOP (@limit)
        o.id, o.order_number, o.public_id, o.status,
        o.total_amount, o.customer_name, o.customer_phone,
        o.delivery_address, o.warehouse_code, o.comment, 
        o.created_at, o.updated_at,
        u.email          AS user_email,
        u.first_name     AS user_first_name,
        u.last_name      AS user_last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereSQL}
      ORDER BY o.order_number DESC
    `);

    const rows    = result.recordset;
    const hasMore = rows.length > limit;
    
    // Если получили лишнюю строку — убираем её из ответа, но ставим флаг hasMore
    if (hasMore) rows.pop();

    // Шаг 3: Получение позиций (items) для всех найденных заказов одним запросом
    if (rows.length > 0) {
      // Чтобы не склеивать ID вручную, создаем параметры @id0, @id1...
      const itemsRequest = p.request();
      const idsParams = rows.map((r, i) => {
        const paramName = `id${i}`;
        itemsRequest.input(paramName, sql.UniqueIdentifier, r.id);
        return `@${paramName}`;
      }).join(',');

      const itemsRes = await itemsRequest.query(`
        SELECT oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name, p.emoji
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id IN (${idsParams})
      `);
      
      // Группируем позиции по ID заказа
      const itemsByOrder = {};
      itemsRes.recordset.forEach(item => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push({
          id:    item.product_id,
          name:  item.name  || 'Неизвестный товар',
          emoji: item.emoji || '📦',
          quantity: item.quantity,
          price_at_purchase: item.price_at_purchase,
        });
      });
      
      // Добавляем массив items в каждый объект заказа
      rows.forEach(o => { o.items = itemsByOrder[o.id] || []; });
    }

    res.json({ 
      data: rows, 
      nextCursor: hasMore ? rows[rows.length - 1].order_number : null 
    });
  } catch (e) {
    console.error('[Admin Orders] Fetch error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/orders/:id/status
// Изменение статуса заказа.
//
// Тело запроса (JSON):
//   status {string} — новый статус ('new' | 'processing' | 'completed' | 'cancelled')
//
// Ответ: { status: 'ok', order: { ... } }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  // Валидация: разрешены только определенные статусы
  const validationErr = validateOrderStatus(req.body.status);
  if (validationErr) return res.status(400).json(validationErr);

  const newStatus = req.body.status;

  try {
    const p = await getPool();
    const transaction = new sql.Transaction(p);
    await transaction.begin();

    try {
      // 1. Получаем текущий статус заказа
      const orderCheck = await transaction.request()
        .input('id', sql.UniqueIdentifier, req.params.id)
        .query('SELECT status FROM orders WHERE id = @id');

      if (orderCheck.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Заказ не найден' });
      }

      const oldStatus = orderCheck.recordset[0].status;

      if (oldStatus !== newStatus) {
        // Получаем товары в заказе
        const itemsRes = await transaction.request()
          .input('orderId', sql.UniqueIdentifier, req.params.id)
          .query('SELECT product_id, quantity FROM order_items WHERE order_id = @orderId');
        
        const items = itemsRes.recordset;

        // Если новый статус 'cancelled' — возвращаем товары на склад
        if (newStatus === 'cancelled') {
          for (const item of items) {
            await transaction.request()
              .input('productId', sql.UniqueIdentifier, item.product_id)
              .input('quantity',  sql.Int,              item.quantity)
              .query(`
                UPDATE products
                SET stock_quantity = stock_quantity + @quantity,
                    updated_at = SYSUTCDATETIME()
                WHERE id = @productId
              `);
          }
        }
        // Если старый статус был 'cancelled', а новый нет — списываем товары заново
        else if (oldStatus === 'cancelled') {
          for (const item of items) {
            const updateRes = await transaction.request()
              .input('productId', sql.UniqueIdentifier, item.product_id)
              .input('quantity',  sql.Int,              item.quantity)
              .query(`
                UPDATE products
                SET stock_quantity = stock_quantity - @quantity,
                    updated_at = SYSUTCDATETIME()
                OUTPUT INSERTED.name, INSERTED.stock_quantity
                WHERE id = @productId AND is_active = 1 AND stock_quantity >= @quantity
              `);

            if (updateRes.recordset.length === 0) {
              const infoRes = await transaction.request()
                .input('productId', sql.UniqueIdentifier, item.product_id)
                .query('SELECT name, stock_quantity, is_active FROM products WHERE id = @productId');

              const prodName = infoRes.recordset[0]?.name || 'Неизвестный товар';
              const prodStock = infoRes.recordset[0]?.stock_quantity || 0;
              throw new Error(`Недостаточно товара "${prodName}" для возобновления заказа (на складе: ${prodStock}, требуется: ${item.quantity})`);
            }
          }
        }
      }

      // 2. Обновляем статус заказа
      const updateOrderRes = await transaction.request()
        .input('id',     sql.UniqueIdentifier, req.params.id)
        .input('status', sql.NVarChar,         newStatus)
        .query(`
          UPDATE orders
          SET status = @status, updated_at = SYSUTCDATETIME()
          OUTPUT INSERTED.id, INSERTED.order_number, INSERTED.public_id, INSERTED.status, INSERTED.updated_at
          WHERE id = @id
        `);

      await transaction.commit();
      res.json({ status: 'ok', order: updateOrderRes.recordset[0] });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (e) {
    console.error('[Admin Orders] Update status error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
