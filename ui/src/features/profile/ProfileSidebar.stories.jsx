import ProfileSidebar from './ProfileSidebar';

export default {
  title: 'Features/Profile/ProfileSidebar',
  component: ProfileSidebar,
};

const mockUser = {
  name: 'Иван',
  lastname: 'Иванов',
  phone: '+7 (999) 123-45-67',
};

export const Default = {
  args: {
    user: mockUser,
    activeSection: 'data',
    onSectionChange: (section) => console.log('Section changed to:', section),
  },
};

export const Orders = {
  args: {
    user: mockUser,
    activeSection: 'orders',
    onSectionChange: (section) => console.log('Section changed to:', section),
  },
};
