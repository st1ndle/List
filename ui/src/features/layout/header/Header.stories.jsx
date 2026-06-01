import { fn } from 'storybook/test';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

const navItems = [
  { label: 'Главная', path: '/' },
  { label: 'Каталог', path: '/catalogue' },
  { label: 'Услуги склада', path: '/services' },
  { label: 'Тарифы', path: '/tariffs' },
  { label: 'О компании', path: '/about' },
  { label: 'Контакты', path: '/contacts' },
];

export default {
  title: 'Features/Layout/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    brand: {
      name: 'ООО ЛиСТ',
      tagline: 'Напитки оптом · Складское предприятие',
    },
    navigationItems: navItems,
    activePath: '/',
    phone: '+7 (495) 229-40-05',
    cartCount: 2,
    isAuthenticated: false,
    onNavigate: fn(),
    onCartClick: fn(),
    onOrdersClick: fn(),
    onLoginClick: fn(),
    onLogoutClick: fn(),
  },
};

export const Guest = {};

export const Authenticated = {
  args: {
    isAuthenticated: true,
    activePath: '/catalogue',
  },
};
