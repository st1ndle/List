import { InputField, FormRow } from './Form';

export default {
  title: 'UI Kit/Form',
  component: InputField,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    label: 'Имя',
    placeholder: 'Иван',
  },
};

export const WithValue = {
  args: {
    label: 'Фамилия',
    defaultValue: 'Иванов',
  },
};

export const Row = {
  render: () => (
    <FormRow>
      <InputField label="Имя" placeholder="Иван" />
      <InputField label="Фамилия" placeholder="Иванов" />
    </FormRow>
  ),
};
