/**
 * server/routes/admin/settings.routes.js — Admin API для управления глобальными настройками сайта.
 *
 * Все маршруты защищены requireAdmin и монтируются с префиксом /api/admin/settings.
 * Позволяет управлять константами и текстами, которые отображаются на фронтенде
 * (например, статистика на главной странице, контактная информация и т.д.).
 *
 * Маршруты:
 *   GET /api/admin/settings      — получение полного списка настроек
 *   PUT /api/admin/settings/:key — обновление значения настройки по её ключу
 */

const router = require('express').Router();
const sql = require('mssql');
const { getPool } = require('../../config/db');
const requireAdmin = require('../../middleware/requireAdmin');

// Применяем проверку прав администратора ко всем маршрутам в этом файле
router.use(requireAdmin);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/settings
// Возвращает полный список настроек из таблицы site_settings.
// Используется в Admin UI для отображения таблицы управления сайтом.
//
// Ответ: [ { key, value, label, updated_at }, ... ]
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query('SELECT [key], [value], [label], [updated_at] FROM site_settings ORDER BY [key]');

    res.json(result.recordset);
  } catch (err) {
    console.error('[Admin Settings] Ошибка загрузки настроек:', err);
    res.status(500).json({ error: 'Не удалось загрузить настройки' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/settings/:key
// Обновляет значение конкретной настройки.
//
// Параметры URL:
//   key {string} — уникальный ключ настройки (например, "stat_pallets")
//
// Тело запроса (JSON):
//   value {string} — новое текстовое значение
//
// Ответ: { success: true, key, value }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  // Проверка: значение не должно быть пустым
  if (value === undefined || value === null || String(value).trim() === '') {
    return res.status(400).json({ error: 'Значение не может быть пустым' });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('key', sql.NVarChar, key)
      .input('value', sql.NVarChar, String(value).trim())
      .query(`
        UPDATE site_settings
        SET [value] = @value, [updated_at] = SYSUTCDATETIME()
        WHERE [key] = @key
      `);

    // Если rowsAffected равно 0, значит настройки с таким ключом не существует
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: `Настройка с ключом "${key}" не найдена` });
    }

    res.json({ success: true, key, value: String(value).trim() });
  } catch (err) {
    console.error('[Admin Settings] Ошибка обновления:', err);
    res.status(500).json({ error: 'Не удалось обновить настройку' });
  }
});

module.exports = router;
