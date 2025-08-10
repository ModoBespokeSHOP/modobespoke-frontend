import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "promocodes.json");

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: "Promo code is required" });
    }

    let promocodes = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      promocodes = JSON.parse(fileContent);
    }

    const promo = promocodes.find((p) => p.code === code.toUpperCase());
    if (!promo) {
      return res.status(404).json({ message: "Неверный промокод" });
    }

    return res.status(200).json({ type: promo.type, value: promo.value });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
