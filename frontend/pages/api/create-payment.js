// pages/api/create-payment.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { cart, customerName, customerPhone, customerEmail } = req.body;

  if (
    !Array.isArray(cart) ||
    cart.length === 0 ||
    !customerName ||
    !customerPhone ||
    !customerEmail
  ) {
    return res
      .status(400)
      .json({ message: "Missing cart, name, phone or email" });
  }

  // Считаем сумму в копейках и форматируем
  const totalCents = cart.reduce(
    (sum, item) => sum + item.price * item.qty * 100,
    0
  );
  const amountValue = (totalCents / 100).toFixed(2);

  // Формируем массив позиций для чека
  const receiptItems = cart.map((item) => ({
    description: `${item.title} (${item.selectedSize})`,
    quantity: item.qty,
    amount: {
      value: item.price.toFixed(2),
      currency: "RUB",
    },
    vat_code: 1, // упрощёнка без НДС
    payment_mode: "full_payment",
    payment_subject: "commodity",
  }));

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    return res.status(500).json({ message: "Missing YooKassa credentials" });
  }

  try {
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
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
        description: `Заказ от ${customerName}`,
        receipt: {
          customer: {
            email: customerEmail,
            phone: customerPhone,
          },
          items: receiptItems,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("YooKassa error:", data);
      return res.status(response.status).json({
        message: data.message || JSON.stringify(data),
      });
    }

    return res.status(200).json({
      confirmation_url: data.confirmation.confirmation_url,
    });
  } catch (err) {
    console.error("Create-payment error:", err);
    return res.status(500).json({ message: "Payment request failed" });
  }
}
