import fs from "fs";
import path from "path";

const PROMOCODES_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "promocodes.json"
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const data = fs.readFileSync(PROMOCODES_FILE_PATH, "utf8");
      const promocodes = JSON.parse(data);
      res.status(200).json(promocodes);
    } catch (error) {
      console.error("Ошибка при чтении промокодов:", error);
      res.status(500).json({ error: "Ошибка при получении промокодов" });
    }
  } else if (req.method === "POST") {
    try {
      const newPromocode = req.body;

      // Чтение текущих промокодов
      const data = fs.readFileSync(PROMOCODES_FILE_PATH, "utf8");
      const promocodes = JSON.parse(data);

      // Добавление нового промокода
      promocodes.push(newPromocode);

      // Запись обновленных промокодов обратно в файл
      fs.writeFileSync(
        PROMOCODES_FILE_PATH,
        JSON.stringify(promocodes, null, 2),
        "utf8"
      );

      res.status(200).json({ message: "Промокод добавлен" });
    } catch (error) {
      console.error("Ошибка при добавлении промокода:", error);
      res.status(500).json({ error: "Ошибка при добавлении промокода" });
    }
  } else {
    res.status(405).json({ error: "Метод не разрешен" });
  }
}
