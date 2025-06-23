// frontend/pages/api/webhook.js

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const event = req.body;

  // Проверяем тип события
  if (event.event === "payment.succeeded") {
    const payment = event.object;
    const orderId = payment.metadata.orderId;

    // Обновляем статус заказа в Strapi
    try {
      await fetch(`http://localhost:1337/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { orderStatus: "processing" } }),
      });
      console.log(`Order ${orderId} marked as processing`);
    } catch (err) {
      console.error("Failed to update order status:", err);
      return res.status(500).end();
    }
  }

  // Обязательно вернуть 200
  res.status(200).json({ received: true });
}
