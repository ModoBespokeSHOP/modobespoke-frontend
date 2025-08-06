const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

// Замени на свой токен от @BotFather
const BOT_TOKEN = "8344483874:AAFC5fn5m7FrQVtTMcMsfhu3-8hurBBsMRw";
// Замени на свой Telegram chat_id
const SELLER_CHAT_ID = "968299888";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const orderId = match[1];

  try {
    const response = await fetch(
      `https://your-website.com/api/store-order?id=${orderId}`
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
    bot.sendMessage(chatId, "Ошибка при получении данных заказа.");
  }
});

bot.onText(/\/reply_(\d+) (.+)/, (msg, match) => {
  const targetChatId = match[1];
  const message = match[2];
  bot.sendMessage(targetChatId, message);
});

console.log("Бот запущен!");
