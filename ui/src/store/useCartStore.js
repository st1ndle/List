import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: {}, // key: id, value: quantity

      addToCart: (id) => set((state) => {
        const currentQty = state.items[id] || 0;
        return {
          items: {
            ...state.items,
            [id]: currentQty + 1,
          },
        };
      }),

      updateQuantity: (id, delta) => set((state) => {
        const currentQty = state.items[id] || 0;
        const nextQty = currentQty + delta;
        if (nextQty <= 0) {
          const nextItems = { ...state.items };
          delete nextItems[id];
          return { items: nextItems };
        }
        return {
          items: {
            ...state.items,
            [id]: nextQty,
          },
        };
      }),

      removeFromCart: (id) => set((state) => {
        const nextItems = { ...state.items };
        delete nextItems[id];
        return { items: nextItems };
      }),

      clearCart: () => set({ items: {} }),

      getCartItemsCount: () => {
        const state = get();
        return Object.keys(state.items).length;
      },
    }),
    {
      name: 'diplom_cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCartStore;
