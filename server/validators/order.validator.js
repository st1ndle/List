/**
 * server/validators/order.validator.js — Валидация данных для создания заказа.
 *
 * Проверяет, что в запросе на создание заказа (POST /api/orders)
 * переданы корректные товары и общая сумма.
 *
 * Соглашение: функция возвращает null (ОК) или { error: '...' } (ошибка).
 */

/**
 * Проверяет тело запроса на создание заказа.
 *
 * Правила:
 *   - items должен быть непустым массивом
 *   - Каждый товар в массиве должен иметь:
 *       id              — UUID товара (обязательно)
 *       quantity        — количество, не менее 1
 *       price_at_purchase — цена на момент покупки, не отрицательная
 *   - total_amount — итоговая сумма, должна быть больше нуля
 *
 * Почему проверяем price_at_purchase, а не берём цену из БД?
 *   Цена фиксируется в момент оформления заказа. Если цена товара изменится
 *   после оформления, история заказов должна хранить актуальную цену на тот момент.
 *
 * @param {{ items?: Array, total_amount?: number }} body
 * @returns {{ error: string } | null}
 */
function validateCreateOrder({ items, total_amount }) {
  // Проверяем, что items — непустой массив
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { error: 'Корзина пуста' };
  }

  // Проверяем каждый товар в корзине по отдельности
  for (const item of items) {
    if (!item.id) {
      return { error: 'Некорректный товар: отсутствует id' };
    }
    // quantity должно быть целым числом >= 1
    if (!item.quantity || item.quantity < 1) {
      return { error: 'Некорректное количество товара' };
    }
    // price_at_purchase должна быть задана и не отрицательной
    // Проверка == null включает и undefined, и null
    if (item.price_at_purchase == null || item.price_at_purchase < 0) {
      return { error: 'Некорректная цена товара' };
    }
  }

  // Итоговая сумма должна быть положительным числом
  if (total_amount == null || total_amount <= 0) {
    return { error: 'Некорректная сумма заказа' };
  }

  return null;
}

module.exports = { validateCreateOrder };
