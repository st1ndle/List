/**
 * server/routes/warehouses.routes.js — Публичный маршрут для получения складов.
 *
 * Монтируется в app.js под префиксом /api/warehouses.
 *
 * Этот файл содержит только публичные эндпоинты — те, что доступны
 * любому пользователю (в том числе неавторизованному) для выбора склада
 * при оформлении заказа.
 *
 * Управление складами (создание, изменение, удаление) доступно только
 * администраторам и находится в routes/admin/warehouses.routes.js.
 */

const express     = require('express');
const { getPool } = require('../config/db');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/warehouses
// Возвращает список АКТИВНЫХ складов, упорядоченных по городу и названию.
// Используется на странице оформления заказа для выбора склада самовывоза.
//
// Фильтр WHERE is_active = 1 гарантирует, что клиент видит только
// работающие склады. Деактивированные (is_active = 0) скрыты.
//
// Ответ: массив объектов склада { id, warehouse_code, name, city, address,
//                                  phone, working_hours_start, working_hours_end, is_active }
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const p      = await getPool();
    const result = await p.request().query(`
      SELECT id, warehouse_code, name, city, address, phone,
             CONVERT(varchar(5), working_hours_start, 108) as working_hours_start,
             CONVERT(varchar(5), working_hours_end, 108) as working_hours_end,
             is_active
      FROM warehouses
      WHERE is_active = 1         -- Только активные склады
      ORDER BY city, name         -- Сортировка по городу, затем по имени
    `);
    res.json(result.recordset);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
