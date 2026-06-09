import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiStorage from '../api/ApiStorage';
import useCartStore from '../store/useCartStore';
import useToastStore from '../store/useToastStore';
import './OrdersPage.css';

// ─── Конфиг статусов ──────────────────────────────────────────────────────────
const STATUS_LABELS  = { new: 'Новый', processing: 'В обработке', ready: 'Готов к выдаче', completed: 'Выдан', cancelled: 'Отменён' };
const STATUS_CLASSES = { new: 'sb-new', processing: 'sb-proc', ready: 'sb-ready', completed: 'sb-done', cancelled: 'sb-cancel' };
const STATUS_STEPS   = { new: 1, processing: 2, ready: 3, completed: 4, cancelled: 0 };
const PROGRESS_LABELS = ['Принят', 'Обработка', 'Готов', 'Выдан'];

// ─── Компонент ────────────────────────────────────────────────────────────────
function OrdersPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { addMultiple } = useCartStore();
  const { showToast } = useToastStore();

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [authErr, setAuthErr] = useState(false);

  const handleRepeatOrder = (order) => {
    if (!order.items || order.items.length === 0) return;

    const itemsMap = {};
    order.items.forEach(item => {
      if (item.id) {
        itemsMap[item.id] = (itemsMap[item.id] || 0) + item.q;
      }
    });

    addMultiple(itemsMap);
    showToast('🛒', 'Товары из заказа добавлены в корзину');
    navigate('/cart');
  };

  // Успешный публичный ID заказа, переданный из CheckoutPage
  const successPublicId = location.state?.successPublicId;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ApiStorage.orders.getAll();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.message?.includes('401') || err.message?.includes('авторизован')) {
          setAuthErr(true);
        }
        console.error('Ошибка загрузки заказов:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="orders-page">
        <div className="orders-shell">
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink3)' }}>
            Загружаем ваши заказы...
          </div>
        </div>
      </main>
    );
  }

  if (authErr) {
    return (
      <main className="orders-page">
        <div className="orders-shell">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <div className="empty-ttl">Требуется авторизация</div>
            <p style={{ marginBottom: '28px', color: 'var(--ink3)' }}>
              Войдите в аккаунт, чтобы просмотреть историю заказов
            </p>
            <button
              className="btn-solid"
              style={{ padding: '12px 32px', fontSize: '15px', borderRadius: '10px' }}
              onClick={() => navigate('/auth')}
            >
              Войти
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="orders-shell">

        {/* Заголовок */}
        <div className="orders-header">
          <span
            className="orders-back"
            onClick={() => navigate('/')}
          >
            ← Главная
          </span>
          <h1 className="orders-title">Мои заказы</h1>
        </div>

        {/* Баннер успешного оформления */}
        {successPublicId && (
          <div className="orders-success-banner">
            <span className="success-icon">✅</span>
            <div>
              <div className="success-title">Заказ оформлен!</div>
              <div className="success-sub">
                Номер заказа: <strong>{successPublicId}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Список заказов или пустое состояние */}
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-ttl">Заказов пока нет</div>
            <p style={{ marginBottom: '28px', color: 'var(--ink3)' }}>
              Оформите первый заказ из каталога
            </p>
            <button
              className="btn-solid"
              style={{ padding: '12px 32px', fontSize: '15px', borderRadius: '10px' }}
              onClick={() => navigate('/catalogue')}
            >
              Открыть каталог
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((o) => {
              const step    = STATUS_STEPS[o.status] || 1;
              const isCancelled = o.status === 'cancelled';
              const createdDate = new Date(o.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric',
              });

              // Извлекаем дату/время получения из комментария
              const commentText = o.comment || '';
              const dateMatch   = commentText.match(/Дата:\s*([^\s·]+)/);
              const timeMatch   = commentText.match(/Время:\s*([\d:–\s]+)/);
              const noteMatch   = commentText.match(/Комментарий:\s*(.+)/);

              const pickupDate = dateMatch?.[1]
                ? new Date(dateMatch[1]).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                : null;
              const pickupTime = timeMatch?.[1]?.trim() || null;
              const customerNote = noteMatch?.[1]?.trim() || null;

              return (
                <div className="ocard" key={o.id}>
                  {/* Шапка карточки */}
                  <div className="ocard-head">
                    <div>
                      <div className="ocard-num">
                        {o.public_id || `#${o.order_number}`}
                      </div>
                      <div className="ocard-meta">от {createdDate}</div>
                    </div>
                    <span className={`sbadge ${STATUS_CLASSES[o.status] || 'sb-new'}`}>
                      {STATUS_LABELS[o.status] || 'Новый'}
                    </span>
                  </div>

                  {/* Прогресс */}
                  {!isCancelled && (
                    <div className="oprog">
                      {PROGRESS_LABELS.map((label, i) => (
                        <div
                          key={i}
                          className={`opstep ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'cur' : ''}`}
                        >
                          <div className="opstep-dot">{i + 1 < step ? '✓' : i + 1}</div>
                          <div className="opstep-lbl">{label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Информация о самовывозе */}
                  {(pickupDate || pickupTime || o.delivery_address) && (
                    <div className="opickup">
                      {o.delivery_address && (
                        <div className="opickup-row">
                          <span>📍</span>
                          <span>{o.delivery_address}</span>
                        </div>
                      )}
                      {(pickupDate || pickupTime) && (
                        <div className="opickup-row">
                          <span>🕐</span>
                          <span>
                            {[pickupDate, pickupTime].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Товары */}
                  <div className="oitems">
                    {(o.items || []).map((item, idx) => (
                      <span key={idx} className="oitem-chip">
                        {item.emoji || '📦'} {item.name || 'Товар'} ×{item.q || item.quantity || 1}
                      </span>
                    ))}
                  </div>

                  {/* Подвал карточки */}
                  <div className="ocard-foot">
                    <div>
                      <div className="o-total">{Number(o.total_amount).toLocaleString('ru-RU')} ₽</div>
                      {o.customer_name && (
                        <div className="o-meta">{o.customer_name}{o.customer_phone ? ` · ${o.customer_phone}` : ''}</div>
                      )}
                      {customerNote && (
                        <div className="o-meta" style={{ fontStyle: 'italic' }}>💬 {customerNote}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-solid btn-repeat"
                      onClick={() => handleRepeatOrder(o)}
                    >
                      Повторить заказ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default OrdersPage;
