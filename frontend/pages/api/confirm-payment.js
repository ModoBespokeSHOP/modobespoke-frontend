import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";

const tempOrdersFilePath = path.join(process.cwd(), "data", "temp-orders.json");
const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: "Missing orderId" });
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

    // Проверяем статус платежа через ЮKassa
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    if (!shopId || !secretKey) {
      console.error("Отсутствуют учетные данные ЮKassa:", {
        shopId,
        secretKey,
      });
      return res.status(500).json({ message: "Missing YooKassa credentials" });
    }

    const paymentId = order.metadata?.paymentId; // Предполагается, что paymentId сохранён в metadata
    if (!paymentId) {
      throw new Error("Payment ID not found in order metadata");
    }

    const response = await fetch(
      `https://api.yookassa.ru/v3/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${shopId}:${secretKey}`
          ).toString("base64")}`,
        },
      }
    );

    const paymentData = await response.json();
    console.log(
      "Статус платежа от ЮKassa:",
      JSON.stringify(paymentData, null, 2)
    );

    if (!response.ok) {
      console.error("Ошибка проверки статуса платежа:", paymentData);
      return res.status(response.status).json({
        message: paymentData.description || "Failed to check payment status",
      });
    }

    if (paymentData.status === "succeeded") {
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

        return res.status(200).json({ message: "Order confirmed and saved" });
      } catch (err) {
        console.error("Ошибка сохранения заказа:", err);
        return res.status(500).json({ message: "Failed to save order" });
      }
    } else {
      return res
        .status(400)
        .json({ message: `Payment status: ${paymentData.status}` });
    }
  } catch (err) {
    console.error("Ошибка в /api/confirm-payment:", err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to confirm payment" });
  }
}
