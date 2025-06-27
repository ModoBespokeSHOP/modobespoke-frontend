import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Неверный пароль" });
  }
  // Успешно
  return res.status(200).json({ ok: true });
}
