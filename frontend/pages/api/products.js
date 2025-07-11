import fs from "node:fs";
import path from "node:path";

export default async function handler(req, res) {
  // в продакшене (NODE_ENV=production на Vercel) читаем/пишем в GitHub, иначе — локально
  const isProd =
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);

  // На Vercel у вас корневая директория — это frontend/, так что public находится прямо под cwd
  const dataFile = path.join(process.cwd(), "public", "data", "products.json");

  if (req.method === "GET") {
    try {
      let products;

      if (isProd) {
        const token = process.env.GITHUB_TOKEN;
        const repo = process.env.GITHUB_REPO; // "ModoBespokeSHOP/modobespoke-frontend"
        const branch = process.env.GITHUB_BRANCH || "main";
        // Здесь добавляем префикс frontend/ к пути
        const apiUrl = `https://api.github.com/repos/${repo}/contents/frontend/public/data/products.json?ref=${branch}`;

        const apiRes = await fetch(apiUrl, {
          headers: { Authorization: `token ${token}` },
        });
        const apiData = await apiRes.json();

        if (!apiRes.ok) {
          console.error("GitHub GET error:", apiData);
          throw new Error("Не удалось получить products.json из GitHub");
        }

        const buffer = Buffer.from(apiData.content, "base64");
        products = JSON.parse(buffer.toString("utf-8"));
      } else {
        // локальное чтение
        const raw = fs.readFileSync(dataFile, "utf-8");
        products = JSON.parse(raw);
      }

      return res.status(200).json(products);
    } catch (err) {
      console.error("GET /api/products error:", err);
      return res
        .status(500)
        .json({ message: "Ошибка при чтении списка товаров" });
    }
  }

  if (req.method === "POST") {
    const updated = req.body;
    if (!Array.isArray(updated)) {
      return res
        .status(400)
        .json({ message: "Неверный формат: ожидается массив товаров" });
    }

    if (!isProd) {
      // локально записываем в public/data
      try {
        fs.writeFileSync(dataFile, JSON.stringify(updated, null, 2), "utf-8");
        return res
          .status(200)
          .json({ message: "Товары успешно обновлены локально" });
      } catch (err) {
        console.error("POST /api/products write error:", err);
        return res
          .status(500)
          .json({ message: "Ошибка записи локального файла" });
      }
    }

    // в проде — коммитим файл в GitHub
    try {
      const token = process.env.GITHUB_TOKEN;
      const repo = process.env.GITHUB_REPO;
      const branch = process.env.GITHUB_BRANCH || "main";
      const apiUrl = `https://api.github.com/repos/${repo}/contents/frontend/public/data/products.json`;

      // 1) Получаем SHA
      const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
        headers: { Authorization: `token ${token}` },
      });
      const getData = await getRes.json();
      if (!getRes.ok) {
        console.error("GitHub GET SHA error:", getData);
        throw new Error("Не удалось получить SHA файла");
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
          message: "Update products.json via admin panel",
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
        return res
          .status(500)
          .json({ message: "Ошибка при коммите изменений в GitHub" });
      }

      return res
        .status(200)
        .json({ message: "Товары обновлены и закоммичены в GitHub" });
    } catch (err) {
      console.error("POST /api/products GitHub error:", err);
      return res
        .status(500)
        .json({ message: "Ошибка при сохранении в GitHub" });
    }
  }

  // другие методы не поддерживаются
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
