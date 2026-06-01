import { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminStore from '../store/useAdminStore';
import useAuthStore from '../store/useAuthStore';
import AdminOrders from '../features/admin/AdminOrders';
import AdminWarehouses from '../features/admin/AdminWarehouses';
import AdminCategories from '../features/admin/AdminCategories';
import AdminProducts from '../features/admin/AdminProducts';
import AdminSettings from '../features/admin/AdminSettings';
import './AdminPage.css';

/**
 * HOC для интеграции функциональных хуков (Zustand, React Router) в классовый компонент.
 * Также выполняет проверку прав доступа (только для роли admin).
 */
function withAdminContext(WrappedComponent) {
  return function AdminContextWrapper(props) {
    const navigate = useNavigate();
    const store = useAdminStore();
    const user = useAuthStore((state) => state.user);
    const authLoading = useAuthStore((state) => state.isLoading);

    if (authLoading) return <div className="admin-loading">Загрузка...</div>;
    
    // Если пользователь не админ - показываем "404"
    if (!user || user.role !== 'admin') {
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
            <button 
              className={activeTab === 'categories' ? 'active' : ''} 
              onClick={() => this.setState({ activeTab: 'categories' })}
            >
              Категории
            </button>
            <button 
              className={activeTab === 'products' ? 'active' : ''} 
              onClick={() => this.setState({ activeTab: 'products' })}
            >
              Продукты
            </button>
            <button 
              className={activeTab === 'settings' ? 'active' : ''} 
              onClick={() => this.setState({ activeTab: 'settings' })}
            >
              Настройки сайта
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
              onRefresh={store.fetchWarehouses}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories />
          )}

          {activeTab === 'products' && (
            <AdminProducts />
          )}

          {activeTab === 'settings' && (
            <AdminSettings />
          )}
        </main>
      </div>
    );
  }
}

export default withAdminContext(AdminPageContent);
