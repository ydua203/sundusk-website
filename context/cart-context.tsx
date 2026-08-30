"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// React context + localStorage — spec section 2 explicitly rules out
// Zustand/Redux for the cart.

export type CartItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  size: string;
  sku: string;
  /** Snapshot for display only. The server recalculates every price from
   * the database at checkout (spec section 7) — this value is never
   * trusted for anything money-related. */
  unitPricePaise: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  /** True once localStorage has been read. Pages should avoid rendering an
   * "empty cart" state before this flips true, or a real cart flashes empty
   * for a frame on load. */
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotalPaise: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "sundusk-cart-v1";
// Sanity cap on a single line, not an inventory check — the server is the
// real source of truth for stock (spec section 7, checked again at
// checkout and enforced again, atomically, at the payment webhook).
const MAX_QUANTITY_PER_LINE = 10;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read localStorage only after mount — it doesn't exist during SSR, and
  // reading it during the initial render would make the server-rendered
  // HTML disagree with the client's first render (a hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      }
    } catch {
      // Corrupt or inaccessible localStorage — start empty rather than
      // crashing the app.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist on every change, but only after hydration — otherwise the
  // first render's empty array would overwrite whatever was already saved
  // before the read above has a chance to run.
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or blocked (e.g. private browsing) — the cart still
      // works for this session, it just won't survive a reload.
    }
  }, [items, isHydrated]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? {
                ...i,
                quantity: Math.min(i.quantity + quantity, MAX_QUANTITY_PER_LINE),
              }
            : i,
        );
      }
      return [
        ...prev,
        { ...item, quantity: Math.min(quantity, MAX_QUANTITY_PER_LINE) },
      ];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (variantId) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (
    variantId,
    quantity,
  ) => {
    const clamped = Math.max(1, Math.min(quantity, MAX_QUANTITY_PER_LINE));
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity: clamped } : i)),
    );
  };

  const clearCart = () => setItems([]);

  const subtotalPaise = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPricePaise * i.quantity, 0),
    [items],
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotalPaise,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
