import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HeaderContainer from './features/layout/header/HeaderContainer';
import Toast from './components/ui/Toast';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import ServicesPage from './pages/ServicesPage';
import TariffsPage from './pages/TariffsPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import useAuthStore from './store/useAuthStore';
import './App.css';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <main className="app-root">
      <HeaderContainer />
      <Toast />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/tariffs" element={<TariffsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/adminpage" element={<AdminPage />} />
      </Routes>
    </main>
  );
}

export default App;
