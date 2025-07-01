// pages/api/create-payment.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { cart, customerName, customerPhone } = req.body;

  if (
    !Array.isArray(cart) ||
    cart.length === 0 ||
    !customerName ||
    !customerPhone
  ) {
    return res.status(400).json({ message: "Missing cart, name or phone" });
  }

  // Рассчитываем сумму
  const totalCents = cart.reduce(
    (sum, item) => sum + item.price * item.qty * 100,
    0
  );
  const amountValue = (totalCents / 100).toFixed(2);

  // Формируем описание с товарами и размерами
  const itemsDesc = cart
    .map(
      (item) =>
        `${item.title} (Размер: ${item.selectedSize || "—"}) x${item.qty}`
    )
    .join(", ");
  const description = `Заказ от ${customerName}, тел: ${customerPhone}. Товары: ${itemsDesc}`;

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    return res.status(500).json({ message: "Missing YooKassa credentials" });
  }

  try {
    const paymentRes = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString(
          "base64"
        )}`,
        "Idempotence-Key": `${Date.now()}`,
      },
      body: JSON.stringify({
        amount: { value: amountValue, currency: "RUB" },
        confirmation: {
          type: "redirect",
          return_url:
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        },
        capture: true,
        description,
      }),
    });

    const data = await paymentRes.json();
    if (!paymentRes.ok) {
      console.error("YooKassa error:", data);
      return res.status(paymentRes.status).json(data);
    }

    return res.status(200).json({
      confirmation_url: data.confirmation.confirmation_url,
    });
  } catch (err) {
    console.error("Create-payment error:", err);
    return res.status(500).json({ message: "Payment request failed" });
  }
}
