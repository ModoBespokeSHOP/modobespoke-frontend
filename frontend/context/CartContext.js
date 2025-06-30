// frontend/context/CartContext.js

import { createContext, useState, useEffect } from "react";

export const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  decreaseQty: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // — Загружаем корзину из localStorage при первом монтировании
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (err) {
        console.warn("CartContext: failed to parse saved cart", err);
      }
    }
  }, []);

  // — Сохраняем корзину в localStorage при каждом её изменении
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /**
   * Добавляет товар в корзину.
   * @param {object} product — объект товара { id, title, price, image, ... }
   * @param {number} qty — сколько единиц добавить (по умолчанию 1)
   */
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].qty += qty;
        return updated;
      }
      return [...prev, { ...product, qty }];
    });
  };

  /**
   * Уменьшает количество данного товара на 1.
   * Если в результате qty станет 0, товар удаляется из корзины.
   * @param {string|number} productId
   */
  const decreaseQty = (productId) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === productId ? { ...p, qty: p.qty > 0 ? p.qty - 1 : 0 } : p
        )
        .filter((p) => p.qty > 0)
    );
  };

  /**
   * Удаляет товар из корзины полностью.
   * @param {string|number} productId
   */
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p.id !== productId));
  };

  /** Очищает всю корзину */
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decreaseQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
