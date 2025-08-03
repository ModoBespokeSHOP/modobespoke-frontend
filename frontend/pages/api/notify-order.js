import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    cart,
    customerName,
    customerPhone,
    customerEmail,
    deliveryOffice,
    deliveryPrice,
    deliveryMethod,
    total,
  } = req.body;

  // Настройки для SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Письмо пользователю
  const mailOptionsCustomer = {
    from: process.env.SMTP_USER, // Отправитель
    to: customerEmail, // Получатель (email клиента)
    subject: "Подтверждение заказа",
    text: `Ваш заказ был успешно оформлен. \n
    Заказ: ${cart
      .map((item) => `${item.qty}x ${item.title} (${item.selectedSize})`)
      .join(", ")}\n
    Сумма: ${total}₽\n
    Адрес пункта выдачи: ${deliveryOffice}\n
    Способ доставки: ${deliveryMethod}`,
  };

  // Письмо владельцу
  const mailOptionsOwner = {
    from: process.env.SMTP_USER,
    to: process.env.OWNER_EMAIL,
    subject: `Новый заказ от ${customerName}`,
    text: `Новый заказ: \n
    Имя клиента: ${customerName}\n
    Телефон: ${customerPhone}\n
    Email: ${customerEmail}\n
    Заказ: ${cart
      .map((item) => `${item.qty}x ${item.title} (${item.selectedSize})`)
      .join(", ")}\n
    Сумма: ${total}₽\n
    Адрес пункта выдачи: ${deliveryOffice}\n
    Способ доставки: ${deliveryMethod}`,
  };

  try {
    // Отправка почты пользователю
    await transporter.sendMail(mailOptionsCustomer);
    // Отправка почты владельцу
    await transporter.sendMail(mailOptionsOwner);

    res.status(200).json({ message: "Notifications sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send notifications" });
  }
}
