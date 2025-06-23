export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { orderId, amount, description } = req.body;

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

  try {
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Idempotence-Key": `${orderId}-${Date.now()}`, // уникальный ключ для повторных запросов
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency: "RUB",
        },
        confirmation: {
          type: "redirect",
          return_url: `http://localhost:3000/order/${orderId}`,
        },
        capture: true,
        description,
        metadata: {
          orderId,
        },
      }),
    });

    const payment = await response.json();

    if (!response.ok) {
      console.error("YooKassa error:", payment);
      return res.status(response.status).json(payment);
    }

    res
      .status(200)
      .json({ confirmation_url: payment.confirmation.confirmation_url });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Ошибка создания платежа" });
  }
}
