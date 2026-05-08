import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';

function HeaderContainer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

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
      onCartClick={() => {
        setCartCount((prev) => prev + 1);
        navigate('/cart');
      }}
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
