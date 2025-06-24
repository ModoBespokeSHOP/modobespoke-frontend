// frontend/pages/api/products.js

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const isProd = process.env.GITHUB_TOKEN && process.env.GITHUB_REPO;
  const filePath = path.join(process.cwd(), "public", "data", "products.json");

  if (req.method === "GET") {
    try {
      let products;
      if (isProd) {
        // Fetch latest from GitHub raw
        const repo = process.env.GITHUB_REPO;
        const branch = process.env.GITHUB_BRANCH || "main";
        const url = `https://raw.githubusercontent.com/${repo}/${branch}/public/data/products.json`;
        const resp = await fetch(url);
        products = await resp.json();
      } else {
        const json = fs.readFileSync(filePath, "utf-8");
        products = JSON.parse(json);
      }
      return res.status(200).json(products);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка чтения списка товаров" });
    }
  }

  if (req.method === "POST") {
    const updated = req.body;
    if (!Array.isArray(updated)) {
      return res.status(400).json({ message: "Требуется массив товаров" });
    }

    // Local write
    if (!isProd) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
        return res.status(200).json({ message: "Товары обновлены локально" });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Ошибка записи локального файла" });
      }
    }

    // Production: commit to GitHub
    try {
      const token = process.env.GITHUB_TOKEN;
      const repo = process.env.GITHUB_REPO;
      const branch = process.env.GITHUB_BRANCH || "main";
      const apiUrl = `https://api.github.com/repos/${repo}/contents/public/data/products.json`;

      // Get current file SHA
      const getResp = await fetch(`${apiUrl}?ref=${branch}`, {
        headers: { Authorization: `token ${token}` },
      });
      const getData = await getResp.json();
      const sha = getData.sha;

      // Commit new content
      const putResp = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update products.json via admin",
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
          .json({ message: "Товары обновлены и закоммичены на GitHub" });
      } else {
        console.error("GitHub PUT error:", putData);
        return res.status(500).json({ message: "Ошибка коммита в GitHub" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка при отправке в GitHub" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
