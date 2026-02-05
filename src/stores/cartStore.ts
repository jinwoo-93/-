import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Post } from '@/types';

interface CartItem {
  post: Post;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (post: Post, quantity?: number) => void;
  removeItem: (postId: string) => void;
  updateQuantity: (postId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPriceKRW: () => number;
  getTotalPriceCNY: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (post, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.post.id === post.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.post.id === post.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { post, quantity }],
          };
        });
      },

      removeItem: (postId) => {
        set((state) => ({
          items: state.items.filter((item) => item.post.id !== postId),
        }));
      },

      updateQuantity: (postId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(postId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.post.id === postId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPriceKRW: () => {
        return get().items.reduce(
          (total, item) => total + item.post.priceKRW * item.quantity,
          0
        );
      },

      getTotalPriceCNY: () => {
        return get().items.reduce(
          (total, item) => total + item.post.priceCNY * item.quantity,
          0
        );
      },
    }),
    {
      name: 'jikguyeokgu-cart',
    }
  )
);

export default useCartStore;
