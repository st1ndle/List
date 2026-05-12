/**
 * server/routes/settings.routes.js — Публичный API для настроек сайта.
 *
 * Эти эндпоинты доступны без авторизации и возвращают
 * динамические параметры сайта (статистика, контакты и т.д.).
 */

const router = require('express').Router();
const { getPool } = require('../config/db');

/**
 * GET /api/settings
 * Возвращает все публичные настройки сайта в виде плоского объекта.
 *
 * Пример ответа:
 * {
 *   "stat_pallets":   "17К",
 *   "stat_transport": "120",
 *   "stat_employees": "150",
 *   "stat_year":      "1998"
 * }
 */
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query('SELECT [key], [value] FROM site_settings ORDER BY [key]');

    // Преобразуем массив строк в плоский объект { key: value }
    const settings = Object.fromEntries(
      result.recordset.map((row) => [row.key, row.value])
    );

    res.json(settings);
  } catch (err) {
    console.error('[Settings] Ошибка загрузки настроек:', err);
    res.status(500).json({ error: 'Не удалось загрузить настройки сайта' });
  }
});

module.exports = router;
