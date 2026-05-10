/**
 * server/routes/admin/warehouses.routes.js — CRUD-управление складами (только для администраторов).
 *
 * Монтируется в app.js под префиксом /api/admin/warehouses.
 * router.use(requireAdmin) защищает все маршруты файла.
 *
 * Маршруты:
 *   GET    /api/admin/warehouses      — все склады (включая неактивные)
 *   POST   /api/admin/warehouses      — создать склад
 *   PUT    /api/admin/warehouses/:id  — полное обновление склада
 *   DELETE /api/admin/warehouses/:id  — мягкое удаление (деактивация, is_active = 0)
 *
 * Мягкое удаление (soft delete):
 *   Вместо физического DELETE из таблицы мы ставим флаг is_active = 0.
 *   Это позволяет сохранить историю (заказы ссылаются на склад),
 *   а клиентский API (/api/warehouses) просто фильтрует по is_active = 1.
 */

const express      = require('express');
const sql          = require('mssql');
const { getPool }  = require('../../config/db');
const requireAdmin = require('../../middleware/requireAdmin');
const { validateWarehouse } = require('../../validators/warehouse.validator');

const router = express.Router();
router.use(requireAdmin); // Все маршруты ниже доступны только администраторам

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/warehouses
// Возвращает ВСЕ склады, включая деактивированные (в отличие от публичного API).
// Нужно для административной панели, чтобы видеть полный список и управлять им.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const p      = await getPool();
    const result = await p.request().query(`
      SELECT id, warehouse_code, name, city, address, phone,
             working_hours_start, working_hours_end, is_active, created_at, updated_at
      FROM warehouses
      ORDER BY city, name
    `);
    res.json(result.recordset);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/warehouses
// Создание нового склада.
//
// Тело запроса (JSON):
//   warehouse_code      {string}  — уникальный код (обязательно, макс. 10 симв.)
//   name                {string}  — название склада (обязательно)
//   city                {string}  — город (обязательно)
//   address             {string}  — адрес (обязательно)
//   phone               {string}  — телефон (опционально)
//   working_hours_start {string}  — начало работы, формат "HH:MM" (опционально)
//   working_hours_end   {string}  — конец работы, формат "HH:MM" (опционально)
//   is_active           {boolean} — активен ли склад (по умолчанию true)
//
// Ответ: созданный объект склада со статусом 201
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const err = validateWarehouse(req.body);
  if (err) return res.status(400).json(err);

  const { warehouse_code, name, city, address, phone, working_hours_start, working_hours_end, is_active } = req.body;

  try {
    const p      = await getPool();
    const result = await p.request()
      // toUpperCase().slice(0, 10) — приводим код к верхнему регистру и обрезаем до 10 символов
      .input('code',   sql.NVarChar, warehouse_code.toUpperCase().slice(0, 10))
      .input('name',   sql.NVarChar, name.trim())
      .input('city',   sql.NVarChar, city.trim())
      .input('addr',   sql.NVarChar, address.trim())
      .input('phone',  sql.NVarChar, phone  || null)
      .input('start',  sql.Time,     working_hours_start || null)
      .input('end',    sql.Time,     working_hours_end   || null)
      // is_active !== undefined ? ... : 1 — если поле не передано, по умолчанию склад активен
      .input('active', sql.Bit,      is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        INSERT INTO warehouses (warehouse_code, name, city, address, phone, working_hours_start, working_hours_end, is_active)
        OUTPUT INSERTED.*
        VALUES (@code, @name, @city, @addr, @phone, @start, @end, @active)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (e) {
    // Код ошибки 2627 в MSSQL — нарушение UNIQUE-ограничения.
    // warehouse_code имеет UNIQUE-индекс в таблице, поэтому дубли недопустимы.
    // Возвращаем 409 Conflict с понятным сообщением вместо технического 500.
    if (e.number === 2627) return res.status(409).json({ error: 'Склад с таким warehouse_code уже существует' });
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/warehouses/:id
// Полное обновление существующего склада.
//
// :id — UUID склада (из URL)
// Тело запроса — те же поля, что при создании (все обязательные обязательны).
//
// Используем PUT (не PATCH), потому что обновляем все поля сразу.
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
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    // Если recordset пуст — склад с таким id не существует
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Склад не найден' });
    res.json(result.recordset[0]);
  } catch (e) {
    if (e.number === 2627) return res.status(409).json({ error: 'Склад с таким warehouse_code уже существует' });
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/warehouses/:id
// Мягкое удаление склада: устанавливает is_active = 0 вместо физического удаления.
//
// Почему не физическое удаление?
//   Заказы хранят ссылку на warehouse_code. Если удалить склад из таблицы,
//   история заказов потеряет данные о месте самовывоза.
//   "Мягкое" удаление сохраняет запись в БД, но скрывает её от клиентов.
//
// Ответ: { status: 'ok', id: UUID }
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
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
