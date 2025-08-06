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
    office: null,
    price: 0,
    method: "Неизвестный метод",
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

  const isDeliveryValid =
    delivery.office && delivery.office !== "Адрес не указан";

  const handlePay = async () => {
    setError("");
    setLoading(true);
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Пожалуйста, введите ФИО, телефон и email");
      setLoading(false);
      return;
    }
    if (!isDeliveryValid) {
      setError("Пожалуйста, выберите пункт выдачи заказа через СДЭК");
      setLoading(false);
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
      createdAt: new Date().toISOString(),
    };

    try {
      // Создаём сообщение для Telegram
      const message =
        `Здравствуйте, я ${name}, телефон: ${phone}, email: ${email}\n` +
        `Состав заказа:\n${cart
          .map(
            (item) =>
              `${item.qty} × ${item.title} (${item.selectedSize}) = ${
                item.price * item.qty
              }₽`
          )
          .join("\n")}\n` +
        `Пункт выдачи: ${delivery.office}, способ доставки: ${delivery.method}\n` +
        `Итоговая сумма: ${finalTotal}₽\n` +
        `Заказ #${orderData.createdAt}. Пожалуйста, подтвердите заказ.`;

      // Токен бота и ID чата
      const botToken = "8344483874:AAFC5fn5m7FrQVtTMcMsfhu3-8hurBBsMRw"; // Токен, который ты получишь от BotFather
      const chatId = "968299888"; // Твой chat_id в Telegram (можно получить с помощью Bot API)

      // Отправляем запрос в Telegram API для отправки сообщения
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        }
      );

      const data = await response.json();
      if (data.ok) {
        console.log("Сообщение успешно отправлено в Telegram");
        window.location.href = `/order-confirmed?orderId=${orderData.createdAt}`;
      } else {
        console.error(
          "Ошибка при отправке сообщения в Telegram:",
          data.description
        );
        setError(
          "Не удалось отправить сообщение в Telegram. Попробуйте позже."
        );
      }
    } catch (err) {
      console.error("Ошибка при сохранении заказа:", err);
      setError(err.message || "Не удалось сохранить заказ. Попробуйте позже.");
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

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Выберите пункт выдачи (СДЭК):
            </label>
            <CDEKWIDGET setDelivery={setDelivery} />
            {!isDeliveryValid && (
              <p className={styles.error}>Пункт выдачи не выбран</p>
            )}
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
            {isDeliveryValid && (
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
            type="button"
            className={styles.payBtn}
            onClick={handlePay}
            disabled={loading || cart.length === 0 || !isDeliveryValid}
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
