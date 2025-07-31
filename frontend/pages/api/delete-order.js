import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Missing order ID" });
  }

  try {
    await sql`DELETE FROM orders WHERE id = ${id}`;
    return res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    console.error("Ошибка при удалении заказа:", err);
    return res.status(500).json({ message: "Failed to delete order" });
  }
}
