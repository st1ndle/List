import React, { Component, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiStorage from '../api/ApiStorage';
import useAdminStore from '../store/useAdminStore';
import AdminOrders from '../components/admin/AdminOrders';
import AdminWarehouses from '../components/admin/AdminWarehouses';
import './AdminPage.css';

/**
 * HOC для интеграции функциональных хуков (Zustand, React Router) в классовый компонент.
 * Также выполняет проверку прав доступа (только для роли admin).
 */
function withAdminContext(WrappedComponent) {
  return function AdminContextWrapper(props) {
    const navigate = useNavigate();
    const store = useAdminStore();
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
      ApiStorage.auth.me()
        .then(res => {
          if (res && res.user && res.user.role === 'admin') {
            setUser(res.user);
          } else {
            setUser(null);
          }
        })
        .catch(() => setUser(null))
        .finally(() => setAuthLoading(false));
    }, []);

    if (authLoading) return <div className="admin-loading">Загрузка...</div>;
    
    // Если пользователь не админ - показываем "404"
    if (!user) {
      return (
        <div className="not-found-page">
          <h1>404</h1>
          <p>Страница не найдена</p>
        </div>
      );
    }

    return <WrappedComponent {...props} navigate={navigate} store={store} user={user} />;
  }
}

/**
 * Классовый компонент страницы администратора.
 * Отвечает за общую структуру (сайдбар, контент) и переключение вкладок.
 */
class AdminPageContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'orders' // Возможные значения: 'orders', 'warehouses'
    };
  }

  componentDidMount() {
    // При загрузке страницы подтягиваем начальные данные (только склады)
    this.props.store.fetchWarehouses();
  }

  render() {
    const { store } = this.props;
    const { activeTab } = this.state;

    return (
      <div className="admin-page">
        <aside className="admin-sidebar">
          <h2>Панель управления</h2>
          <nav>
            <button 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => this.setState({ activeTab: 'orders' })}
            >
              Заказы
            </button>
            <button 
              className={activeTab === 'warehouses' ? 'active' : ''} 
              onClick={() => this.setState({ activeTab: 'warehouses' })}
            >
              Склады
            </button>
          </nav>
        </aside>
        
        <main className="admin-content">
          {store.error && <div className="admin-error">{store.error}</div>}
          
          {activeTab === 'orders' && (
            <AdminOrders />
          )}
          
          {activeTab === 'warehouses' && (
            <AdminWarehouses 
              warehouses={store.warehouses} 
            />
          )}
        </main>
      </div>
    );
  }
}

export default withAdminContext(AdminPageContent);
