import { sql } from "@vercel/postgres";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: "Missing orderId" });
  }

  try {
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    const response = await fetch(
      `https://api.yookassa.ru/v3/payments/${orderId}`,
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
    if (paymentData.status === "succeeded") {
      await sql`
        INSERT INTO orders (id, date, customer_name, customer_phone, customer_email, cart, delivery_office, delivery_price, delivery_method, total, status)
        SELECT id, date, customer_name, customer_phone, customer_email, cart, delivery_office, delivery_price, delivery_method, total, 'succeeded'
        FROM temp_orders
        WHERE id = ${orderId}
      `;
      await sql`DELETE FROM temp_orders WHERE id = ${orderId}`;
      console.log("Заказ подтвержден и сохранен в базе данных:", orderId);
      return res.status(200).json({ message: "Order confirmed and saved" });
    } else {
      return res
        .status(400)
        .json({ message: `Payment status: ${paymentData.status}` });
    }
  } catch (err) {
    console.error("Ошибка в /api/confirm-payment:", err);
    return res.status(500).json({ message: "Failed to confirm payment" });
  }
}
