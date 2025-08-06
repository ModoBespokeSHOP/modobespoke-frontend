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

    // Сохраняем в Vercel Blob
    console.log("Сохранение заказа:", orderId, "Данные:", orderData);
    const blob = await put(
      `orders/${orderId}.json`,
      JSON.stringify(orderData),
      {
        access: "public",
      }
    );
    console.log("Заказ сохранен:", blob);

    // Формируем минимальное сообщение для Telegram (только orderId)
    const message = encodeURIComponent(`Заказ #${orderId}`);

    // Формируем telegramUrl
    const sellerUsername = process.env.SELLER_TELEGRAM_USERNAME || "@Nikkkoris";
    const cleanUsername = sellerUsername.startsWith("@")
      ? sellerUsername.slice(1)
      : sellerUsername;
    const telegramUrl = `https://t.me/${cleanUsername}?text=${message}`;

    console.log("Сформирован telegramUrl:", telegramUrl);
    res.status(200).json({ orderId, telegramUrl });
  } catch (error) {
    console.error("Ошибка при сохранении заказа:", error);
    res
      .status(500)
      .json({ error: "Не удалось сохранить заказ", details: error.message });
  }
}
