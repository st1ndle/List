import ServicesGridContainer from './ServicesGridContainer';

export default {
  title: 'Features/Site/ServicesGridContainer',
  component: ServicesGridContainer,
  args: {
    title: 'Складские услуги',
    services: [
      { icon: '🏭', title: 'Хранение', description: 'Склад категории А.', price: 'от 32 ₽' },
      { icon: '🚛', title: 'Доставка', description: 'Собственный автопарк.', price: 'от 24 ₽ / км' },
    ],
  },
};
export const Default = {};
