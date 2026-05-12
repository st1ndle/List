import { Checkbox } from './Checkbox';

export default {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    label: 'Я согласен с условиями',
  },
};

export const Checked = {
  args: {
    label: 'Запомнить меня',
    defaultChecked: true,
  },
};
