import SiteFooter from './SiteFooter';

export default {
  title: 'Site/SiteFooter',
  component: SiteFooter,
};

export const Default = {
  args: {
    onNavigate: (path) => console.log('Navigate to:', path),
  },
};
