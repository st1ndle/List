import { create } from 'zustand';
import ApiStorage from '../api/ApiStorage';

const useAdminStore = create((set, get) => ({
  warehouses: [],
  isLoading: false,
  error: null,

  fetchWarehouses: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await ApiStorage.admin.warehouses.getAll();
      set({ warehouses: data || [], isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  }
}));

export default useAdminStore;
