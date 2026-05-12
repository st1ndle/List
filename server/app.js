/**
 * server/app.js — Главный модуль Express-приложения.
 *
 * Здесь происходит:
 *   1. Создание экземпляра Express-приложения
 *   2. Подключение глобальных middleware (CORS, JSON-парсер, логгер, сессии)
 *   3. Регистрация всех маршрутов (роутов)
 *   4. Health-check эндпоинт для проверки состояния сервера и БД
 *   5. Отдача статических файлов легаси-версии (HTML/CSS/JS)
 *   6. Fallback для SPA (Single Page Application)
 *
 * Файл экспортирует app, а не запускает сервер — запуск происходит в index.js.
 * Это стандартная практика: она упрощает тестирование приложения.
 */

const express    = require('express');
const session    = require('express-session'); // Middleware для управления сессиями
const MSSQLStore = require('connect-mssql-v2'); // Хранилище сессий в MSSQL вместо памяти
const cors       = require('cors');             // Cross-Origin Resource Sharing
const path       = require('path');             // Работа с путями файловой системы

// Наши собственные модули
const { dbConfig }       = require('./config/db');
const logger             = require('./middleware/logger');
const authRoutes         = require('./routes/auth.routes');
const orderRoutes        = require('./routes/orders.routes');
const catalogRoutes      = require('./routes/catalog.routes');
const warehouseRoutes    = require('./routes/warehouses.routes');
const adminOrderRoutes   = require('./routes/admin/orders.routes');
const adminWarehouseRoutes = require('./routes/admin/warehouses.routes');
const adminCatalogRoutes   = require('./routes/admin/catalog.routes');
const settingsRoutes       = require('./routes/settings.routes');
const adminSettingsRoutes  = require('./routes/admin/settings.routes');

const app = express();

// ── Основные middleware ─────────────────────────────────────────────────────────
//
// Middleware выполняются последовательно в порядке регистрации через app.use().
// Каждый из них может модифицировать req/res или завершить цепочку вызовом res.json().

// CORS: разрешает запросы с любого origin (домена) и пропускает cookie.
// origin: true — зеркалит реальный origin запроса, что нужно для credentials.
app.use(cors({ origin: true, credentials: true }));

// Парсер JSON-тела запроса: наполняет req.body объектом из входящего JSON.
// Без него req.body был бы undefined для POST/PUT запросов.
app.use(express.json());

// Наш кастомный логгер — выводит в консоль метод, URL и тело каждого запроса.
app.use(logger);

// ── Управление сессиями ────────────────────────────────────────────────────────
//
// Сессии позволяют хранить данные между HTTP-запросами одного пользователя.
// Механизм: сервер создаёт запись в таблице sessions (в MSSQL), отдаёт клиенту
// cookie с ID этой записи. При следующем запросе клиент присылает cookie,
// сервер находит запись и восстанавливает объект req.session.
app.use(session({
  // Хранилище сессий: вместо памяти (теряется при рестарте) используем MSSQL.
  // MSSQLStore автоматически создаст таблицу [sessions] в БД при первом запуске.
  store: new MSSQLStore(dbConfig),

  // Секрет для криптографической подписи сессионной cookie.
  // В продакшене ОБЯЗАТЕЛЬНО задавать через переменную окружения SESSION_SECRET.
  secret: process.env.SESSION_SECRET || 'diplom-super-secret-key-2026',

  // resave: false — не пересохранять сессию, если она не изменилась (оптимизация)
  resave: false,

  // saveUninitialized: false — не создавать сессию для анонимных посетителей.
  // Это экономит место в БД и соответствует требованиям GDPR.
  saveUninitialized: false,

  // Кастомное имя cookie вместо дефолтного 'connect.sid'
  name: 'diplom.sid',

  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Срок жизни cookie: 1 день (в миллисекундах)
    httpOnly: true,               // JavaScript на клиенте не может читать эту cookie (защита от XSS)
    // secure: true нужен при HTTPS; в разработке ставим false, иначе cookie не придёт
    secure: process.env.NODE_ENV === 'production',
    // sameSite: 'lax' — cookie отправляется при обычных переходах, но не при кросс-сайт POST.
    // Это базовая защита от CSRF-атак.
    sameSite: 'lax',
  },
}));

// ── Регистрация маршрутов (роутов) ────────────────────────────────────────────
//
// app.use(prefix, router) — все запросы, начинающиеся с prefix, передаются в router.
// Внутри роутера пути указываются уже без prefix.
// Например: authRoutes содержит router.post('/login', ...) → итоговый путь POST /api/auth/login

app.use('/api/auth',             authRoutes);          // Регистрация, вход, выход, текущий пользователь
app.use('/api/orders',           orderRoutes);          // Создание заказа, история заказов клиента
app.use('/api/warehouses',       warehouseRoutes);      // Список активных складов (публичный)
app.use('/api/admin/orders',     adminOrderRoutes);     // Управление заказами (только для admin)
app.use('/api/admin/warehouses', adminWarehouseRoutes); // Управление складами (только для admin)
app.use('/api/admin',            adminCatalogRoutes);   // Категории и продукты (admin)
app.use('/api/admin/settings',   adminSettingsRoutes);  // Настройки сайта (admin)
app.use('/api/settings',         settingsRoutes);        // Публичные настройки сайта
app.use('/',                     catalogRoutes);         // /categories, /products, /api/categories/lowest-prices

// ── Health Check ───────────────────────────────────────────────────────────────
//
// GET /health — проверка состояния сервера и подключения к БД.
// Используется системами мониторинга (например, Docker HEALTHCHECK).
// Возвращает { status: 'ok', db: 'connected' } если всё работает.
const { getPool } = require('./config/db');
app.get('/health', async (req, res) => {
  try {
    const p      = await getPool();
    // Выполняем простейший запрос для проверки соединения с БД
    const result = await p.request().query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      db: result.recordset?.[0]?.ok === 1 ? 'connected' : 'unknown',
    });
  } catch (e) {
    // БД недоступна — возвращаем 500 с сообщением об ошибке
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// ── Статические файлы легаси-версии ────────────────────────────────────────────
//
// Легаси-фронтенд (index.html / app.js / styles.css) лежит в корне проекта.
// Эти маршруты обеспечивают обратную совместимость, пока идёт миграция на React.
app.get('/app.js',    (req, res) => res.sendFile(path.join(__dirname, '../app.js')));
app.get('/styles.css',(req, res) => res.sendFile(path.join(__dirname, '../styles.css')));

// ── SPA Fallback ────────────────────────────────────────────────────────────────
//
// Все GET-запросы, не совпавшие ни с одним роутом выше, обрабатываются здесь.
// Это нужно для SPA (Single Page Application): когда пользователь обновляет
// страницу на /catalog/some-product, сервер должен вернуть index.html,
// а не 404 — маршрутизацией займётся React Router на клиенте.
//
// Важно: запросы к /api/*, не нашедшие роута, получают 404 JSON (не HTML),
// чтобы не запутывать фронтенд при отладке.
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Экспортируем приложение для запуска в index.js и для тестов
module.exports = app;
