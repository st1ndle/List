/**
 * server/middleware/requireAdmin.js — Middleware для защиты маршрутов, доступных только администраторам.
 *
 * Расширяет requireAuth: сначала убеждаемся, что пользователь вошёл в систему,
 * затем делаем дополнительный запрос к БД и проверяем, что его роль равна 'admin'.
 *
 * Почему нужно проверять роль в БД, а не только в сессии?
 *   Хранить роль только в сессии небезопасно: если администратор был разжалован,
 *   его сессия всё ещё содержала бы устаревшую роль. Запрос в БД при каждом
 *   обращении гарантирует актуальность данных.
 *
 * HTTP-коды ответа:
 *   401 Unauthorized — пользователь вообще не авторизован (нет userId в сессии)
 *   403 Forbidden    — пользователь авторизован, но не является администратором
 *   500 Internal Server Error — ошибка при обращении к БД
 */

const sql = require('mssql');
const { getPool } = require('../config/db');

module.exports = async function requireAdmin(req, res, next) {
  // Шаг 1: Проверяем, что пользователь вообще авторизован
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Шаг 2: Запрашиваем роль пользователя из базы данных
    const p = await getPool();
    const result = await p.request()
      // .input() — безопасная параметризация запроса, защита от SQL-инъекций
      .input('id', sql.UniqueIdentifier, req.session.userId)
      .query('SELECT role FROM users WHERE id = @id');

    // Шаг 3: Пользователь не найден в БД или его роль не 'admin' — отказываем
    if (result.recordset.length === 0 || result.recordset[0].role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin only' });
    }

    // Шаг 4: Всё ок — передаём управление роуту
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
