/**
 * server/index.js — Точка входа в серверное приложение.
 *
 * Этот файл запускает HTTP-сервер на указанном порту.
 * Вся логика приложения (маршруты, middleware, сессии) описана в ./app.js.
 *
 * Переменные окружения берутся из файла .env в корне проекта:
 *   PORT         — порт, на котором слушает сервер (по умолчанию 3000)
 *   DB_USER      — имя пользователя БД
 *   DB_PASSWORD  — пароль БД
 *   DB_HOST      — хост БД (по умолчанию localhost)
 *   DB_PORT      — порт БД (по умолчанию 1433 для MSSQL)
 *   DB_NAME      — имя базы данных
 *   SESSION_SECRET — секрет для подписи сессионных cookie
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app  = require('./app');
const PORT = process.env.PORT || 3000;

// Запускаем HTTP-сервер и начинаем принимать входящие соединения
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
