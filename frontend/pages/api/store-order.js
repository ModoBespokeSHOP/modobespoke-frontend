let orders = {};

export default function handler(req, res) {
  if (req.method === "POST") {
    const orderId = Date.now().toString(); // Простой уникальный ID
    orders[orderId] = req.body;
    res.status(200).json({ orderId });
  } else if (req.method === "GET") {
    const orderId = req.query.id;
    const order = orders[orderId];
    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
