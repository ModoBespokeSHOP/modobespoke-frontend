import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/order-confirmed.module.css";

export default function OrderConfirmed() {
  const router = useRouter();
  const { orderId, telegramUrl } = router.query;
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          console.log("Запрос данных заказа для orderId:", orderId);
          const res = await fetch(`/api/get-order/${orderId}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              errorData.error || "Не удалось загрузить данные заказа"
            );
          }
          const data = await res.json();
          console.log("Данные заказа:", data);
          setOrderData(data);
        } catch (err) {
          console.error("Ошибка при загрузке заказа:", err);
          setError(
            "Не удалось загрузить данные заказа. Пожалуйста, используйте orderId для связи с менеджером."
          );
        }
      };
      fetchOrder();
    } else {
      setError("orderId не указан. Пожалуйста, свяжитесь с нами.");
    }
  }, [orderId]);

  // Формируем полное сообщение для копирования
  const getFullMessage = () => {
    if (!orderData) return "";
    const orderItems = orderData.cart
      .map(
        (item) =>
          `${item.qty} × ${item.title} (${item.selectedSize}) = ${
            item.price * item.qty
          }₽`
      )
      .join("\n");
    const total =
      orderData.cart.reduce((sum, item) => sum + item.price * item.qty, 0) +
      orderData.deliveryPrice;
    return (
      `Здравствуйте, я ${orderData.customerName}, телефон: ${orderData.customerPhone}, email: ${orderData.customerEmail}\n` +
      `Состав заказа:\n${orderItems}\n` +
      `Пункт выдачи: ${orderData.deliveryOffice}, способ доставки: ${orderData.deliveryMethod}\n` +
      `Итоговая сумма: ${total}₽\n` +
      `Заказ #${orderData.orderId}. Пожалуйста, подтвердите заказ.`
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullMessage()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.container}>
      <h1>Заказ успешно создан</h1>
      <p>
        Ваш заказ #{orderId || "не указан"} успешно сохранен! Мы благодарим вас
        за покупку.
      </p>

      <p className={styles.notice}>
        Уважаемые клиенты, из-за временных технических трудностей с нашим
        провайдером оплаты мы используем прямую оплату через Telegram. Нажмите
        на кнопку ниже, чтобы открыть чат с нашим менеджером. Если сообщение не
        отобразилось (особенно на iOS), скопируйте детали заказа ниже и вставьте
        их в чат Telegram. Приносим извинения за доставленные неудобства и
        благодарим за ваше понимание!
      </p>

      {error && <p className={styles.error}>{error}</p>}

      {orderData ? (
        <div className={styles.orderDetails}>
          <h2>Детали заказа #{orderData.orderId}</h2>
          <p>
            <strong>Клиент:</strong> {orderData.customerName}
          </p>
          <p>
            <strong>Телефон:</strong> {orderData.customerPhone}
          </p>
          <p>
            <strong>Email:</strong> {orderData.customerEmail}
          </p>
          <p>
            <strong>Пункт выдачи:</strong> {orderData.deliveryOffice}
          </p>
          <p>
            <strong>Способ доставки:</strong> {orderData.deliveryMethod}
          </p>
          <h3>Состав заказа:</h3>
          <ul>
            {orderData.cart.map((item) => (
              <li key={`${item.id}-${item.selectedSize}`}>
                {item.qty} × {item.title} ({item.selectedSize}) ={" "}
                {item.price * item.qty}₽
              </li>
            ))}
          </ul>
          <p>
            <strong>Итоговая сумма:</strong>{" "}
            {orderData.cart.reduce(
              (sum, item) => sum + item.price * item.qty,
              0
            ) + orderData.deliveryPrice}
            ₽
          </p>
          <button onClick={handleCopy} className={styles.copyButton}>
            {copied ? "Скопировано!" : "Скопировать детали заказа"}
          </button>
        </div>
      ) : (
        <p>Загрузка данных заказа...</p>
      )}

      <p>Нажмите кнопку ниже, чтобы открыть чат с менеджером в Telegram:</p>
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
      >
        Отправить сообщение в Telegram
      </a>
    </div>
  );
}
