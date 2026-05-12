// ui/src/components/admin/AdminSettings.stories.jsx
import AdminSettings from './AdminSettings';

export default {
  title: 'Admin/AdminSettings',
  component: AdminSettings,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Таблица управления динамическими настройками сайта. ' +
          'Загружает данные из GET /api/admin/settings, позволяет инлайн-редактировать ' +
          'каждое значение и сохранять через PUT /api/admin/settings/:key.',
      },
    },
  },
};

export const Default = {
  name: 'Таблица настроек',
};
