import fs from "fs/promises";
import path from "path";

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const fileContent = await fs.readFile(ordersFilePath, "utf-8");
    const orders = JSON.parse(fileContent);
    return res.status(200).json(orders);
  } catch (err) {
    console.error("Ошибка чтения заказов:", err);
    return res.status(500).json({ message: "Failed to load orders" });
  }
}
