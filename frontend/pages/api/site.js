// frontend/pages/api/site.js
import fs from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "public", "data", "site.json");

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const json = await fs.promises.readFile(dataFile, "utf-8");
      const data = JSON.parse(json);
      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Не удалось прочитать site.json" });
    }
  }

  if (req.method === "POST") {
    const { videoUrl } = req.body;
    if (typeof videoUrl !== "string") {
      return res.status(400).json({ message: "Неправильный формат данных" });
    }
    try {
      await fs.promises.writeFile(
        dataFile,
        JSON.stringify({ videoUrl }, null, 2)
      );
      return res.status(200).json({ message: "Настройки сохранены" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Не удалось записать site.json" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
