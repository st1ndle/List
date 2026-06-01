import ProfileDataForm from './ProfileDataForm';

export default {
  title: 'Features/Profile/ProfileDataForm',
  component: ProfileDataForm,
};

const mockUser = {
  name: 'Иван',
  lastname: 'Иванов',
  phone: '+7 (999) 123-45-67',
  email: 'ivan@example.com',
};

export const Default = {
  args: {
    user: mockUser,
    onSave: () => console.log('onSave called'),
  },
};
