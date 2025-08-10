import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "promocodes.json");

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Чтение промокодов
      let promocodes = [];
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        promocodes = JSON.parse(fileContent);
      }
      return res.status(200).json(promocodes);
    }

    if (req.method === "POST") {
      // Сохранение промокодов (работает только локально)
      if (process.env.NODE_ENV === "production") {
        return res
          .status(405)
          .json({
            message:
              "Запись промокодов недоступна на Vercel. Обновите data/promocodes.json вручную и задеплойте проект.",
          });
      }
      const promocodes = req.body;
      if (!Array.isArray(promocodes)) {
        return res.status(400).json({ message: "Неверный формат данных" });
      }
      fs.writeFileSync(filePath, JSON.stringify(promocodes, null, 2));
      return res.status(200).json({ message: "Промокоды сохранены" });
    }

    return res.status(405).json({ message: "Метод не поддерживается" });
  } catch (error) {
    console.error("Ошибка при обработке промокодов:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
