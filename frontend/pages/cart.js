import { useContext, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { CartContext } from "../context/CartContext";
import styles from "../styles/cart.module.css";

export default function CartPage() {
  const { cart, addToCart, decreaseQty, removeFromCart, clearCart } =
    useContext(CartContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState({ office: null, price: 0 });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const finalTotal = total + (delivery.price || 0);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widget.cdek.ru/widget/scripts/widget.js";
    script.async = true;
    script.onload = () => {
      window.CDEKWidget.init({
        defaultCity: "Москва",
        yandexMapsApiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
        onChoose: (type, tariff, office) => {
          setDelivery({
            office: office.address,
            price: tariff.delivery_sum,
          });
        },
      });
    };
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    setError("");
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Пожалуйста, введите имя, телефон и email");
      return;
    }
    if (!delivery.office) {
      setError("Пожалуйста, выберите пункт выдачи заказа через СДЭК");
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
          customerEmail: email,
          deliveryOffice: delivery.office,
          deliveryPrice: delivery.price,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Ошибка оплаты: статус ${res.status}`);
      }

      const data = await res.json();
      window.location.href = data.confirmation_url;
    } catch (err) {
      console.error("Payment failed:", err);
      setError(err.message || "Неизвестная ошибка оплаты");
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
        {/* Товары */}
        <div className={styles.cartItems}>
          <h2 className={styles.itemsTitle}>Ваш заказ</h2>
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

        {/* Оформление заказа */}
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

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>E‑mail для чека</label>
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* СДЭК виджет */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Выберите пункт выдачи (СДЭК):
            </label>
            <div
              id="cdek-widget"
              style={{ height: "400px", border: "1px solid #ccc" }}
            ></div>
            {delivery.office && (
              <div className={styles.deliveryInfo}>
                <p>ПВЗ: {delivery.office}</p>
                <p>Стоимость доставки: {delivery.price}₽</p>
              </div>
            )}
          </div>

          {/* Сводка */}
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
            {delivery.price > 0 && (
              <div className={styles.breakdownLine}>
                Доставка (СДЭК): {delivery.price}₽
              </div>
            )}
          </div>

          <div className={styles.summaryTotal}>
            <span className={styles.summaryLabel}>Итого к оплате:</span>
            <span className={styles.totalAmount}>{finalTotal}₽</span>
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
