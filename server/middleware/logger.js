/**
 * server/middleware/logger.js — Middleware для логирования входящих запросов.
 *
 * Что такое middleware?
 *   В Express middleware — это функция, которая вызывается на каждый HTTP-запрос
 *   ДО того, как он попадёт в обработчик роута. Сигнатура: (req, res, next) => {}
 *   Вызов next() передаёт управление следующему middleware или роуту.
 *
 * Этот logger подключается в app.js через app.use(logger) и выводит в консоль:
 *   - Дату и время запроса
 *   - HTTP-метод (GET, POST, PATCH, ...)
 *   - URL запроса
 *   - Тело запроса (body), если оно не пустое
 *     Пароль при этом заменяется на '***' в целях безопасности.
 */
module.exports = function logger(req, res, next) {
  // Выводим время (ISO-формат), метод и путь запроса
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Если тело запроса не пустое — выводим его, скрывая поле password
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', {
      ...req.body,
      // Если поле password существует — заменяем его на '***', иначе undefined
      password: req.body.password ? '***' : undefined,
    });
  }

  // Передаём управление следующему middleware в цепочке
  next();
};
