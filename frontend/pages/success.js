import { useEffect, useState } from "react";
import styles from "../styles/success.module.css";

export default function SuccessPage() {
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("lastOrder"));
    setOrderData(data);
  }, []);

  return (
    <div className={styles.container}>
      <h1>Спасибо за ваш заказ!</h1>
      {orderData ? (
        <div className={styles.orderDetails}>
          <h2>Детали заказа</h2>
          {orderData.customerName && (
            <p>
              <strong>Имя клиента:</strong> {orderData.customerName}
            </p>
          )}
          <p>
            <strong>Телефон:</strong> {orderData.customerPhone}
          </p>
          {orderData.customerEmail && (
            <p>
              <strong>Email:</strong> {orderData.customerEmail}
            </p>
          )}
          <p>
            <strong>Адрес доставки (ПВЗ):</strong> {orderData.deliveryOffice}
          </p>
          <p>
            <strong>Метод доставки:</strong> {orderData.deliveryMethod}
          </p>
          <p>
            <strong>Стоимость доставки:</strong> {orderData.deliveryPrice}₽
          </p>
          <h3>Товары:</h3>
          <ul>
            {orderData.cart.map((item, index) => (
              <li key={index}>
                {item.title} (Размер: {item.selectedSize}, Кол-во: {item.qty},
                Цена: {item.price * item.qty}₽)
              </li>
            ))}
          </ul>
          <p>
            <strong>Итого:</strong>{" "}
            {orderData.cart.reduce(
              (sum, item) => sum + item.price * item.qty,
              0
            ) + Number(orderData.deliveryPrice)}
            ₽
          </p>
          <p>Эти данные можно использовать для создания заказа в СДЭК.</p>
        </div>
      ) : (
        <p>Данные заказа не найдены.</p>
      )}
    </div>
  );
}
