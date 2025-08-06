import { get } from "@vercel/blob";

export default async function handler(req, res) {
  const { orderId } = req.query;

  try {
    console.log("Запрос на получение заказа:", orderId);
    const { blob } = await get(`orders/${orderId}.json`, {
      access: "public",
    });
    if (!blob) {
      console.log("Заказ не найден:", orderId);
      return res.status(404).json({ error: "Заказ не найден" });
    }
    const orderData = JSON.parse(await blob.text());
    console.log("Данные заказа:", orderData);
    res.status(200).json(orderData);
  } catch (error) {
    console.error("Ошибка при получении заказа:", error);
    res
      .status(500)
      .json({ error: "Не удалось получить заказ", details: error.message });
  }
}
