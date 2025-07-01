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

  // Загрузка корзины при монтировании
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

  // Сохранение корзины
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /**
   * Добавляет товар в корзину с учётом выбранного размера
   * @param {{ id, title, price, image, selectedSize }} product
   * @param {number} qty
   */
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      // Ищем товар по id и размеру
      const idx = prev.findIndex(
        (p) => p.id === product.id && p.selectedSize === product.selectedSize
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].qty += qty;
        return updated;
      }
      return [...prev, { ...product, qty }];
    });
  };

  const decreaseQty = (productId, size) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === productId && p.selectedSize === size
            ? { ...p, qty: p.qty > 0 ? p.qty - 1 : 0 }
            : p
        )
        .filter((p) => p.qty > 0)
    );
  };

  const removeFromCart = (productId, size) => {
    setCart((prev) =>
      prev.filter((p) => !(p.id === productId && p.selectedSize === size))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, decreaseQty, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
