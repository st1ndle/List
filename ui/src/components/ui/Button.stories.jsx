import { fn } from 'storybook/test';
import { Button, FilterChip, IconButton } from './Button';

export default {
  title: 'UI Kit/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onClick: fn() },
};

export const Solid = {
  args: { variant: 'solid', size: 'md', children: 'Открыть каталог' },
};

export const Outline = {
  args: { variant: 'outline', size: 'md', children: 'Получить консультацию' },
};

export const Ghost = {
  args: { variant: 'ghost', size: 'md', children: 'Мои заказы' },
};

export const Danger = {
  args: { variant: 'danger', size: 'sm', children: 'Отменить' },
};

export const FullWidth = {
  args: {
    variant: 'solid',
    fullWidth: true,
    size: 'lg',
    children: 'Оформить заказ',
  },
  parameters: { layout: 'padded' },
};

export const IconCart = {
  render: (args) => <IconButton {...args}>🛒</IconButton>,
  args: {
    variant: 'neutral',
    size: 'md',
    badge: 3,
    ariaLabel: 'Корзина',
    onClick: fn(),
  },
};

export const IconDelete = {
  render: (args) => <IconButton {...args}>✕</IconButton>,
  args: {
    variant: 'danger',
    size: 'sm',
    ariaLabel: 'Удалить',
    onClick: fn(),
  },
};

export const FilterChips = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <FilterChip>Все товары</FilterChip>
      <FilterChip tone="wine" active>
        🍷 Вино
      </FilterChip>
      <FilterChip tone="beer">🍺 Пиво</FilterChip>
      <FilterChip tone="soda">🥤 Газировки</FilterChip>
      <FilterChip tone="water">💧 Вода</FilterChip>
    </div>
  ),
};
