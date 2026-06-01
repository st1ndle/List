/**
 * server/validators/auth.validator.js — Валидация данных для аутентификации.
 *
 * Зачем нужна валидация на сервере?
 *   Даже если фронтенд проверяет данные формы, сервер ОБЯЗАН проверять их
 *   самостоятельно. Пользователь или злоумышленник может отправить запрос
 *   напрямую (например, через curl или Postman), минуя форму на сайте.
 *
 * Все функции-валидаторы следуют одному соглашению:
 *   - Принимают объект с данными
 *   - Возвращают null, если данные корректны
 *   - Возвращают { error: 'Описание ошибки' }, если есть проблема
 *
 * Использование в роуте:
 *   const err = validateRegister(req.body);
 *   if (err) return res.status(400).json(err); // Прерываем обработку и отвечаем 400
 */

/**
 * Проверяет корректность данных для регистрации нового пользователя.
 *
 * Правила:
 *   - firstName обязателен и не должен быть пустой строкой
 *   - Должен быть указан хотя бы один контакт: phone ИЛИ email
 *   - password обязателен и должен быть длиной не менее 6 символов
 *   - Если email указан — он должен соответствовать формату name@domain.ext
 *
 * @param {{ firstName?: string, phone?: string, email?: string, password?: string }} body
 * @returns {{ error: string } | null}
 */
function validateRegister({ firstName, phone, email, password }) {
  // TODO: Добавить валидацию формата номера телефона
  // Имя обязательно
  if (!firstName || !firstName.trim()) {
    return { error: 'Поле "Имя" обязательно' };
  }
  // Нужен хотя бы один способ связи
  if (!phone && !email) {
    return { error: 'Укажите телефон или email' };
  }
  // Пароль не менее 6 символов
  if (!password || password.length < 6) {
    return { error: 'Пароль должен быть не менее 6 символов' };
  }
  // Если email указан, проверяем его формат регулярным выражением
  // Регулярное выражение /^[^\s@]+@[^\s@]+\.[^\s@]+$/ означает:
  //   ^[^\s@]+  — один или больше символов, кроме пробела и @
  //   @          — символ @
  //   [^\s@]+   — один или больше символов, кроме пробела и @
  //   \.         — точка
  //   [^\s@]+$   — один или больше символов до конца строки
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Некорректный формат email' };
  }
  // Все проверки прошли — ошибок нет
  return null;
}

/**
 * Проверяет корректность данных для входа в систему.
 *
 * Правила:
 *   - login (email или телефон) обязателен
 *   - password обязателен
 *
 * @param {{ login?: string, password?: string }} body
 * @returns {{ error: string } | null}
 */
function validateLogin({ login, password }) {
  if (!login || !login.trim()) {
    return { error: 'Введите логин (email или телефон)' };
  }
  if (!password) {
    return { error: 'Введите пароль' };
  }
  return null;
}

module.exports = { validateRegister, validateLogin };
