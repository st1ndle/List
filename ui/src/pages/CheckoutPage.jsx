import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

const ADDRS = [
  {
    id: 0,
    name: 'Главный склад — Домодедово',
    street: 'территория Триколор, 11',
    note: '+7 (495) 229-40-05 · Пн–Пт 8:00–18:00',
  },
  {
    id: 1,
    name: 'Склад — Тула (Щегловская Засека)',
    street: 'ул. Щегловская Засека, д. 31А',
    note: '+7 (4872) 25-14-07',
  },
  {
    id: 2,
    name: 'Склад — Тула (Луначарского)',
    street: 'ул. Луначарского, дом 76',
    note: '+7 (4872) 25-14-07',
  },
  {
    id: 3,
    name: 'Склад — Рязань',
    street: 'ул. Ряжское шоссе, д. 20',
  },
  {
    id: 4,
    name: 'Склад — Истра',
    street: 'д. Покровское, Центральная ул., 27 стр.2',
  },
];

const TIME_SLOTS = [
  { label: '08:00–09:00', busy: false },
  { label: '09:00–10:00', busy: false },
  { label: '10:00–11:00', busy: true },
  { label: '11:00–12:00', busy: false },
  { label: '12:00–13:00', busy: false },
  { label: '13:00–14:00', busy: true },
  { label: '14:00–15:00', busy: false },
  { label: '15:00–16:00', busy: false },
  { label: '16:00–17:00', busy: false },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const [selAddr, setSelAddr] = useState(0);
  const [selTime, setSelTime] = useState('');
  
  const today = new Date().toISOString().split('T')[0];

  // Dummy cart data for visual implementation
  const mockItems = [
    { id: 1, emoji: '🍷', name: 'Вино красное', q: 2, price: 290 },
    { id: 2, emoji: '🍺', name: 'Пиво светлое', q: 10, price: 85 }
  ];
  
  const total = mockItems.reduce((acc, item) => acc + (item.price * item.q), 0);

  const handlePlaceOrder = () => {
    // In actual implementation, this will send data to API and clear cart
    alert('Заказ оформлен (Демо)!');
    navigate('/orders');
  };

  return (
    <div className="co-page">
      <div style={{ padding: '36px 48px 0' }}>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '48px', letterSpacing: '0.5px' }}>
          Оформление заказа
        </h1>
      </div>
      <div className="co-layout">
        <div>
          <div className="scard">
            <div className="scard-num">1</div>
            <div className="scard-title">Адрес самовывоза</div>
            <div className="addr-list">
              {ADDRS.map((addr) => (
                <div
                  key={addr.id}
                  className={`aopt ${selAddr === addr.id ? 'on' : ''}`}
                  onClick={() => setSelAddr(addr.id)}
                >
                  <div className="aopt-radio">
                    <div className="aopt-dot"></div>
                  </div>
                  <div>
                    <div className="aopt-name">{addr.name}</div>
                    <div className="aopt-street">{addr.street}</div>
                    {addr.note && <div className="aopt-note">{addr.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="scard">
            <div className="scard-num">2</div>
            <div className="scard-title">Дата и время получения</div>
            <div className="fg">
              <label className="flbl">Дата</label>
              <input type="date" className="finp" defaultValue={today} min={today} style={{ maxWidth: '220px' }} />
            </div>
            <label className="flbl" style={{ display: 'block', marginBottom: '10px' }}>
              Доступные временны́е слоты
            </label>
            <div className="time-grid">
              {TIME_SLOTS.map((slot, i) => (
                <div
                  key={i}
                  className={`tslot ${slot.busy ? 'busy' : ''} ${selTime === slot.label ? 'on' : ''}`}
                  onClick={() => {
                    if (!slot.busy) setSelTime(slot.label);
                  }}
                >
                  {slot.label}
                </div>
              ))}
            </div>
          </div>

          <div className="scard">
            <div className="scard-num">3</div>
            <div className="scard-title">Контактные данные</div>
            <div className="frow">
              <div className="fg">
                <label className="flbl">Имя</label>
                <input className="finp" placeholder="Иван" />
              </div>
              <div className="fg">
                <label className="flbl">Фамилия</label>
                <input className="finp" placeholder="Иванов" />
              </div>
            </div>
            <div className="fg">
              <label className="flbl">Телефон</label>
              <input className="finp" placeholder="+7 (___) ___-__-__" />
            </div>
            <div className="fg">
              <label className="flbl">Комментарий</label>
              <textarea className="finp" rows="3" placeholder="Дополнительная информация..." style={{ resize: 'vertical' }}></textarea>
            </div>
          </div>
        </div>

        <div>
          <div className="csum">
            <div className="csum-title">Ваш заказ</div>
            <div id="co-items">
              {mockItems.map((item, i) => (
                <div key={i} className="crow">
                  <span className="crow-lbl">{item.emoji} {item.name} ×{item.q}</span>
                  <span className="crow-val">{item.price * item.q} ₽</span>
                </div>
              ))}
            </div>
            <div id="co-rows">
              <div className="crow" style={{ borderTop: '1px solid var(--bg2)', marginTop: '8px', paddingTop: '14px' }}>
                <span className="crow-lbl" style={{ fontWeight: 700 }}>К оплате</span>
                <span className="crow-total">{total} ₽</span>
              </div>
            </div>
            <button className="btn-full btn-full-main" onClick={handlePlaceOrder}>
              Оформить заказ
            </button>
            <button className="btn-full btn-full-out" style={{ marginTop: '8px' }} onClick={() => navigate('/cart')}>
              ← Изменить корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
