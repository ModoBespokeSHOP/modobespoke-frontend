import fetch from "node-fetch";

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

  console.log("Полученные данные от клиента:", {
    cart,
    customerName,
    customerPhone,
    customerEmail,
    deliveryOffice,
    deliveryPrice,
    deliveryMethod,
  });

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

  const orderId = Date.now().toString();
  const total =
    cart.reduce((sum, item) => sum + item.price * item.qty, 0) + deliveryPrice;

  try {
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    if (!shopId || !secretKey) {
      console.error("Отсутствуют учетные данные ЮKassa:", {
        shopId,
        secretKey,
      });
      return res.status(500).json({ message: "Missing YooKassa credentials" });
    }

    const amountValue = total.toFixed(2);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    console.log("Отправка запроса ЮKassa:", {
      amount: { value: amountValue, currency: "RUB" },
      return_url: `${siteUrl}/success?orderId=${orderId}`,
    });

    const receiptItems = cart.map((item) => ({
      description: `${item.title} (${item.selectedSize})`,
      quantity: item.qty,
      amount: { value: (item.price * item.qty).toFixed(2), currency: "RUB" },
      vat_code: 1, // НДС 20% (по умолчанию), уточните ваш тариф
      payment_method: "full_payment",
      payment_object: "commodity",
    }));

    // Добавляем доставку как отдельный элемент чека
    if (deliveryPrice > 0) {
      receiptItems.push({
        description: `Доставка (${deliveryMethod})`,
        quantity: 1,
        amount: { value: deliveryPrice.toFixed(2), currency: "RUB" },
        vat_code: 1,
        payment_method: "full_payment",
        payment_object: "service",
      });
    }

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString(
          "base64"
        )}`,
        "Idempotence-Key": `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}`,
      },
      body: JSON.stringify({
        amount: { value: amountValue, currency: "RUB" },
        confirmation: {
          type: "redirect",
          return_url: `${siteUrl}/success?orderId=${orderId}`,
        },
        capture: true,
        description: `Заказ от ${customerName}`,
        receipt: {
          items: receiptItems,
          tax_system_id: 1, // ОСН (Общая система налогообложения), уточните ваш тариф
          customer: {
            email: customerEmail,
            phone: customerPhone,
          },
        },
      }),
    });

    const data = await response.json();
    console.log("Ответ от ЮKassa:", { status: response.status, data });

    if (!response.ok) {
      console.error("Ошибка от ЮKassa:", data);
      return res
        .status(response.status)
        .json({ message: data.description || "Payment creation failed" });
    }

    return res.status(200).json({
      confirmation_url: data.confirmation.confirmation_url,
      payment_id: data.id,
    });
  } catch (err) {
    console.error("Общая ошибка в /api/create-payment:", {
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ message: "Failed to create payment" });
  }
}
