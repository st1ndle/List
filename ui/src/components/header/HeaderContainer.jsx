import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import useCartStore from '../../store/useCartStore';

function HeaderContainer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  const navigationItems = useMemo(
    () => [
      { label: 'Главная', path: '/' },
      { label: 'Каталог', path: '/catalogue' },
      { label: 'Услуги склада', path: '/services' },
      { label: 'Тарифы', path: '/tariffs' },
      { label: 'О компании', path: '/about' },
      { label: 'Контакты', path: '/contacts' },
    ],
    [],
  );

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
      onOrdersClick={() => navigate('/orders')}
      onLoginClick={() => {
        setIsAuthenticated(true);
        navigate('/auth');
      }}
      onLogoutClick={() => {
        setIsAuthenticated(false);
        navigate('/');
      }}
    />
  );
}

export default HeaderContainer;
