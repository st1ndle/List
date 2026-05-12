import { ColorPicker } from './ColorPicker';

export default {
  title: 'UI/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    label: 'Цвет фона',
    value: '#1A5C38',
    onChange: (e) => console.log(e.target.value),
  },
};
