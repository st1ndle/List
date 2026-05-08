import { Routes, Route } from 'react-router-dom';
import HeaderContainer from './components/header/HeaderContainer';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import ServicesPage from './pages/ServicesPage';
import TariffsPage from './pages/TariffsPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AuthPage from './pages/AuthPage';
import './App.css';

function App() {
  return (
    <main className="app-root">
      <HeaderContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/tariffs" element={<TariffsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </main>
  );
}

export default App;
