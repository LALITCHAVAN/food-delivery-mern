import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "@/lib/api";
import type { CartItem } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  count: number;
  subtotal: number;
  addToCart: (foodId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadCart() {
    if (!profile) {
      setItems([]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/cart");
      setItems((response.data.items || []) as CartItem[]);
    } catch (error) {
      console.error("Load cart error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  async function addToCart(foodId: string, quantity = 1) {
    if (!profile) {
      throw new Error("Please sign in to add items to your cart");
    }

    try {
      await api.post("/cart", {
        foodId,
        quantity,
      });

      await loadCart();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add item to cart";

      throw new Error(message);
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) {
      await removeItem(itemId);
      return;
    }

    const item = items.find((i) => i.id === itemId);

    if (!item) {
      throw new Error("Cart item not found");
    }

    try {
      await api.put(`/cart/${item.food_id}`, {
        quantity,
      });

      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                quantity,
              }
            : i
        )
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update cart";

      throw new Error(message);
    }
  }

  async function removeItem(itemId: string) {
    const item = items.find((i) => i.id === itemId);

    if (!item) {
      throw new Error("Cart item not found");
    }

    try {
      await api.delete(`/cart/${item.food_id}`);

      setItems((prev) =>
        prev.filter((i) => i.id !== itemId)
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to remove item";

      throw new Error(message);
    }
  }

  async function clearCart() {
    if (!profile) {
      return;
    }

    try {
      await api.delete("/cart");
      setItems([]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to clear cart";

      throw new Error(message);
    }
  }

  const count = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.foods?.price || 0) * item.quantity,
    0
  );

  const value: CartContextValue = {
    items,
    loading,
    count,
    subtotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
}
