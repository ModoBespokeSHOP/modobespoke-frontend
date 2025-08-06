import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/order-confirmed.module.css";

export default function OrderConfirmed() {
  const router = useRouter();
  const { orderId, telegramUrl } = router.query; // Получаем данные из query строки URL
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");

  // Функция для редиректа в Telegram
  const redirectToTelegram = () => {
    if (telegramUrl) {
      window.location.href = telegramUrl;
    } else {
      setError("Ошибка: ссылка на Telegram не была передана.");
    }
  };

  useEffect(() => {
    if (orderId) {
      // Запросим данные о заказе, если это необходимо
      fetch(`/api/get-order?orderId=${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError("Не удалось получить данные о заказе.");
          } else {
            setOrderData(data);
          }
        })
        .catch(() =>
          setError("Произошла ошибка при получении данных о заказе.")
        );
    }
  }, [orderId]);

  return (
    <div className={styles.container}>
      <h1>Заказ успешно создан</h1>
      {orderData ? (
        <>
          <p>
            Ваш заказ #{orderId || "не указан"} успешно сохранен! Мы благодарим
            вас за покупку.
          </p>

          <p className={styles.notice}>
            Уважаемые клиенты, из-за временных технических трудностей со стороны
            провайдера оплаты мы временно используем прямую оплату через
            Telegram. Пожалуйста, свяжитесь с продавцом, нажав на кнопку ниже,
            чтобы завершить оформление заказа. Приносим извинения за
            доставленные неудобства и благодарим за ваше понимание!
          </p>

          <h2>Инструкция:</h2>
          <p>
            1. Нажмите на кнопку ниже, чтобы перейти в чат с продавцом в
            Telegram.
          </p>
          <p>2. Отправьте данные о заказе продавцу.</p>
          <p>3. Продавец свяжется с вами напрямую и оформит заказ.</p>

          <button className={styles.button} onClick={redirectToTelegram}>
            Перейти в Telegram
          </button>
        </>
      ) : (
        <p>{error || "Загрузка данных о заказе..."}</p>
      )}
    </div>
  );
}
