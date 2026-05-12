/**
 * server/routes/admin/settings.routes.js — Admin API для управления настройками сайта.
 *
 * Все эндпоинты защищены middleware requireAdmin.
 * Позволяет получить полный список настроек (с label и датой обновления)
 * и обновить значение конкретной настройки.
 */

const router = require('express').Router();
const { getPool } = require('../../config/db');
const requireAdmin = require('../../middleware/requireAdmin');

/**
 * GET /api/admin/settings
 * Полный список настроек с label и датой последнего обновления.
 * Используется Admin UI для отображения таблицы редактирования.
 *
 * Пример ответа:
 * [
 *   { key: "stat_pallets", value: "17К", label: "Паллетомест", updated_at: "2026-05-12T..." },
 *   ...
 * ]
 */
router.get('/', requireAdmin, async (req, res) => {
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

/**
 * PUT /api/admin/settings/:key
 * Обновляет значение настройки по ключу.
 *
 * Body: { value: "новое значение" }
 *
 * @param {string} key - Ключ настройки (например, "stat_pallets")
 */
router.put('/:key', requireAdmin, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value || String(value).trim() === '') {
    return res.status(400).json({ error: 'Значение не может быть пустым' });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('key',   require('mssql').NVarChar, key)
      .input('value', require('mssql').NVarChar, String(value).trim())
      .query(`
        UPDATE site_settings
        SET [value] = @value, [updated_at] = GETDATE()
        WHERE [key] = @key
      `);

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
