import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/order-confirmed.module.css";

export default function OrderConfirmed() {
  const router = useRouter();
  const { orderId, telegramUrl } = router.query;
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");

  return (
    <div className={styles.container}>
      <h1>Заказ успешно создан</h1>
      <p>
        Ваш заказ #{orderId || "не указан"} успешно сохранен! Мы благодарим вас
        за покупку.
      </p>

      <p className={styles.notice}>
        Уважаемые клиенты, из-за временных технических трудностей со стороны
        провайдера оплаты мы временно используем прямую оплату через Telegram.
        Пожалуйста, свяжитесь с продавцом, нажав на кнопку ниже, чтобы завершить
        оформление заказа. Приносим извинения за доставленные неудобства и
        благодарим за ваше понимание!
      </p>
      <h2>Инструкция:</h2>

      <p>1. Нажмите на кнопку ниже чтобы перейти в телеграм</p>
      <p>2. Отправьте данные о заказе продавцу</p>
      <p>3. Продавец свяжется с вами на прямую и оформит заказ</p>
      <p className={styles.notice}></p>

      <p>
        Нажмите кнопку ниже, чтобы связаться с нашим менеджером в Telegram и
        завершить оформление:
      </p>
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
