import ProductGridContainer from './ProductGridContainer';

export default {
  title: 'Containers/Blocks/ProductGridContainer',
  component: ProductGridContainer,
  args: {
    title: 'Каталог товаров',
    products: [
      { name: 'Вино красное', brand: 'Fanagoria', price: '290 ₽', volume: '0.75 л' },
      { name: 'Пиво светлое', brand: 'Балтика', price: '85 ₽', volume: '0.5 л' },
    ],
  },
};
export const Default = {};
