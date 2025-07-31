import { sql } from "@vercel/postgres";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.error("Неподдерживаемый метод:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
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

  if (
    !Array.isArray(cart) ||
    cart.length === 0 ||
    !customerName ||
    !customerPhone ||
    !customerEmail ||
    !deliveryOffice ||
    !deliveryMethod
  ) {
    console.error("Ошибка валидации данных:", {
      cart: Array.isArray(cart) && cart.length > 0,
      customerName: !!customerName,
      customerPhone: !!customerPhone,
      customerEmail: !!customerEmail,
      deliveryOffice: !!deliveryOffice,
      deliveryMethod: !!deliveryMethod,
    });
    return res.status(400).json({ message: "Missing required fields" });
  }

  const orderId = Date.now().toString();
  const orderDate = new Date().toISOString();
  const total =
    cart.reduce((sum, item) => sum + item.price * item.qty, 0) + deliveryPrice;

  try {
    await sql`
      INSERT INTO temp_orders (id, date, customer_name, customer_phone, customer_email, cart, delivery_office, delivery_price, delivery_method, total)
      VALUES (${orderId}, ${orderDate}, ${customerName}, ${customerPhone}, ${customerEmail}, ${JSON.stringify(
      cart
    )}, ${deliveryOffice}, ${deliveryPrice}, ${deliveryMethod}, ${total})
    `;
    console.log("Временный заказ сохранен:", { id: orderId });

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    if (!shopId || !secretKey) {
      console.error("Отсутствуют учетные данные ЮKassa:", {
        shopId,
        secretKey,
      });
      return res.status(500).json({ message: "Missing YooKassa credentials" });
    }

    const amountValue = total.toFixed(2);
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString(
          "base64"
        )}`,
        "Idempotence-Key": `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}`,
      },
      body: JSON.stringify({
        amount: { value: amountValue, currency: "RUB" },
        confirmation: {
          type: "redirect",
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?orderId=${orderId}`,
        },
        capture: true,
        description: `Заказ от ${customerName}`,
        metadata: { orderId },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Ошибка ЮKassa:", data);
      return res
        .status(response.status)
        .json({ message: "Payment creation failed" });
    }

    return res.status(200).json({
      confirmation_url: data.confirmation.confirmation_url,
      payment_id: data.id,
    });
  } catch (err) {
    console.error("Ошибка в /api/create-payment:", err);
    return res.status(500).json({ message: "Failed to create payment" });
  }
}
