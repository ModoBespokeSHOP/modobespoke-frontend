// frontend/pages/api/products.js

import fs from "node:fs";
import path from "node:path";

export default async function handler(req, res) {
  // В продакшене (Vercel) используем GitHub API, локально — файловая система
  const isProd =
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);

  const dataFile = path.join(process.cwd(), "public", "data", "products.json");

  if (req.method === "GET") {
    try {
      let products;

      if (isProd) {
        // читаем свежий файл из GitHub Raw
        const repo = process.env.GITHUB_REPO;
        const branch = process.env.GITHUB_BRANCH || "main";
        const url = `https://raw.githubusercontent.com/${repo}/${branch}/public/data/products.json`;
        const resp = await fetch(url);
        products = await resp.json();
      } else {
        // локальное чтение
        const json = fs.readFileSync(dataFile, "utf-8");
        products = JSON.parse(json);
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
        .json({ message: "Неверный формат данных — ожидается массив" });
    }

    if (!isProd) {
      // локальное сохранение
      try {
        fs.writeFileSync(dataFile, JSON.stringify(updated, null, 2), "utf-8");
        return res
          .status(200)
          .json({ message: "Товары успешно обновлены локально" });
      } catch (err) {
        console.error("POST /api/products write error:", err);
        return res
          .status(500)
          .json({ message: "Ошибка записи локального файла products.json" });
      }
    }

    // продакшн: коммитим файл в GitHub
    try {
      const token = process.env.GITHUB_TOKEN;
      const repo = process.env.GITHUB_REPO;
      const branch = process.env.GITHUB_BRANCH || "main";
      const apiUrl = `https://api.github.com/repos/${repo}/contents/public/data/products.json`;

      // Получаем SHA текущего файла
      const getResp = await fetch(`${apiUrl}?ref=${branch}`, {
        headers: { Authorization: `token ${token}` },
      });
      const getData = await getResp.json();
      const sha = getData.sha;

      // Отправляем PUT-запрос с новым содержимым
      const putResp = await fetch(apiUrl, {
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
      const putData = await putResp.json();

      if (putResp.ok) {
        return res
          .status(200)
          .json({ message: "Товары обновлены и закоммичены в GitHub" });
      } else {
        console.error("GitHub PUT error:", putData);
        return res.status(500).json({ message: "Ошибка при коммите в GitHub" });
      }
    } catch (err) {
      console.error("POST /api/products GitHub error:", err);
      return res
        .status(500)
        .json({ message: "Ошибка при сохранении в GitHub" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
