import { create } from 'zustand';

const useToastStore = create((set) => ({
  message: '',
  icon: '',
  visible: false,
  showToast: (icon, message) => set({ icon, message, visible: true }),
  hideToast: () => set({ visible: false }),
}));

export default useToastStore;
