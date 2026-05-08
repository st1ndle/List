import { fn } from 'storybook/test';
import HeroBanner from './HeroBanner';

export default { title: 'Site/HeroBanner', component: HeroBanner, args: { title: 'НАПИТКИ ДЛЯ ВАШЕГО БИЗНЕСА', description: 'Оптовая дистрибуция напитков со склада категории А.', onPrimaryClick: fn(), onSecondaryClick: fn() } };
export const Default = {};
