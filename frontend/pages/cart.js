// frontend/pages/cart.js
import { useContext, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/cart.module.css";
import { CartContext } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  async function handleOrder() {
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Пожалуйста, заполните имя и телефон");
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
      if (res.ok && data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        throw new Error(data.message || "Не удалось создать платёж");
      }
    } catch (e) {
      console.error(e);
      setError("Ошибка при создании платежа. Попробуйте позже.");
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Корзина — Магазин платьев</title>
      </Head>
      <main className="section">
        {cart.length === 0 ? (
          <p>
            Ваша корзина пуста. <Link href="/">Вернуться в магазин</Link>
          </p>
        ) : (
          <div className={styles.cartContainer}>
            {/* Слева товары */}
            <div className={styles.cartItems}>
              {cart.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemQty}>Кол-во: {item.qty}</p>
                    <p className={styles.itemPrice}>
                      {item.price}₽ × {item.qty} = {item.price * item.qty}₽
                    </p>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Справа форма+разбивка+итог */}
            <div className={styles.cartSummary}>
              <h2 className={styles.summaryTitle}>Ваш заказ</h2>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ваше имя</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Телефон</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div className={styles.breakdown}>
                {cart.map((item) => (
                  <div key={item.id} className={styles.breakdownLine}>
                    + {item.price * item.qty}₽
                  </div>
                ))}
              </div>

              <div className={styles.summaryTotal}>
                <span className={styles.summaryLabel}>Итого к оплате</span>
                <span className={styles.totalAmount}>{total}₽</span>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                className={styles.payBtn}
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? "Создание платежа..." : "Оплатить"}
              </button>
              <button
                className={styles.clearBtn}
                onClick={clearCart}
                disabled={loading}
              >
                Очистить корзину
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
