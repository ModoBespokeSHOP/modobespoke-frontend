import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../styles/order-confirmed.module.css";

export default function OrderConfirmed() {
  const router = useRouter();
  const {
    orderId,
    telegramUrl,
    customerName,
    customerPhone,
    customerEmail,
    deliveryOffice,
    deliveryPrice,
    deliveryMethod,
    cart,
    finalTotal,
  } = router.query;
  const [copied, setCopied] = useState(false);

  // Формируем полное сообщение для копирования
  const getFullMessage = () => {
    if (
      !orderId ||
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !cart
    ) {
      return `Здравствуйте, мой заказ #${
        orderId || "не указан"
      }. Пожалуйста, свяжитесь со мной для подтверждения и оплаты.`;
    }

    const parsedCart = JSON.parse(cart || "[]");
    const orderItems = parsedCart
      .map(
        (item) =>
          `${item.qty} × ${item.title} (${item.selectedSize}) = ${
            item.price * item.qty
          }₽`
      )
      .join("\n");

    return (
      `Здравствуйте, я ${customerName} \nтелефон: ${customerPhone}\nemail: ${customerEmail}\n` +
      `Состав заказа:\n${orderItems}\n` +
      `Стоймость Доставки = ${deliveryPrice}₽\n` +
      `Пункт выдачи: ${deliveryOffice}, \nСпособ доставки: ${deliveryMethod}\n` +
      `Итоговая сумма: ${finalTotal}₽\n` +
      `Заказ #${orderId}. Пожалуйста, подтвердите заказ.`
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

      <div className={styles.notice}>
        <p>
          Уважаемые клиенты, из-за временных технических трудностей с нашим
          провайдером оплаты мы используем прямую оплату через Telegram. Чтобы
          завершить оформление заказа, выполните следующие шаги:
        </p>
        <ol className={styles.instructions}>
          <li>
            Нажмите кнопку &quot;Скопировать сообщение&quot; ниже, чтобы
            скопировать полную информацию о заказе.
          </li>
          <li>
            Нажмите кнопку &quot;Открыть Telegram&quot;, чтобы перейти в чат
            напрямую с продавцом (@catrigees). Поле ввода в Telegram будет
            пустым.
          </li>
          <li>
            В чате Telegram удерживайте поле ввода и выберите
            &quot;Вставить&quot; (на ПК: Ctrl+V или правый клик → Вставить),
            чтобы вставить скопированное сообщение.
          </li>
          <li>
            Отправьте сообщение. И продавец свяжется с вами для подтверждения и
            оплаты.
          </li>
        </ol>
        <p>
          Если в Telegram автоматически появляется текст, очистите поле перед
          вставкой скопированного сообщения. Приносим извинения за неудобства и
          благодарим за ваше понимание!
        </p>
      </div>

      <button onClick={handleCopy} className={styles.copyButton}>
        {copied ? "Скопировано!" : "Скопировать сообщение"}
      </button>

      <p>Нажмите кнопку ниже, чтобы открыть чат с продавцом в Telegram:</p>
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
      >
        Открыть Telegram
      </a>
    </div>
  );
}
