const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

const BOT_TOKEN = "8344483874:AAFC5fn5m7FrQVtTMcMsfhu3-8hurBBsMRw";
const SELLER_CHAT_ID = "968299888";
const bot = new TelegramBot(BOT_TOKEN);

// Обработчик для Vercel Serverless Functions
export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      await bot.processUpdate(req.body);
      res.status(200).json({ ok: true });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e) {
    console.error("Ошибка:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const orderId = match[1];

  try {
    const response = await fetch(
      `https://modobespoke.shop/api/store-order?id=${orderId}`
    );
    if (response.ok) {
      const orderData = await response.json();
      const message = `
        Ваш заказ:
        ${orderData.cart
          .map(
            (item) =>
              `${item.qty} × ${item.title} (${item.selectedSize}) - ${
                item.price * item.qty
              }₽`
          )
          .join("\n")}
        ФИО: ${orderData.customerName}
        Телефон: ${orderData.customerPhone}
        Email: ${orderData.customerEmail}
        ПВЗ: ${orderData.deliveryOffice}
        Стоимость доставки: ${orderData.deliveryPrice}₽
        Ожидайте подтверждения от продавца!
      `;
      bot.sendMessage(chatId, message);
      bot.sendMessage(
        SELLER_CHAT_ID,
        `
        Новый заказ от ${orderData.customerName}:
        ${message}
        Ответить: /reply_${chatId}
      `
      );
    } else {
      bot.sendMessage(
        chatId,
        "Не удалось найти данные заказа. Пожалуйста, попробуйте снова."
      );
    }
  } catch (e) {
    console.error("Ошибка при получении данных заказа:", e);
    bot.sendMessage(chatId, "Ошибка при получении данных заказа.");
  }
});

bot.onText(/\/reply_(\d+) (.+)/, (msg, match) => {
  const targetChatId = match[1];
  const message = match[2];
  bot.sendMessage(targetChatId, message);
});

// Установка вебхука (выполняется один раз при деплое)
const VERCEL_URL = process.env.VERCEL_URL || "https://<your-vercel-bot-domain>";
bot.setWebHook(`${VERCEL_URL}/api/bot`);
