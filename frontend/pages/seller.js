import { useState } from "react";
import styles from "../styles/seller.module.css"; // Создайте CSS-модуль для стилизации

export default function SellerPage() {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    setError("");
    try {
      const res = await fetch(`/api/get-order/${orderId}`);
      if (!res.ok) {
        throw new Error("Заказ не найден");
      }
      const data = await res.json();
      setOrderData(data);
    } catch (err) {
      setError("Не удалось найти заказ");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Панель продавца</h1>
      <div className={styles.formGroup}>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Введите orderId"
          className={styles.input}
        />
        <button onClick={fetchOrder} className={styles.button}>
          Найти заказ
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {orderData && (
        <div className={styles.orderDetails}>
          <h2>Заказ #{orderData.orderId}</h2>
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
            <strong>Доставка:</strong> {orderData.deliveryPrice}₽ (
            {orderData.deliveryMethod})
          </p>
          <h3>Товары:</h3>
          <ul>
            {orderData.cart.map((item) => (
              <li key={`${item.id}-${item.selectedSize}`}>
                {item.qty} × {item.title} ({item.selectedSize}) ={" "}
                {item.price * item.qty}₽
              </li>
            ))}
          </ul>
          <p>
            <strong>Итого:</strong>{" "}
            {orderData.cart.reduce(
              (sum, item) => sum + item.price * item.qty,
              0
            ) + orderData.deliveryPrice}
            ₽
          </p>
        </div>
      )}
    </div>
  );
}
