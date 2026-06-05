import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import useCartStore from '../../../store/useCartStore';
import useAuthStore from '../../../store/useAuthStore';

function HeaderContainer() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartStore((state) => state.getCartItemsCount());

  const navigationItems = useMemo(() => {
    const items = [
      { label: 'Главная', path: '/' },
      { label: 'Каталог', path: '/catalogue' },
      { label: 'Услуги склада', path: '/services' },
      { label: 'Тарифы', path: '/tariffs' },
      { label: 'О компании', path: '/about' },
      { label: 'Контакты', path: '/contacts' },
    ];
    if (user?.role === 'admin') {
      items.push({ label: 'Панель управления', path: '/adminpage' });
    }
    return items;
  }, [user]);

  return (
    <Header
      brand={{
        name: 'ООО ЛиСТ',
        tagline: 'Напитки оптом · Складское предприятие',
      }}
      navigationItems={navigationItems}
      activePath={location.pathname}
      phone="+7 (495) 229-40-05"
      cartCount={cartCount}
      isAuthenticated={isAuthenticated}
      onNavigate={navigate}
      onCartClick={() => navigate('/cart')}
      onProfileClick={() => navigate('/profile')}
      onLoginClick={() => {
        navigate('/auth');
      }}
      onLogoutClick={async () => {
        try {
          await logout();
          navigate('/');
        } catch (error) {
          console.error('Ошибка при выходе:', error);
        }
      }}
    />
  );
}

export default HeaderContainer;
