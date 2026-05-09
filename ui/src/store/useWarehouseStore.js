import { create } from 'zustand';
import ApiStorage from '../api/ApiStorage';

const useWarehouseStore = create((set, get) => ({
  warehouses: [],
  isLoading: false,
  error: null,

  fetchWarehouses: async () => {
    // Если данные уже есть или идет загрузка — ничего не делаем
    if (get().warehouses.length > 0 || get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const data = await ApiStorage.warehouses.getAll();
      set({ warehouses: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },
}));

export default useWarehouseStore;
