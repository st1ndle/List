import SiteFooter from './SiteFooter';

export default {
  title: 'Features/Layout/Footer',
  component: SiteFooter,
};

export const Default = {
  args: {
    onNavigate: (path) => console.log('Navigate to:', path),
  },
};
