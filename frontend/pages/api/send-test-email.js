import { MailtrapClient } from "mailtrap";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const TOKEN = process.env.MAILTRAP_API_TOKEN;

  const client = new MailtrapClient({
    token: TOKEN,
  });

  const sender = {
    email: "hello@demomailtrap.co", // Почта отправителя
    name: "Mailtrap Test",
  };

  const recipients = [
    {
      email: email, // Почта получателя
    },
  ];

  try {
    // Отправка письма
    await client.send({
      from: sender,
      to: recipients,
      subject: "Тестовое письмо от Mailtrap API",
      text: "Это тестовое письмо, отправленное через Mailtrap API!",
      category: "Integration Test",
    });

    res.status(200).json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Failed to send test email", error: error.message });
  }
}
