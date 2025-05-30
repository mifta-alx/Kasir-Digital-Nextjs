import { create } from "zustand";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type AddToCardItem = Omit<CartItem, "quantity">;

interface CartState {
  items: CartItem[];
  addToCart: (newItem: AddToCardItem) => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addToCart: (newItem) => {
    set((currentState) => {
      const existingIndex = currentState.items.findIndex(
        (item) => item.productId === newItem.productId,
      );
      if (existingIndex === -1) {
        return {
          items: [
            ...currentState.items,
            {
              ...newItem,
              quantity: 1,
            },
          ],
        };
      } else {
        const updatedItems = [...currentState.items];
        const existingItem = updatedItems[existingIndex]!;

        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
        };
        return {
          items: updatedItems,
        };
      }
    });
  },
}));
