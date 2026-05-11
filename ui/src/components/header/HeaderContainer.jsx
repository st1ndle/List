import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import useCartStore from '../../store/useCartStore';
import ApiStorage from '../../api/ApiStorage';

function HeaderContainer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartStore((state) => state.getCartItemsCount());

  useEffect(() => {
    ApiStorage.auth.me()
      .then((data) => setIsAuthenticated(!!data?.user))
      .catch(() => setIsAuthenticated(false));
  }, [location.pathname]);

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
      onProfileClick={() => navigate('/profile')}
      onLoginClick={() => {
        navigate('/auth');
      }}
      onLogoutClick={async () => {
        try {
          await ApiStorage.auth.logout();
          setIsAuthenticated(false);
          navigate('/');
        } catch (error) {
          console.error('Ошибка при выходе:', error);
        }
      }}
    />
  );
}

export default HeaderContainer;
