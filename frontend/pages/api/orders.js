import fs from "fs/promises";
import path from "path";

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const updatedOrders = req.body;

  try {
    await fs.writeFile(ordersFilePath, JSON.stringify(updatedOrders, null, 2));
    console.log("Список заказов обновлён");
    return res.status(200).json({ message: "Orders updated" });
  } catch (err) {
    console.error("Ошибка сохранения заказов:", err);
    return res.status(500).json({ message: "Failed to update orders" });
  }
}
