import { useContext, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { CartContext } from "../context/CartContext";
import styles from "../styles/cart.module.css";
import CDEKWIDGET from "../components/CdekWidget";

export default function CartPage() {
  const { cart, addToCart, decreaseQty, removeFromCart, clearCart } =
    useContext(CartContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState({
    office: "Адрес не указан",
    price: 0,
    method: "не выбрано",
  });

  useEffect(() => {
    console.log(
      "Текущее состояние delivery:",
      JSON.stringify(delivery, null, 2)
    );
  }, [delivery]);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const finalTotal =
    total +
    (delivery.office && delivery.office !== "Адрес не указан"
      ? delivery.price
      : 0);

  const handlePay = async () => {
    setError("");
    console.log("handlePay вызван, данные:", {
      name,
      phone,
      email,
      cart,
      deliveryOffice: delivery.office,
      deliveryPrice: delivery.price,
      deliveryMethod: delivery.method,
    });

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Пожалуйста, введите ФИО, телефон и email");
      console.error("Ошибка валидации: отсутствуют ФИО, телефон или email");
      return;
    }
    if (
      delivery.office === "Адрес не указан" ||
      delivery.method === "не выбрано"
    ) {
      setError("Пожалуйста, выберите пункт выдачи заказа через СДЭК");
      console.error(
        "Ошибка валидации: ПВЗ не выбран или метод доставки не указан"
      );
      return;
    }

    const orderData = {
      cart,
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      deliveryOffice: delivery.office,
      deliveryPrice: delivery.price,
      deliveryMethod: delivery.method,
    };
    console.log(
      "orderData перед отправкой:",
      JSON.stringify(orderData, null, 2)
    );
    localStorage.setItem("lastOrder", JSON.stringify(orderData));

    setLoading(true);
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      console.log(
        "Ответ от /api/create-payment:",
        JSON.stringify(data, null, 2)
      );

      if (!res.ok) {
        throw new Error(data.message || `Ошибка оплаты: статус ${res.status}`);
      }

      // Сохраняем payment_id в localStorage для последующей проверки
      localStorage.setItem("payment_id", data.payment_id);
      window.location.href = data.confirmation_url;
    } catch (err) {
      console.error("Ошибка в handlePay:", {
        message: err.message,
        stack: err.stack,
      });
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

        <div className={styles.cartSummary}>
          <h2 className={styles.summaryTitle}>Оформление заказа</h2>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ФИО</label>
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

          <div
            className={`${styles.formGroup} ${
              delivery.office === "Адрес не указан" ? styles.error : ""
            }`}
          >
            <label className={styles.formLabel}>
              Выберите пункт выдачи (СДЭК):
            </label>
            <CDEKWIDGET setDelivery={setDelivery} />
            {delivery.office === "Адрес не указан" ? (
              <p className={styles.error}>Пункт выдачи не выбран</p>
            ) : null}
          </div>

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
            {delivery.office && delivery.office !== "Адрес не указан" && (
              <div className={styles.breakdownLine}>
                Доставка (СДЭК, {delivery.method}): {delivery.price}₽
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
            disabled={
              loading ||
              cart.length === 0 ||
              delivery.office === "Адрес не указан" ||
              delivery.method === "не выбрано"
            }
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
