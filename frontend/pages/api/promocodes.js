// /api/promocodes.js
import fs from "node:fs";
import path from "node:path";

export default async function handler(req, res) {
  // В продакшене (NODE_ENV=production на Vercel) читаем/пишем в GitHub, иначе — локально
  const isProd =
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);

  // Локальный путь к файлу (сделал consistent с products: public/data)
  const dataFile = path.join(
    process.cwd(),
    "public",
    "data",
    "promocodes.json"
  );

  if (req.method === "GET") {
    try {
      let promocodes;

      if (isProd) {
        const token = process.env.GITHUB_TOKEN;
        const repo = process.env.GITHUB_REPO; // e.g., "ModoBespokeSHOP/modobespoke-frontend"
        const branch = process.env.GITHUB_BRANCH || "main";
        // Путь в репо с префиксом frontend/
        const apiUrl = `https://api.github.com/repos/${repo}/contents/frontend/public/data/promocodes.json?ref=${branch}`;

        const apiRes = await fetch(apiUrl, {
          headers: { Authorization: `token ${token}` },
        });
        const apiData = await apiRes.json();

        if (!apiRes.ok) {
          console.error("GitHub GET error:", apiData);
          throw new Error(
            `Не удалось получить promocodes.json из GitHub: ${
              apiData.message || "Неизвестная ошибка"
            }`
          );
        }

        const buffer = Buffer.from(apiData.content, "base64");
        promocodes = JSON.parse(buffer.toString("utf-8"));
      } else {
        // Локальное чтение
        if (fs.existsSync(dataFile)) {
          const raw = fs.readFileSync(dataFile, "utf-8");
          promocodes = JSON.parse(raw);
        } else {
          promocodes = [];
        }
      }

      return res.status(200).json(promocodes);
    } catch (err) {
      console.error("GET /api/promocodes error:", err);
      return res
        .status(500)
        .json({
          message: `Ошибка при чтении списка промокодов: ${err.message}`,
        });
    }
  }

  if (req.method === "POST") {
    const updated = req.body;
    if (!Array.isArray(updated)) {
      return res
        .status(400)
        .json({ message: "Неверный формат: ожидается массив промокодов" });
    }

    if (!isProd) {
      // Локально записываем в public/data
      try {
        fs.writeFileSync(dataFile, JSON.stringify(updated, null, 2), "utf-8");
        return res
          .status(200)
          .json({ message: "Промокоды успешно обновлены локально" });
      } catch (err) {
        console.error("POST /api/promocodes write error:", err);
        return res
          .status(500)
          .json({ message: `Ошибка записи локального файла: ${err.message}` });
      }
    }

    // В проде — коммитим файл в GitHub
    try {
      const token = process.env.GITHUB_TOKEN;
      const repo = process.env.GITHUB_REPO;
      const branch = process.env.GITHUB_BRANCH || "main";
      const apiUrl = `https://api.github.com/repos/${repo}/contents/frontend/public/data/promocodes.json`;

      // 1) Получаем SHA
      const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
        headers: { Authorization: `token ${token}` },
      });
      const getData = await getRes.json();
      if (!getRes.ok) {
        console.error("GitHub GET SHA error:", getData);
        throw new Error(
          `Не удалось получить SHA файла: ${
            getData.message || "Неизвестная ошибка"
          }`
        );
      }
      const sha = getData.sha;

      // 2) Пушим PUT
      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update promocodes.json via admin panel",
          content: Buffer.from(JSON.stringify(updated, null, 2)).toString(
            "base64"
          ),
          sha,
          branch,
        }),
      });
      const putData = await putRes.json();

      if (!putRes.ok) {
        console.error("GitHub PUT error:", putData);
        throw new Error(
          `Ошибка при коммите изменений в GitHub: ${
            putData.message || "Неизвестная ошибка"
          }`
        );
      }

      return res
        .status(200)
        .json({ message: "Промокоды обновлены и закоммичены в GitHub" });
    } catch (err) {
      console.error("POST /api/promocodes GitHub error:", err);
      return res
        .status(500)
        .json({ message: `Ошибка при сохранении в GitHub: ${err.message}` });
    }
  }

  // Другие методы не поддерживаются
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
