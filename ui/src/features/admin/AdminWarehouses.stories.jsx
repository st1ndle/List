import AdminWarehouses from './AdminWarehouses';

export default {
  title: 'Features/Admin/AdminWarehouses',
  component: AdminWarehouses,
};

const mockWarehouses = [
  {
    id: 1,
    warehouse_code: 'WH001',
    name: 'Центральный склад',
    city: 'Москва',
    address: 'ул. Ленина, 1',
    is_active: true,
  },
  {
    id: 2,
    warehouse_code: 'WH002',
    name: 'Северный филиал',
    city: 'Санкт-Петербург',
    address: 'пр. Просвещения, 15',
    is_active: false,
  },
];

export const Default = {
  args: {
    warehouses: mockWarehouses,
  },
};
