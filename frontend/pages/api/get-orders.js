import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { rows } = await sql`SELECT * FROM orders`;
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Ошибка при загрузке заказов:", err);
    return res.status(500).json({ error: "Не удалось загрузить заказы" });
  }
}
