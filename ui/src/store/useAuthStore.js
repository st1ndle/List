import { create } from 'zustand';
import ApiStorage from '../api/ApiStorage';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    // Avoid double loading if already loaded
    try {
      const data = await ApiStorage.auth.me();
      if (data && data.user) {
        set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: err.message });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      await ApiStorage.auth.login(credentials);
      await get().checkAuth();
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await ApiStorage.auth.register(userData);
      await get().checkAuth();
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await ApiStorage.auth.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  }
}));

export default useAuthStore;
