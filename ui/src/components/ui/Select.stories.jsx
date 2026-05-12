import { Select } from './Select';

export default {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
};

const options = [
  { value: '1', label: 'Опция 1' },
  { value: '2', label: 'Опция 2' },
  { value: '3', label: 'Опция 3' },
];

export const Default = {
  args: {
    options: options,
  },
};

export const WithLabel = {
  args: {
    label: 'Выберите категорию',
    options: options,
  },
};

export const WithError = {
  args: {
    label: 'Выберите город',
    options: options,
    error: 'Поле обязательно для заполнения',
  },
};
