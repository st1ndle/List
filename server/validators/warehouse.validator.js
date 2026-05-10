/**
 * server/validators/warehouse.validator.js — Валидация данных для складов и статусов заказов.
 *
 * Содержит два независимых валидатора:
 *   - validateWarehouse    — для создания/редактирования склада
 *   - validateOrderStatus  — для смены статуса заказа администратором
 *
 * Соглашение: функции возвращают null (ОК) или { error: '...' } (ошибка).
 */

// Список допустимых статусов заказа — определяем один раз, используем в нескольких местах.
// Вынесено в константу, чтобы не дублировать строку в нескольких местах кода.
const ALLOWED_ORDER_STATUSES = ['new', 'processing', 'completed', 'cancelled'];

/**
 * Проверяет данные для создания или обновления склада.
 *
 * Обязательные поля:
 *   warehouse_code — уникальный код склада (только латинские буквы, цифры, дефис, подчёркивание; макс. 10 символов)
 *   name           — название склада
 *   city           — город расположения
 *   address        — полный адрес
 *
 * Необязательные поля (проверяются при наличии):
 *   phone, working_hours_start, working_hours_end, is_active
 *
 * @param {{ warehouse_code?: string, name?: string, city?: string, address?: string }} body
 * @returns {{ error: string } | null}
 */
function validateWarehouse({ warehouse_code, name, city, address }) {
  // Код склада обязателен
  if (!warehouse_code || !warehouse_code.trim()) {
    return { error: 'Поле "warehouse_code" обязательно' };
  }
  // Проверяем формат кода склада: только разрешённые символы, не более 10 знаков.
  // Регулярное выражение /^[A-Z0-9_-]{1,10}$/i:
  //   i       — регистронезависимая проверка (принимаем и строчные буквы)
  //   ^       — начало строки
  //   [A-Z0-9_-]{1,10} — от 1 до 10 символов из набора: буквы A-Z, цифры 0-9, _ или -
  //   $       — конец строки
  if (!/^[A-Z0-9_-]{1,10}$/i.test(warehouse_code)) {
    return { error: 'warehouse_code: только буквы, цифры, дефис, подчёркивание — макс. 10 символов' };
  }
  if (!name || !name.trim())    return { error: 'Поле "name" обязательно' };
  if (!city || !city.trim())    return { error: 'Поле "city" обязательно' };
  if (!address || !address.trim()) return { error: 'Поле "address" обязательно' };
  return null;
}

/**
 * Проверяет, что переданный статус заказа является допустимым.
 *
 * Допустимые статусы: 'new', 'processing', 'completed', 'cancelled'
 * Статусы отражают жизненный цикл заказа:
 *   new        — только что создан, ещё не взят в работу
 *   processing — взят в работу, обрабатывается
 *   completed  — выполнен и доставлен
 *   cancelled  — отменён
 *
 * @param {string} status
 * @returns {{ error: string } | null}
 */
function validateOrderStatus(status) {
  if (!status || !ALLOWED_ORDER_STATUSES.includes(status)) {
    return { error: `Недопустимый статус. Допустимые: ${ALLOWED_ORDER_STATUSES.join(', ')}` };
  }
  return null;
}

module.exports = { validateWarehouse, validateOrderStatus, ALLOWED_ORDER_STATUSES };
