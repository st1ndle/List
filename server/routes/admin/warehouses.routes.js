/**
 * server/routes/admin/warehouses.routes.js — CRUD-управление складами (только для администраторов).
 *
 * Все маршруты этого файла защищены requireAdmin и монтируются с префиксом /api/admin/warehouses.
 *
 * Маршруты:
 *   GET    /api/admin/warehouses      — получение списка всех складов
 *   POST   /api/admin/warehouses      — создание нового склада
 *   PUT    /api/admin/warehouses/:id  — полное обновление данных склада
 *   DELETE /api/admin/warehouses/:id  — "мягкое" удаление склада (деактивация)
 *
 * Особенности:
 *   Используется "Мягкое удаление" (is_active = 0) для сохранения целостности истории заказов.
 */

const express      = require('express');
const sql          = require('mssql');
const { getPool }  = require('../../config/db');
const requireAdmin = require('../../middleware/requireAdmin');
const { validateWarehouse } = require('../../validators/warehouse.validator');

const router = express.Router();

// Применяем проверку прав администратора ко всем маршрутам в этом файле
router.use(requireAdmin);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/warehouses
// Возвращает список ВСЕХ складов в системе, включая деактивированные.
// Это необходимо для админ-панели, чтобы менеджер мог видеть архивные склады и
// при необходимости возвращать их в работу.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const p      = await getPool();
    const result = await p.request().query(`
      SELECT id, warehouse_code, name, city, address, phone,
             CONVERT(varchar(5), working_hours_start, 108) as working_hours_start,
             CONVERT(varchar(5), working_hours_end, 108) as working_hours_end,
             is_active, created_at, updated_at
      FROM warehouses
      ORDER BY city, name
    `);
    res.json(result.recordset);
  } catch (e) {
    console.error('[Admin Warehouses] Get all error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/warehouses
// Создание нового склада в базе данных.
//
// Тело запроса (JSON):
//   warehouse_code      {string}  — Уникальный код (макс. 10 символов)
//   name                {string}  — Понятное название
//   city                {string}  — Город расположения
//   address             {string}  — Точный адрес
//   phone               {string}  — Контактный телефон (опционально)
//   working_hours_start {string}  — Начало работы ("HH:MM")
//   working_hours_end   {string}  — Конец работы ("HH:MM")
//   is_active           {boolean} — Статус (по умолчанию true)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  // Шаг 1: Валидация входных данных
  const err = validateWarehouse(req.body);
  if (err) return res.status(400).json(err);

  const { warehouse_code, name, city, address, phone, working_hours_start, working_hours_end, is_active } = req.body;

  try {
    const p      = await getPool();
    const result = await p.request()
      // Нормализация: приводим код к верхнему регистру для единообразия поиска
      .input('code',   sql.NVarChar, warehouse_code.toUpperCase().slice(0, 10))
      .input('name',   sql.NVarChar, name.trim())
      .input('city',   sql.NVarChar, city.trim())
      .input('addr',   sql.NVarChar, address.trim())
      .input('phone',  sql.NVarChar, phone  || null)
      .input('start',  sql.Time,     working_hours_start || null)
      .input('end',    sql.Time,     working_hours_end   || null)
      .input('active', sql.Bit,      is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        DECLARE @inserted TABLE (id UNIQUEIDENTIFIER);

        INSERT INTO warehouses (warehouse_code, name, city, address, phone, working_hours_start, working_hours_end, is_active)
        OUTPUT INSERTED.id INTO @inserted
        VALUES (@code, @name, @city, @addr, @phone, @start, @end, @active);

        SELECT id, warehouse_code, name, city, address, phone,
               CONVERT(varchar(5), working_hours_start, 108) as working_hours_start,
               CONVERT(varchar(5), working_hours_end, 108) as working_hours_end,
               is_active, created_at, updated_at
        FROM warehouses
        WHERE id = (SELECT id FROM @inserted);
      `);
    res.status(201).json(result.recordset[0]);
  } catch (e) {
    // 2627 — нарушение UNIQUE CONSTRAINT на поле warehouse_code
    if (e.number === 2627) return res.status(409).json({ error: 'Склад с таким warehouse_code уже существует' });
    console.error('[Admin Warehouses] Create error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/warehouses/:id
// Полное обновление данных существующего склада.
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const err = validateWarehouse(req.body);
  if (err) return res.status(400).json(err);

  const { warehouse_code, name, city, address, phone, working_hours_start, working_hours_end, is_active } = req.body;

  try {
    const p      = await getPool();
    const result = await p.request()
      .input('id',     sql.UniqueIdentifier, req.params.id)
      .input('code',   sql.NVarChar, warehouse_code.toUpperCase().slice(0, 10))
      .input('name',   sql.NVarChar, name.trim())
      .input('city',   sql.NVarChar, city.trim())
      .input('addr',   sql.NVarChar, address.trim())
      .input('phone',  sql.NVarChar, phone  || null)
      .input('start',  sql.Time,     working_hours_start || null)
      .input('end',    sql.Time,     working_hours_end   || null)
      .input('active', sql.Bit,      is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        UPDATE warehouses
        SET warehouse_code = @code, name = @name, city = @city, address = @addr,
            phone = @phone, working_hours_start = @start, working_hours_end = @end,
            is_active = @active, updated_at = SYSUTCDATETIME()
        WHERE id = @id;

        SELECT id, warehouse_code, name, city, address, phone,
               CONVERT(varchar(5), working_hours_start, 108) as working_hours_start,
               CONVERT(varchar(5), working_hours_end, 108) as working_hours_end,
               is_active, created_at, updated_at
        FROM warehouses
        WHERE id = @id;
      `);

    if (result.recordset.length === 0) return res.status(404).json({ error: 'Склад не найден' });
    res.json(result.recordset[0]);
  } catch (e) {
    if (e.number === 2627) return res.status(409).json({ error: 'Склад с таким warehouse_code уже существует' });
    console.error('[Admin Warehouses] Update error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/warehouses/:id
// "Мягкое" удаление склада: перевод в неактивное состояние.
//
// Почему не DELETE FROM?
//   Склады связаны с заказами через warehouse_code. Если физически удалить склад,
//   в исторических данных о заказах возникнут битые ссылки. 
//   Вместо этого мы просто скрываем склад из выбора для новых заказов.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const p      = await getPool();
    const result = await p.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query(`
        UPDATE warehouses
        SET is_active = 0, updated_at = SYSUTCDATETIME()
        OUTPUT INSERTED.id
        WHERE id = @id
      `);

    if (result.recordset.length === 0) return res.status(404).json({ error: 'Склад не найден' });
    res.json({ status: 'ok', id: result.recordset[0].id });
  } catch (e) {
    console.error('[Admin Warehouses] Delete error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
