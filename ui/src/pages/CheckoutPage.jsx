import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import ApiStorage from '../api/ApiStorage';
import { PhoneInput } from '../components/ui/PhoneInput';
import './CheckoutPage.css';

// ─── Утилиты ─────────────────────────────────────────────────────────────────

/**
 * Генерирует 15-минутные слоты из строки вида "HH:MM" в строку "HH:MM"
 * Возвращает массив объектов { label: "08:00 – 08:15" }
 */
function buildTimeSlots(start, end) {
  if (!start || !end) return [];

  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  const startMin = sh * 60 + sm;
  const endMin   = eh * 60 + em;
  const slots    = [];

  for (let t = startMin; t + 15 <= endMin; t += 15) {
    const from = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    const to   = `${String(Math.floor((t + 15) / 60)).padStart(2, '0')}:${String((t + 15) % 60).padStart(2, '0')}`;
    slots.push({ label: `${from} – ${to}` });
  }
  return slots;
}


// ─── Компонент ────────────────────────────────────────────────────────────────

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();

  // ── Данные для формы
  const [user, setUser]           = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]         = useState('');

  // ── Выбор пользователя
  const [selWarehouse, setSelWarehouse] = useState(null);   // объект склада
  const [selDate, setSelDate]     = useState('');
  const [selTime, setSelTime]     = useState('');

  // ── Контактные данные (предзаполняются из профиля)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [comment, setComment]     = useState('');

  const today = new Date().toISOString().split('T')[0];

  // ── Загрузка при монтировании
  useEffect(() => {
    setSelDate(today);

    const loadAll = async () => {
      try {
        const [meRes, whRes, prodRes] = await Promise.all([
          ApiStorage.auth.me().catch(() => ({ user: null })),
          ApiStorage.warehouses.getAll().catch(() => []),
          ApiStorage.catalog.getProducts().catch(() => []),
        ]);

        const u = meRes?.user;
        if (u) {
          setUser(u);
          setFirstName(u.first_name || '');
          setLastName(u.last_name || '');
          setPhone(u.phone || '');
        }

        const whs = Array.isArray(whRes) ? whRes : [];
        setWarehouses(whs);
        if (whs.length > 0) setSelWarehouse(whs[0]);

        setProducts(Array.isArray(prodRes) ? prodRes : []);
      } catch (e) {
        console.error('Checkout load error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, [today]);

  // ── Позиции корзины с инфой о товаре
  const cartEntries = useMemo(() => {
    return Object.entries(items).map(([id, quantity]) => {
      const product = products.find((p) => String(p.id) === String(id));
      return { id, quantity, product };
    });
  }, [items, products]);

  const totalSum = useMemo(() => {
    return cartEntries.reduce((sum, { quantity, product }) => {
      return sum + (Number(product?.price) || 0) * quantity;
    }, 0);
  }, [cartEntries]);

  // ── Слоты времени для выбранного склада
  const timeSlots = useMemo(() => {
    if (!selWarehouse) return [];
    return buildTimeSlots(
      selWarehouse.working_hours_start,
      selWarehouse.working_hours_end
    );
  }, [selWarehouse]);

  // При смене склада сбрасываем время
  const handleWarehouseSelect = (wh) => {
    setSelWarehouse(wh);
    setSelTime('');
  };

  // ── Отправка заказа
  const handlePlaceOrder = async () => {
    if (!selWarehouse) return setError('Выберите склад самовывоза');
    if (!selDate)      return setError('Укажите дату получения');
    if (!selTime)      return setError('Выберите время получения');
    if (cartEntries.length === 0) return setError('Корзина пуста');

    setError('');
    setIsSubmitting(true);

    try {
      const orderItems = cartEntries
        .filter(({ product }) => product)
        .map(({ id, quantity, product }) => ({
          id,
          quantity,
          price_at_purchase: Number(product.price) || 0,
        }));

      const payload = {
        items:           orderItems,
        total_amount:    totalSum,
        warehouse_code:  selWarehouse.warehouse_code,
        customer_name:   `${firstName} ${lastName}`.trim() || undefined,
        customer_phone:  phone || undefined,
        comment:         [
          `Дата: ${selDate}`,
          `Время: ${selTime}`,
          comment ? `Комментарий: ${comment}` : null,
        ].filter(Boolean).join(' · '),
      };

      const result = await ApiStorage.orders.create(payload);
      clearCart();
      navigate('/orders', { state: { successPublicId: result.public_id } });
    } catch (e) {
      setError(e.message || 'Ошибка при создании заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading-state
  if (isLoading) {
    return (
      <div className="co-page">
        <div style={{ padding: '36px 48px', color: 'var(--ink3)' }}>Загрузка...</div>
      </div>
    );
  }

  // ── Пустая корзина
  if (cartEntries.length === 0 && !isLoading) {
    return (
      <div className="co-page">
        <div className="empty-state" style={{ marginTop: '80px' }}>
          <div className="empty-icon">🛒</div>
          <div className="empty-ttl">Корзина пуста</div>
          <p style={{ marginBottom: '28px', color: 'var(--ink3)' }}>Добавьте товары из каталога</p>
          <button
            className="btn-solid"
            style={{ padding: '12px 32px', fontSize: '15px', borderRadius: '10px' }}
            onClick={() => navigate('/catalogue')}
          >
            Открыть каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <div style={{ padding: '36px 48px 0' }}>
        <span
          style={{ cursor: 'pointer', color: 'var(--ink3)', fontSize: '14px' }}
          onClick={() => navigate('/cart')}
        >
          ← Назад в корзину
        </span>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '48px', letterSpacing: '0.5px', marginTop: '8px' }}>
          Оформление заказа
        </h1>
      </div>

      <div className="co-layout">
        {/* ── Левая колонка — шаги ── */}
        <div>

          {/* Шаг 1: Склад */}
          <div className="scard">
            <div className="scard-num">1</div>
            <div className="scard-title">Склад самовывоза</div>
            {warehouses.length === 0 ? (
              <div style={{ color: 'var(--ink3)', fontSize: '14px' }}>
                Нет доступных складов. Пожалуйста, свяжитесь с нами.
              </div>
            ) : (
              <div className="addr-list">
                {warehouses.map((wh) => (
                  <div
                    key={wh.id}
                    className={`aopt ${selWarehouse?.id === wh.id ? 'on' : ''}`}
                    onClick={() => handleWarehouseSelect(wh)}
                  >
                    <div className="aopt-radio">
                      <div className="aopt-dot" />
                    </div>
                    <div>
                      <div className="aopt-name">{wh.city ? `${wh.city} — ` : ''}{wh.name}</div>
                      <div className="aopt-street">{wh.address}</div>
                      {wh.phone && (
                        <div className="aopt-note">{wh.phone}</div>
                      )}
                      {wh.working_hours_start && wh.working_hours_end && (
                        <div className="aopt-hours">
                          🕐 {wh.working_hours_start.slice(0, 5)} – {wh.working_hours_end.slice(0, 5)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Шаг 2: Дата и время */}
          <div className="scard">
            <div className="scard-num">2</div>
            <div className="scard-title">Дата и время получения</div>
            <div className="fg">
              <label className="flbl">Дата</label>
              <input
                type="date"
                id="checkout-date"
                className="finp"
                value={selDate}
                min={today}
                onChange={(e) => { setSelDate(e.target.value); setSelTime(''); }}
                style={{ maxWidth: '220px' }}
              />
            </div>

            {timeSlots.length > 0 ? (
              <>
                <label className="flbl" style={{ display: 'block', marginBottom: '10px' }}>
                  Доступные временны́е слоты (15 мин)
                </label>
                <div className="time-grid">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.label}
                      className={`tslot ${selTime === slot.label ? 'on' : ''}`}
                      onClick={() => setSelTime(slot.label)}
                    >
                      {slot.label}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--ink3)', fontSize: '14px' }}>
                {selWarehouse
                  ? 'Часы работы склада не указаны'
                  : 'Выберите склад для просмотра слотов'}
              </div>
            )}

            {selTime && (
              <div className="sel-time-badge">
                ✓ Выбрано: <strong>{selTime}</strong>
              </div>
            )}
          </div>

          {/* Шаг 3: Контактные данные */}
          <div className="scard">
            <div className="scard-num">3</div>
            <div className="scard-title">Контактные данные</div>

            {user && (
              <div className="co-user-hint">
                👤 Данные заполнены из вашего профиля
              </div>
            )}

            <div className="frow">
              <div className="fg">
                <label className="flbl" htmlFor="co-first-name">Имя</label>
                <input
                  id="co-first-name"
                  className="finp"
                  placeholder="Иван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="fg">
                <label className="flbl" htmlFor="co-last-name">Фамилия</label>
                <input
                  id="co-last-name"
                  className="finp"
                  placeholder="Иванов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <PhoneInput
              label="Телефон"
              value={phone}
              onChange={setPhone}
            />
            <div className="fg">
              <label className="flbl" htmlFor="co-comment">Комментарий</label>
              <textarea
                id="co-comment"
                className="finp"
                rows="3"
                placeholder="Дополнительная информация..."
                style={{ resize: 'vertical' }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Правая колонка — сводка ── */}
        <div>
          <div className="csum">
            <div className="csum-title">Ваш заказ</div>

            <div id="co-items">
              {cartEntries.map(({ id, quantity, product }) => {
                const price = Number(product?.price) || 0;
                return (
                  <div key={id} className="crow">
                    <span className="crow-lbl">
                      {product?.emoji || '📦'} {product?.name || `ID: ${id}`} ×{quantity}
                    </span>
                    <span className="crow-val">{price * quantity} ₽</span>
                  </div>
                );
              })}
            </div>

            {/* Выбранный склад и время */}
            {(selWarehouse || selDate || selTime) && (
              <div className="co-pickup-summary">
                {selWarehouse && (
                  <div className="pickup-row">
                    <span>📍</span>
                    <span>{selWarehouse.city ? `${selWarehouse.city}, ` : ''}{selWarehouse.name}</span>
                  </div>
                )}
                {selDate && selTime && (
                  <div className="pickup-row">
                    <span>🕐</span>
                    <span>{new Date(selDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}, {selTime}</span>
                  </div>
                )}
              </div>
            )}

            <div id="co-rows">
              <div className="crow" style={{ borderTop: '1px solid var(--bg2)', marginTop: '8px', paddingTop: '14px' }}>
                <span className="crow-lbl" style={{ fontWeight: 700 }}>К оплате</span>
                <span className="crow-total">{totalSum} ₽</span>
              </div>
            </div>

            {error && (
              <div className="co-error">{error}</div>
            )}

            <button
              id="checkout-submit-btn"
              className="btn-full btn-full-main"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оформляем...' : 'Оформить заказ'}
            </button>
            <button
              className="btn-full btn-full-out"
              style={{ marginTop: '8px' }}
              onClick={() => navigate('/cart')}
              disabled={isSubmitting}
            >
              ← Изменить корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
