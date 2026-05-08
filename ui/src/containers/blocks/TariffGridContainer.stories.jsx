import TariffGridContainer from './TariffGridContainer';

export default {
  title: 'Containers/Blocks/TariffGridContainer',
  component: TariffGridContainer,
  args: {
    title: 'Тарифы перевозки',
    tariffs: [
      { type: 'Малотоннажный', load: 'до 5 тонн', price: '24 ₽ / км' },
      { type: 'Крупнотоннажный', load: 'до 20 тонн', price: '38 ₽ / км' },
    ],
  },
};
export const Default = {};
