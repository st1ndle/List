import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiStorage from '../api/ApiStorage';
import useToastStore from '../store/useToastStore';
import useAuthStore from '../store/useAuthStore';

// --- Подкомпонент: Личные данные ---
const ProfileData = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.first_name || user?.name || '',
    lastname: user?.last_name || user?.lastname || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // TODO: Здесь можно добавить ApiStorage.auth.updateProfile(formData)
    useToastStore.getState().showToast('✓', 'Данные сохранены');
  };

  return (
    <div className="scard">
      <div className="scard-title">Личные данные</div>
      <form onSubmit={handleSave}>
        <div className="frow">
          <div className="fg">
            <label className="flbl">Имя</label>
            <input
              className="finp"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="fg">
            <label className="flbl">Фамилия</label>
            <input
              className="finp"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="fg">
          <label className="flbl">Телефон</label>
          <input
            className="finp"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="fg">
          <label className="flbl">E-mail</label>
          <input
            className="finp"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled
          />
        </div>
        <button type="submit" className="btn-solid" style={{ padding: '11px 28px', fontSize: '14px', borderRadius: '10px' }}>
          Сохранить
        </button>
      </form>
    </div>
  );
};

// --- Подкомпонент: Смена пароля ---
const ProfileSecurity = () => {
  const handlePasswordChange = (e) => {
    e.preventDefault();
    // TODO: Вызов API для смены пароля
    useToastStore.getState().showToast('✓', 'Пароль изменён');
  };

  return (
    <div className="scard">
      <div className="scard-title">Безопасность</div>
      <form onSubmit={handlePasswordChange}>
        <div className="fg">
          <label className="flbl">Текущий пароль</label>
          <input className="finp" type="password" placeholder="••••••••" required />
        </div>
        <div className="fg">
          <label className="flbl">Новый пароль</label>
          <input className="finp" type="password" placeholder="Минимум 8 символов" required minLength={8} />
        </div>
        <div className="fg">
          <label className="flbl">Подтверждение</label>
          <input className="finp" type="password" placeholder="••••••••" required minLength={8} />
        </div>
        <button type="submit" className="btn-solid" style={{ padding: '11px 28px', fontSize: '14px', borderRadius: '10px' }}>
          Изменить
        </button>
      </form>
    </div>
  );
};

// --- Подкомпонент: История заказов ---
const STATUS_LABELS = { new: 'Новый', processing: 'В обработке', ready: 'Готов к выдаче', done: 'Выдан' };
const STATUS_CLASSES = { new: 'sb-new', processing: 'sb-proc', ready: 'sb-ready', done: 'sb-done' };
const STATUS_STEPS = { new: 1, processing: 2, ready: 3, done: 4 };
const PROGRESS_LABELS = ['Принят', 'Обработка', 'Готов', 'Выдан'];

const ProfileOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ApiStorage.orders.getAll();
        // Трансформируем данные в формат, совместимый с вашей версткой (как в loadOrders в app.js)
        const formattedOrders = (data || []).map(o => {
          const commentParts = o.comment ? o.comment.replace('Самовывоз: ', '').split(', ') : ['—', 'не выбрано'];
          const pDate = commentParts[0] || '—';
          const pTime = commentParts[1] || 'не выбрано';
          const createdDate = new Date(o.created_at);

          return {
            id: '#' + o.order_number,
            date: createdDate.toLocaleDateString('ru-RU'),
            pDate: pDate,
            pTime: pTime,
            addr: o.delivery_address || 'Не указан',
            items: o.items || [],
            total: o.total_amount,
            status: o.status || 'new'
          };
        });
        setOrders(formattedOrders);
      } catch (err) {
        console.error('Ошибка при загрузке истории заказов:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div style={{ padding: '20px', color: 'var(--ink3)' }}>Загрузка заказов...</div>;

  if (!orders.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <div className="empty-ttl">Заказов пока нет</div>
        <p style={{ marginBottom: '28px', color: 'var(--ink3)' }}>Оформите первый заказ из каталога</p>
        <button className="btn-solid" style={{ padding: '12px 32px', fontSize: '15px', borderRadius: '10px' }} onClick={() => navigate('/catalogue')}>
          Открыть каталог
        </button>
      </div>
    );
  }

  return (
    <div className="ord-wrap" style={{ padding: 0 }}>
      {orders.map(o => {
        const step = STATUS_STEPS[o.status] || 1;
        return (
          <div className="ocard" key={o.id}>
            <div className="ocard-head">
              <div>
                <div className="ocard-num">Заказ {o.id}</div>
                <div className="ocard-meta">от {o.date} · Самовывоз: {o.pDate}, {o.pTime}</div>
              </div>
              <span className={`sbadge ${STATUS_CLASSES[o.status] || 'sb-new'}`}>{STATUS_LABELS[o.status] || 'Новый'}</span>
            </div>
            <div className="oprog">
              {PROGRESS_LABELS.map((label, i) => (
                <div key={i} className={`opstep ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'cur' : ''}`}>
                  <div className="opstep-dot">{i + 1 < step ? '✓' : i + 1}</div>
                  <div className="opstep-lbl">{label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink3)', marginBottom: '10px' }}>📍 {o.addr}</div>
            <div className="oitems">
              {o.items.map((item, idx) => (
                <span key={idx} className="oitem-chip">{item.emoji || '📦'} {item.name} ×{item.quantity || item.q || 1}</span>
              ))}
            </div>
            <div className="ocard-foot">
              <div>
                <div className="o-total">{o.total}₽</div>
                <div className="o-addr">{o.addr}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn-repeat" onClick={() => useToastStore.getState().showToast('ℹ️', 'Функция повтора заказа в разработке')}>↻ Повторить заказ</button>
                {o.status === 'new' && (
                  <button className="btn-cancel" onClick={() => useToastStore.getState().showToast('ℹ️', 'Функция отмены заказа в разработке')}>Отменить</button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Главная страница Профиля ---
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('data'); // 'data', 'orders', 'security'
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.isLoading);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка профиля...</div>;
  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Пожалуйста, войдите в систему.</div>;

  return (
    <div className="view active" id="view-profile">
      <div className="profile-layout" style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        <aside className="profile-sidebar" style={{ width: '250px' }}>
          <div className={`sitem ${activeTab === 'data' ? 'on' : ''}`} onClick={() => setActiveTab('data')}>Личные данные</div>
          <div className={`sitem ${activeTab === 'orders' ? 'on' : ''}`} onClick={() => setActiveTab('orders')}>История заказов</div>
          <div className={`sitem ${activeTab === 'security' ? 'on' : ''}`} onClick={() => setActiveTab('security')}>Безопасность</div>
        </aside>
        <main id="p-main" style={{ flex: 1 }}>
          {activeTab === 'data' && <ProfileData user={user} />}
          {activeTab === 'orders' && <ProfileOrders />}
          {activeTab === 'security' && <ProfileSecurity />}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;