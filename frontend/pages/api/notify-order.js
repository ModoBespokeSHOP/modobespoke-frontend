// pages/api/notify-order.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    cart,
    customerName,
    customerPhone,
    customerEmail,
    selectedCity,
    selectedOffice,
    deliveryPrice,
  } = req.body;

  // Валидация
  if (
    !Array.isArray(cart) ||
    cart.length === 0 ||
    !customerName ||
    !selectedCity ||
    !selectedOffice
  ) {
    return res.status(400).json({ message: "Missing data" });
  }

  // Формируем тело письма
  const itemsList = cart
    .map(
      (i) => `• ${i.title} (${i.selectedSize}) ×${i.qty} — ${i.price * i.qty}₽`
    )
    .join("\n");

  const mailBody = `
Новый заказ от ${customerName}
Телефон: ${customerPhone}
E‑mail: ${customerEmail}

Товары:
${itemsList}

Город: ${selectedCity.name}
Пункт выдачи: ${selectedOffice.name}, ${selectedOffice.address}
Стоимость доставки: ${deliveryPrice}₽
  `;

  // Отправка письма
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Магазин" <${process.env.SMTP_USER}>`,
    to: process.env.SHOP_OWNER_EMAIL,
    subject: `Новый заказ от ${customerName}`,
    text: mailBody,
  });

  res.status(200).json({ message: "Order notified" });
}
