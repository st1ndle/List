const express        = require('express');
const sql            = require('mssql');
const { getPool }    = require('../../config/db');
const requireAdmin   = require('../../middleware/requireAdmin');
const { validateOrderStatus } = require('../../validators/warehouse.validator');

const router = express.Router();
router.use(requireAdmin);

/**
 * GET /api/admin/orders
 * Список заказов с курсорной пагинацией и поиском.
 * Query: search, cursor, limit, status
 */
router.get('/', async (req, res) => {
  try {
    const p      = await getPool();
    const limit  = Math.min(parseInt(req.query.limit  || '20', 10), 100);
    const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : null;
    const search = (req.query.search || '').trim();
    const status = req.query.status || null;

    const request      = p.request();
    const whereClauses = [];
    request.input('limit', sql.Int, limit + 1);

    if (cursor !== null) {
      request.input('cursor', sql.Int, cursor);
      whereClauses.push('o.order_number < @cursor');
    }
    if (status) {
      request.input('status', sql.NVarChar, status);
      whereClauses.push('o.status = @status');
    }
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

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const result   = await request.query(`
      SELECT TOP (@limit)
        o.id, o.order_number, o.public_id, o.status,
        o.total_amount, o.customer_name, o.customer_phone,
        o.delivery_address, o.comment, o.created_at, o.updated_at,
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
    if (hasMore) rows.pop();

    res.json({ data: rows, nextCursor: hasMore ? rows[rows.length - 1].order_number : null });
  } catch (e) {
    console.error('Admin orders fetch error:', e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Body: { status: 'new' | 'processing' | 'completed' | 'cancelled' }
 */
router.patch('/:id/status', async (req, res) => {
  const validationErr = validateOrderStatus(req.body.status);
  if (validationErr) return res.status(400).json(validationErr);

  try {
    const p      = await getPool();
    const result = await p.request()
      .input('id',     sql.UniqueIdentifier, req.params.id)
      .input('status', sql.NVarChar,         req.body.status)
      .query(`
        UPDATE orders
        SET status = @status, updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.id, INSERTED.order_number, INSERTED.public_id, INSERTED.status, INSERTED.updated_at
        WHERE id = @id
      `);

    if (result.recordset.length === 0) return res.status(404).json({ error: 'Заказ не найден' });
    res.json({ status: 'ok', order: result.recordset[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
