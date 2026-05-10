/**
 * server/middleware/requireAuth.js — Middleware для защиты маршрутов от неавторизованных пользователей.
 *
 * Подключается к конкретным роутам (или ко всему роутеру), чтобы запросить
 * аутентификацию перед выполнением основной логики.
 *
 * Принцип работы:
 *   После успешного входа (POST /api/auth/login) на сервере создаётся сессия,
 *   а в req.session.userId сохраняется UUID пользователя.
 *   При каждом последующем запросе браузер автоматически отправляет сессионную
 *   cookie (diplom.sid), по которой сервер восстанавливает объект req.session.
 *
 *   Если req.session.userId НЕ задан — пользователь не вошёл в систему,
 *   и мы отвечаем 401 Unauthorized, не допуская до роута.
 *
 * Пример подключения в роуте:
 *   const requireAuth = require('../middleware/requireAuth');
 *   router.post('/', requireAuth, async (req, res) => { ... });
 *
 * HTTP-коды ответа:
 *   401 Unauthorized — пользователь не авторизован (нет активной сессии)
 */
module.exports = function requireAuth(req, res, next) {
  // Проверяем, есть ли userId в текущей сессии
  if (!req.session.userId) {
    // Пользователь не вошёл — отказываем в доступе
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Пользователь авторизован — передаём управление дальше
  next();
};
