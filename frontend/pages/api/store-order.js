import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не поддерживается" });
  }

  const {
    cart,
    customerName,
    customerPhone,
    customerEmail,
    deliveryOffice,
    deliveryPrice,
    deliveryMethod,
  } = req.body;

  try {
    // Генерируем уникальный orderId
    const orderId = nanoid(10);

    // Формируем данные заказа
    const orderData = {
      orderId,
      cart,
      customerName,
      customerPhone,
      customerEmail,
      deliveryOffice,
      deliveryPrice,
      deliveryMethod,
      createdAt: new Date().toISOString(),
    };

    // Сохраняем заказ в Vercel Blob
    const blob = await put(
      `orders/${orderId}.json`,
      JSON.stringify(orderData),
      {
        access: "public",
      }
    );

    // Формируем состав заказа
    const orderItems = cart
      .map(
        (item) =>
          `${item.qty} × ${item.title} (${item.selectedSize}) = ${
            item.price * item.qty
          }₽`
      )
      .join("\n");

    // Вычисляем итоговую сумму
    const total =
      cart.reduce((sum, item) => sum + item.price * item.qty, 0) +
      deliveryPrice;

    // Формируем подробное сообщение для Telegram
    const message = encodeURIComponent(
      `Здравствуйте, я ${customerName}, телефон: ${customerPhone}, email: ${customerEmail}\n` +
        `Состав заказа:\n${orderItems}\n` +
        `Пункт выдачи: ${deliveryOffice}, способ доставки: ${deliveryMethod}\n` +
        `Итоговая сумма: ${total}₽\n` +
        `Заказ #${orderId}. Пожалуйста, подтвердите заказ.`
    );

    // Проверка длины URL
    const sellerUsername = process.env.SELLER_TELEGRAM_USERNAME || "@Nikkkoris";
    const cleanUsername = sellerUsername.startsWith("@")
      ? sellerUsername.slice(1)
      : sellerUsername;
    let telegramUrl = `https://t.me/${cleanUsername}?text=${message}`;

    // Проверка на превышение длины URL
    if (telegramUrl.length > 2000) {
      const shortMessage = encodeURIComponent(
        `Здравствуйте, я ${customerName}, заказ #${orderId}. Подробности заказа на сайте.`
      );
      telegramUrl = `https://t.me/${cleanUsername}?text=${shortMessage}`;
    }

    res.status(200).json({ orderId, telegramUrl });
  } catch (error) {
    console.error("Ошибка при сохранении заказа:", error);
    res
      .status(500)
      .json({ error: "Не удалось сохранить заказ", details: error.message });
  }
}
