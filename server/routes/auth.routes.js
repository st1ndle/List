/**
 * server/routes/auth.routes.js — Маршруты аутентификации.
 *
 * Все маршруты этого файла монтируются в app.js с префиксом /api/auth,
 * поэтому реальные URL будут:
 *   POST /api/auth/register — регистрация нового пользователя
 *   POST /api/auth/login    — вход в систему
 *   POST /api/auth/logout   — выход из системы
 *   GET  /api/auth/me       — получение данных текущего пользователя
 *
 * Что такое express.Router()?
 *   Router — это мини-приложение, которое имеет те же методы (get, post, use, ...),
 *   что и app, но предназначено для группировки связанных маршрутов.
 *   Это позволяет разбить большой server.js на логически отдельные файлы.
 */

const express = require('express');
const sql     = require('mssql');
const bcrypt  = require('bcryptjs'); // Библиотека для хеширования паролей
const { getPool }                    = require('../config/db');
const { validateRegister, validateLogin } = require('../validators/auth.validator');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Регистрация нового пользователя в системе.
//
// Тело запроса (JSON):
//   firstName  {string}  — Имя (обязательно)
//   lastName   {string}  — Фамилия (опционально)
//   phone      {string}  — Телефон (обязателен, если не указан email)
//   email      {string}  — Email (обязателен, если не указан телефон)
//   password   {string}  — Пароль, минимум 6 символов
//
// Ответ: { status: 'ok', userId: UUID } со статусом 201
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  // Шаг 1: Валидация входных данных.
  // Если validateRegister вернёт ошибку, сразу отвечаем 400 Bad Request.
  const err = validateRegister(req.body);
  if (err) return res.status(400).json(err);

  const { firstName, lastName, phone, email, password } = req.body;

  // Шаг 2: Нормализация контактных данных.
  // Телефон: удаляем все нецифровые символы (скобки, дефисы, пробелы).
  //   Например: "+7 (900) 123-45-67" → "79001234567"
  //   Это нужно для надёжного поиска в БД — пользователь может ввести
  //   телефон в разных форматах, а мы всегда ищем по "чистым" цифрам.
  const cleanPhone = phone ? phone.replace(/\D/g, '') : null;
  // Email: приводим к нижнему регистру и обрезаем пробелы
  const cleanEmail = email ? email.toLowerCase().trim() : null;

  try {
    const p = await getPool();

    // Шаг 3: Проверка уникальности — нет ли уже пользователя с таким телефоном/email.
    // Используем параметризованный запрос (.input()), а не строковую подстановку,
    // чтобы предотвратить SQL-инъекции.
    const existing = await p.request()
      .input('phone', sql.NVarChar, cleanPhone)
      .input('email', sql.NVarChar, cleanEmail)
      .query('SELECT id FROM users WHERE (phone = @phone AND phone IS NOT NULL) OR (email = @email AND email IS NOT NULL)');

    if (existing.recordset.length > 0) {
      // 409 Conflict — ресурс (пользователь) с такими данными уже существует
      return res.status(409).json({ error: 'Пользователь с такими контактами уже существует' });
    }

    // Шаг 4: Хеширование пароля.
    // Никогда не храним пароль в открытом виде! bcrypt.hash() создаёт необратимый хеш.
    // Второй аргумент (10) — «стоимость» (cost factor): чем больше, тем медленнее
    // подбор пароля злоумышленником, но и тем дольше регистрация. 10 — стандартный баланс.
    const hash = await bcrypt.hash(password, 10);

    // Шаг 5: Создание пользователя в БД.
    // OUTPUT INSERTED.id — MSSQL-синтаксис: вернуть поле id только что вставленной строки.
    // Это удобнее, чем делать отдельный SELECT после INSERT.
    const result = await p.request()
      .input('firstName', sql.NVarChar, firstName.trim())
      .input('lastName',  sql.NVarChar, lastName ? lastName.trim() : null)
      .input('phone',     sql.NVarChar, cleanPhone)
      .input('email',     sql.NVarChar, cleanEmail)
      .input('hash',      sql.NVarChar, hash)
      .query(`INSERT INTO users (first_name, last_name, phone, email, password_hash)
              OUTPUT INSERTED.id
              VALUES (@firstName, @lastName, @phone, @email, @hash)`);

    // Шаг 6: Автоматический вход — сохраняем userId в сессии,
    // чтобы пользователь не вводил логин/пароль сразу после регистрации.
    const userId = result.recordset[0].id;
    req.session.userId = userId;

    // 201 Created — успешно создан новый ресурс
    res.status(201).json({ status: 'ok', userId });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Вход пользователя в систему.
//
// Тело запроса (JSON):
//   login    {string} — Email или телефон пользователя
//   password {string} — Пароль
//
// Ответ: { status: 'ok', userId: UUID }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const err = validateLogin(req.body);
  if (err) return res.status(400).json(err);

  const { login, password } = req.body;

  // Определяем тип логина: email (содержит @) или телефон
  const isEmail     = login.includes('@');
  // Нормализуем: email → lowercase, телефон → только цифры
  const searchValue = isEmail ? login.toLowerCase().trim() : login.replace(/\D/g, '');
  // Выбираем нужный SQL-запрос в зависимости от типа логина
  const query       = isEmail
    ? 'SELECT * FROM users WHERE email = @val'
    : 'SELECT * FROM users WHERE phone = @val';

  try {
    const p      = await getPool();
    const result = await p.request().input('val', sql.NVarChar, searchValue).query(query);

    // Пользователь не найден — возвращаем ту же ошибку, что и при неверном пароле.
    // Это сделано намеренно: не даём злоумышленнику понять, зарегистрирован ли email/телефон.
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const user = result.recordset[0];

    // bcrypt.compare() — сравнивает введённый пароль с хешем из БД.
    // Даже если два пользователя имеют одинаковый пароль, их хеши будут разными
    // (bcrypt добавляет случайную «соль» при хешировании).
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Умышленно та же ошибка, что и при ненайденном пользователе
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Успешный вход: сохраняем userId в сессии
    req.session.userId = user.id;
    res.json({ status: 'ok', userId: user.id });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Выход из системы: уничтожение сессии на сервере и удаление cookie у клиента.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  // req.session.destroy() — удаляет запись сессии из БД (таблица sessions)
  // и очищает объект req.session. Принимает callback с возможной ошибкой.
  req.session.destroy(e => {
    if (e) return res.status(500).json({ error: 'Logout failed' });
    // Удаляем сессионную cookie у клиента — браузер больше не будет её отправлять
    res.clearCookie('diplom.sid');
    res.json({ status: 'ok' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Возвращает данные текущего авторизованного пользователя.
// Используется фронтендом при загрузке страницы, чтобы проверить,
// сохранилась ли сессия (например, после перезагрузки страницы).
//
// Ответ: { user: { id, first_name, last_name, phone, email, role } }
//        { user: null } если пользователь не авторизован
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  console.log('[me] Session userId:', req.session.userId);
  // Если сессии нет — просто возвращаем null без ошибки.
  // Это не ошибка, это нормальное состояние для незалогиненного пользователя.
  if (!req.session.userId) return res.json({ user: null });

  try {
    const p      = await getPool();
    const result = await p.request()
      .input('id', sql.UniqueIdentifier, req.session.userId)
      // Не делаем SELECT * — явно перечисляем нужные поля, чтобы случайно
      // не вернуть клиенту password_hash или другие чувствительные данные
      .query('SELECT id, first_name, last_name, phone, email, role FROM users WHERE id = @id');

    if (result.recordset.length === 0) {
      // Сессия есть, но пользователь не найден в БД (например, был удалён)
      return res.status(401).json({ error: 'User not found' });
    }
    res.json({ user: result.recordset[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
