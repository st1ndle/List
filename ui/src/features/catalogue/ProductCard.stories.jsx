import { fn } from 'storybook/test';
import ProductCard from './ProductCard';

export default { title: 'Features/Catalogue/ProductCard', component: ProductCard, args: { name: 'Вино столовое красное', brand: 'Fanagoria', price: '290 ₽', volume: '0.75 л', onAdd: fn() } };
export const Default = {};
