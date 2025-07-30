import fs from "fs/promises";
import path from "path";

const tempOrdersFilePath = path.join(process.cwd(), "data", "temp-orders.json");
const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const event = req.body;
  console.log("Получен вебхук от ЮKassa:", JSON.stringify(event, null, 2));

  if (event.event === "payment.succeeded") {
    const paymentId = event.object.id;
    const orderId = event.object.metadata?.orderId;

    if (!orderId) {
      console.error("Отсутствует orderId в вебхуке");
      return res.status(400).json({ message: "Missing orderId in webhook" });
    }

    try {
      // Читаем временный заказ
      let tempOrders = [];
      let order = null;
      try {
        const fileContent = await fs.readFile(tempOrdersFilePath, "utf-8");
        tempOrders = JSON.parse(fileContent);
        order = tempOrders.find((o) => o.id === Number(orderId));
        if (!order) {
          throw new Error("Order not found");
        }
      } catch (err) {
        console.error("Ошибка чтения временного заказа:", err);
        return res.status(404).json({ message: "Order not found" });
      }

      // Сохраняем заказ в orders.json
      try {
        let orders = [];
        try {
          const fileContent = await fs.readFile(ordersFilePath, "utf-8");
          orders = JSON.parse(fileContent);
          if (!Array.isArray(orders)) orders = [];
        } catch (err) {
          console.log("Файл orders.json не существует, будет создан новый");
        }
        orders.push({ ...order, status: "succeeded" });
        await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
        console.log("Заказ сохранён в orders.json:", order);

        // Удаляем заказ из temp-orders.json
        tempOrders = tempOrders.filter((o) => o.id !== Number(orderId));
        await fs.writeFile(
          tempOrdersFilePath,
          JSON.stringify(tempOrders, null, 2)
        );
        console.log("Временный заказ удалён:", orderId);

        return res.status(200).json({ message: "Webhook processed" });
      } catch (err) {
        console.error("Ошибка сохранения заказа:", err);
        return res.status(500).json({ message: "Failed to save order" });
      }
    } catch (err) {
      console.error("Ошибка обработки вебхука:", err);
      return res
        .status(500)
        .json({ message: err.message || "Failed to process webhook" });
    }
  }

  return res
    .status(200)
    .json({ message: "Webhook received but not processed" });
}
