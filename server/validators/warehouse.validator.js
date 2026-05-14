/**
 * server/validators/warehouse.validator.js — Валидация данных для складов.
 *
 * Соглашение: функции возвращают null (ОК) или { error: '...' } (ошибка).
 */

/**
 * Проверяет данные для создания или обновления склада.
 *
 * @param {{ warehouse_code?: string, name?: string, city?: string, address?: string }} body
 * @returns {{ error: string } | null}
 */
function validateWarehouse({ warehouse_code, name, city, address }) {
  if (!warehouse_code || !warehouse_code.trim()) {
    return { error: 'Поле "warehouse_code" обязательно' };
  }
  if (!/^[A-Z0-9_-]{1,10}$/i.test(warehouse_code)) {
    return { error: 'warehouse_code: только буквы, цифры, дефис, подчёркивание — макс. 10 символов' };
  }
  if (!name || !name.trim())    return { error: 'Поле "name" обязательно' };
  if (!city || !city.trim())    return { error: 'Поле "city" обязательно' };
  if (!address || !address.trim()) return { error: 'Поле "address" обязательно' };
  return null;
}

module.exports = { validateWarehouse };
