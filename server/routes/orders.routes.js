/**
 * server/routes/orders.routes.js — Маршруты заказов для обычных пользователей.
 *
 * Монтируется в app.js под префиксом /api/orders.
 *
 * Все маршруты защищены middleware requireAuth — только авторизованные
 * пользователи могут создавать заказы и просматривать свою историю.
 *
 * Маршруты:
 *   POST /api/orders   — создание нового заказа
 *   GET  /api/orders   — получение истории заказов текущего пользователя
 */

const express      = require('express');
const sql          = require('mssql');
const { getPool }  = require('../config/db');
const requireAuth  = require('../middleware/requireAuth');
const { validateCreateOrder } = require('../validators/order.validator');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Создание нового заказа с товарами.
//
// Тело запроса (JSON):
//   items            {Array}  — массив товаров: [{ id, quantity, price_at_purchase }, ...]
//   total_amount     {number} — итоговая сумма заказа
//   delivery_address {string} — адрес доставки (опционально)
//   comment          {string} — комментарий к заказу (опционально)
//   customer_name    {string} — имя получателя (опционально, берётся из профиля)
//   customer_phone   {string} — телефон получателя (опционально, берётся из профиля)
//   warehouse_code   {string} — код склада самовывоза (опционально)
//
// Ответ: { status: 'ok', order_id, order_number, public_id }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  // Шаг 1: Валидация входных данных
  const err = validateCreateOrder(req.body);
  if (err) return res.status(400).json(err);

  const {
    items, total_amount, delivery_address,
    comment, customer_name, customer_phone, warehouse_code,
  } = req.body;

  try {
    const p = await getPool();

    // Шаг 2: Создаём транзакцию.
    //
    // Что такое транзакция?
    //   Это набор операций с БД, которые выполняются как единое целое:
    //   либо все успешно (commit), либо ни одна (rollback).
    //   Здесь мы создаём запись в orders И несколько записей в order_items.
    //   Если при добавлении товара произойдёт ошибка — весь заказ откатится,
    //   и в БД не останется "пустого" заказа без товаров.
    const transaction = new sql.Transaction(p);
    await transaction.begin();

    try {
      // Шаг 3: Получаем данные пользователя из БД.
      // Они нужны как запасные значения для имени/телефона получателя,
      // если клиент не передал customer_name / customer_phone.
      const userRes = await transaction.request()
        .input('userId', sql.UniqueIdentifier, req.session.userId)
        .query('SELECT first_name, last_name, phone FROM users WHERE id = @userId');
      if (userRes.recordset.length === 0) throw new Error('User not found');
      const user = userRes.recordset[0];

      // Используем переданные данные получателя, или берём их из профиля пользователя
      const finalName  = customer_name  || `${user.first_name} ${user.last_name || ''}`.trim();
      const finalPhone = customer_phone || user.phone || '';

      // Шаг 4: Проверяем warehouse_code (если передан).
      // Проверяем не только существование склада, но и его активность (is_active = 1).
      // Если склад не найден или неактивен — обнуляем warehouse_code в заказе.
      let finalWarehouseCode = null;
      if (warehouse_code) {
        const whRes = await transaction.request()
          .input('wcode', sql.NVarChar, warehouse_code)
          .query('SELECT warehouse_code FROM warehouses WHERE warehouse_code = @wcode AND is_active = 1');
        if (whRes.recordset.length > 0) finalWarehouseCode = whRes.recordset[0].warehouse_code;
      }

      // Шаг 5: Вставляем основную запись заказа в таблицу orders.
      // OUTPUT INSERTED.* — возвращаем сгенерированные сервером поля:
      //   id           — UUID заказа (генерируется SQL через DEFAULT newid())
      //   order_number — автоинкрементный номер (IDENTITY)
      //   public_id    — читаемый публичный ID вида "UF32-00000189" (вычисляемое поле)
      const orderRes = await transaction.request()
        .input('userId',          sql.UniqueIdentifier, req.session.userId)
        .input('warehouseCode',   sql.NVarChar,         finalWarehouseCode)
        .input('totalAmount',     sql.Decimal(10, 2),   total_amount)
        .input('customerName',    sql.NVarChar,         finalName)
        .input('customerPhone',   sql.NVarChar,         finalPhone)
        .input('deliveryAddress', sql.NVarChar,         delivery_address || null)
        .input('comment',         sql.NVarChar,         comment || null)
        .query(`
          INSERT INTO orders
            (user_id, warehouse_code, status, total_amount, customer_name, customer_phone, delivery_address, comment)
          OUTPUT INSERTED.id, INSERTED.order_number, INSERTED.public_id
          VALUES (@userId, @warehouseCode, 'new', @totalAmount, @customerName, @customerPhone, @deliveryAddress, @comment)
        `);

      // Деструктурируем полученные сгенерированные поля заказа
      const { id: orderId, order_number, public_id } = orderRes.recordset[0];

      // Шаг 6: Проверяем остаток, списываем его и вставляем товары в таблицу order_items.
      for (const item of items) {
        // Атомарное списание остатка товара
        const updateRes = await transaction.request()
          .input('productId', sql.UniqueIdentifier, String(item.id))
          .input('quantity',  sql.Int,              item.quantity)
          .query(`
            UPDATE products
            SET stock_quantity = stock_quantity - @quantity,
                updated_at = SYSUTCDATETIME()
            OUTPUT INSERTED.name, INSERTED.stock_quantity
            WHERE id = @productId AND is_active = 1 AND stock_quantity >= @quantity
          `);

        if (updateRes.recordset.length === 0) {
          // Если обновление не произошло — выясняем точную причину
          const infoRes = await transaction.request()
            .input('productId', sql.UniqueIdentifier, String(item.id))
            .query('SELECT name, stock_quantity, is_active FROM products WHERE id = @productId');

          if (infoRes.recordset.length === 0) {
            throw new Error(`Товар с ID ${item.id} не найден в каталоге`);
          }

          const prod = infoRes.recordset[0];
          if (!prod.is_active) {
            throw new Error(`Товар "${prod.name}" временно недоступен для заказа`);
          }

          throw new Error(`Недостаточно товара "${prod.name}" на складе (в наличии: ${prod.stock_quantity}, требуется: ${item.quantity})`);
        }

        await transaction.request()
          .input('orderId',         sql.UniqueIdentifier, orderId)
          .input('productId',       sql.UniqueIdentifier, String(item.id))
          .input('quantity',        sql.Int,              item.quantity)
          // price_at_purchase — фиксируем цену на момент оформления заказа.
          .input('priceAtPurchase', sql.Decimal(10, 2),   item.price_at_purchase)
          .query(`INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                  VALUES (@orderId, @productId, @quantity, @priceAtPurchase)`);
      }

      // Шаг 7: Фиксируем транзакцию — все изменения сохраняются в БД
      await transaction.commit();
      // 201 Created — успешно создан новый ресурс
      res.status(201).json({ status: 'ok', order_id: orderId, order_number, public_id });
    } catch (e) {
      // Если что-то пошло не так — откатываем транзакцию.
      // Ни заказ, ни товары не будут сохранены в БД.
      await transaction.rollback();
      throw e; // Пробрасываем ошибку наверх для обработки в внешнем catch
    }
  } catch (e) {
    console.error('Order creation error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders
// Возвращает историю заказов текущего пользователя с вложенными товарами.
//
// Ответ: массив заказов, у каждого есть поле items с товарами
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const p = await getPool();

    // Шаг 1: Получаем все заказы пользователя, сортируем по дате (новые первые)
    const ordersRes = await p.request()
      .input('userId', sql.UniqueIdentifier, req.session.userId)
      .query('SELECT * FROM orders WHERE user_id = @userId ORDER BY created_at DESC');
    const userOrders = ordersRes.recordset;

    // Шаг 2: Если заказы есть, подгружаем все их товары одним запросом.
    //
    // Почему не делаем запрос внутри цикла?
    //   Если у пользователя 50 заказов, цикл с запросом внутри сделает 50 запросов к БД.
    //   Это медленно (проблема "N+1 запросов"). Вместо этого делаем ОДИН запрос
    //   для всех заказов, а потом группируем товары по order_id в JavaScript.
    if (userOrders.length > 0) {
      const itemsRes = await p.request()
        .input('userId', sql.UniqueIdentifier, req.session.userId)
        .query(`
          SELECT oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name, p.emoji
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          LEFT JOIN products p ON oi.product_id = p.id   -- LEFT JOIN: товар мог быть удалён
          WHERE o.user_id = @userId
        `);

      // Шаг 3: Группируем товары по order_id в объект-словарь { [orderId]: [...items] }
      // Это позволяет за O(n) прикрепить все товары к нужным заказам
      const itemsByOrder = {};
      itemsRes.recordset.forEach(item => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push({
          id:    item.product_id,
          name:  item.name  || 'Неизвестный товар', // Товар мог быть удалён из каталога
          emoji: item.emoji || '📦',
          q:     item.quantity,
          price: item.price_at_purchase,
        });
      });

      // Шаг 4: Прикрепляем отсортированные товары к каждому заказу
      userOrders.forEach(o => { o.items = itemsByOrder[o.id] || []; });
    }

    res.json(userOrders);
  } catch (e) {
    console.error('Fetch orders error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
