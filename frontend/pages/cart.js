// frontend/pages/cart.js

import { useContext, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { CartContext } from "../context/CartContext";
import styles from "../styles/cart.module.css";

export default function CartPage() {
  const { cart, addToCart, decreaseQty, removeFromCart, clearCart } =
    useContext(CartContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handlePay = async () => {
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Пожалуйста, введите имя и телефон");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          customerName: name,
          customerPhone: phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка оплаты");
      window.location.href = data.confirmation_url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Корзина — Магазин платьев</title>
      </Head>
      <main className={styles.cartContainer}>
        {/* Слева: товары */}
        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <p>Ваша корзина пуста.</p>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}`}
                className={styles.cartItem}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={80}
                  height={80}
                  className={styles.itemImage}
                />
                <div className={styles.itemDetails}>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemMeta}>
                    Размер: {item.selectedSize}
                  </div>
                  <div className={styles.itemQty}>
                    <button
                      onClick={() => decreaseQty(item.id, item.selectedSize)}
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => addToCart(item, 1)}>+</button>
                  </div>
                  <div className={styles.itemPrice}>
                    {item.price * item.qty}₽
                  </div>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromCart(item.id, item.selectedSize)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Справа: форма и итоги */}
        <div className={styles.cartSummary}>
          <h2 className={styles.summaryTitle}>Оформление заказа</h2>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ваше имя</label>
            <input
              className={styles.formInput}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Телефон</label>
            <input
              className={styles.formInput}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Разбивка по товарам */}
          <div className={styles.breakdown}>
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}`}
                className={styles.breakdownLine}
              >
                {item.qty} × {item.title} ({item.selectedSize}) ={" "}
                {item.price * item.qty}₽
              </div>
            ))}
          </div>

          {/* Итого */}
          <div className={styles.summaryTotal}>
            <span className={styles.summaryLabel}>Итого к оплате:</span>
            <span className={styles.totalAmount}>{total}₽</span>
          </div>

          <button
            className={styles.payBtn}
            onClick={handlePay}
            disabled={loading || cart.length === 0}
          >
            {loading ? "Пожалуйста, подождите…" : "Оплатить"}
          </button>
          <button
            className={styles.clearBtn}
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Очистить корзину
          </button>
        </div>
      </main>
    </>
  );
}
