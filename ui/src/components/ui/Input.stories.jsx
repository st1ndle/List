import { Input } from './Input';

export default {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    placeholder: 'Введите текст...',
  },
};

export const WithLabel = {
  args: {
    label: 'Имя пользователя',
    placeholder: 'Иван Иванов',
  },
};

export const WithError = {
  args: {
    label: 'Email',
    placeholder: 'example@mail.ru',
    error: 'Некорректный email адрес',
  },
};
