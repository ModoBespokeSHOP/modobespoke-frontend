import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

const tempOrdersFilePath = path.join(process.cwd(), "data", "temp-orders.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.error("Неподдерживаемый метод:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    cart,
    customerName,
    customerPhone,
    customerEmail,
    deliveryOffice,
    deliveryPrice,
    deliveryMethod,
  } = req.body;
  console.log(
    "Полученные данные в /api/create-payment:",
    JSON.stringify(req.body, null, 2)
  );

  if (
    !Array.isArray(cart) ||
    cart.length === 0 ||
    !customerName ||
    !customerPhone ||
    !customerEmail ||
    !deliveryOffice ||
    !deliveryMethod
  ) {
    console.error("Ошибка валидации данных:", {
      cart: Array.isArray(cart) && cart.length > 0,
      customerName: !!customerName,
      customerPhone: !!customerPhone,
      customerEmail: !!customerEmail,
      deliveryOffice: !!deliveryOffice,
      deliveryMethod: !!deliveryMethod,
    });
    return res.status(400).json({ message: "Missing required fields" });
  }

  const totalCents = cart.reduce(
    (sum, item) => sum + item.price * item.qty * 100,
    0
  );
  const deliveryCents = Number.isFinite(deliveryPrice)
    ? deliveryPrice * 100
    : 0;
  const finalTotalCents = totalCents + deliveryCents;
  const amountValue = (finalTotalCents / 100).toFixed(2);

  const receiptItems = [
    ...cart.map((item) => ({
      description: `${item.title} (${item.selectedSize})`.slice(0, 64),
      quantity: item.qty,
      amount: {
        value: item.price.toFixed(2),
        currency: "RUB",
      },
      vat_code: 1,
      payment_mode: "full_payment",
      payment_subject: "commodity",
    })),
    ...(deliveryPrice > 0
      ? [
          {
            description: `Доставка СДЭК (${deliveryMethod})`.slice(0, 64),
            quantity: 1,
            amount: {
              value: deliveryPrice.toFixed(2),
              currency: "RUB",
            },
            vat_code: 1,
            payment_mode: "full_payment",
            payment_subject: "service",
          },
        ]
      : []),
  ];

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    console.error("Отсутствуют учетные данные ЮKassa:", { shopId, secretKey });
    return res.status(500).json({ message: "Missing YooKassa credentials" });
  }

  const truncatedCustomerName = customerName.slice(0, 64);
  const paymentDescription = `Заказ от ${truncatedCustomerName}`;
  const orderId = Date.now();

  try {
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString(
          "base64"
        )}`,
        "Idempotence-Key": `${orderId}-${Math.random()
          .toString(36)
          .substring(2)}`,
      },
      body: JSON.stringify({
        amount: { value: amountValue, currency: "RUB" },
        confirmation: {
          type: "redirect",
          return_url: `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/success?orderId=${orderId}`,
        },
        capture: true,
        description: paymentDescription,
        receipt: {
          customer: {
            email: customerEmail,
            phone: customerPhone.replace(/[^0-9]/g, ""),
          },
          items: receiptItems,
        },
        metadata: {
          orderId,
        },
      }),
    });

    const data = await response.json();
    console.log("Ответ от ЮKassa:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Ошибка ЮKassa:", data);
      return res.status(response.status).json({
        message:
          data.description || data.message || "Ошибка при создании платежа",
      });
    }

    // Сохраняем временный заказ с payment_id
    const tempOrder = {
      id: orderId,
      date: new Date().toISOString(),
      customerName,
      customerPhone,
      customerEmail,
      cart,
      deliveryOffice,
      deliveryPrice,
      deliveryMethod,
      total:
        cart.reduce((sum, item) => sum + item.price * item.qty, 0) +
        deliveryPrice,
      metadata: {
        paymentId: data.id,
      },
    };

    try {
      let tempOrders = [];
      try {
        const fileContent = await fs.readFile(tempOrdersFilePath, "utf-8");
        tempOrders = JSON.parse(fileContent);
        if (!Array.isArray(tempOrders)) tempOrders = [];
      } catch (err) {
        console.log("Файл temp-orders.json не существует, будет создан новый");
      }
      tempOrders.push(tempOrder);
      await fs.writeFile(
        tempOrdersFilePath,
        JSON.stringify(tempOrders, null, 2)
      );
      console.log("Временный заказ сохранён:", tempOrder);
    } catch (err) {
      console.error("Ошибка сохранения временного заказа:", err);
      return res
        .status(500)
        .json({ message: "Failed to save temporary order" });
    }

    return res.status(200).json({
      confirmation_url: data.confirmation.confirmation_url,
      payment_id: data.id,
    });
  } catch (err) {
    console.error("Ошибка в запросе к ЮKassa:", {
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ message: "Payment request failed" });
  }
}
