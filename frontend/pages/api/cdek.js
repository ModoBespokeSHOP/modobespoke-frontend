import fetch from "node-fetch"; // Убедитесь, что пакет node-fetch установлен

export default async function handler(req, res) {
  const { action, ...queryParams } = req.query; // Параметры из URL
  const body = req.body; // Тело запроса (для POST)

  // Логируем тело запроса для диагностики
  console.log("Received request:", {
    method: req.method,
    query: req.query,
    body: JSON.stringify(body, null, 2),
  });

  // Определяем действие: если action отсутствует в query, для POST предполагаем calculate
  const determinedAction =
    action || (req.method === "POST" ? "calculate" : null);

  // Проверка наличия действия
  if (!determinedAction) {
    console.error("Missing action parameter in request");
    return res.status(400).json({ message: "Action is required" });
  }

  // Базовые настройки из переменных окружения
  const baseUrl = process.env.CDEK_API_URL || "https://api.cdek.ru/v2";
  const account = process.env.CDEK_ACCOUNT; // Логин (client_id)
  const securePassword = process.env.CDEK_SECURE_PASSWORD; // Пароль (client_secret)

  // Проверка переменных окружения
  if (!account || !securePassword) {
    console.error("CDEK credentials missing in environment variables");
    return res.status(500).json({ message: "CDEK credentials not configured" });
  }

  // Получение токена аутентификации
  const authResponse = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: account,
      client_secret: securePassword,
    }),
  });

  const authData = await authResponse.json();
  if (!authData.access_token) {
    console.error(
      "Failed to obtain CDEK API token:",
      JSON.stringify(authData, null, 2)
    );
    return res
      .status(401)
      .json({
        message: "Server not authorized to CDEK API",
        details: authData,
      });
  }
  const authToken = authData.access_token;

  // Обработка действий
  let result;
  switch (determinedAction) {
    case "offices":
      result = await getOffices(baseUrl, authToken, queryParams);
      break;
    case "calculate":
      result = await calculate(baseUrl, authToken, body);
      break;
    default:
      console.error("Unknown action:", determinedAction);
      return res.status(400).json({ message: "Unknown action" });
  }

  // Отправка ответа
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Service-Version", "3.11.1");
  res.status(200).json(result);
}

// Функция для получения списка ПВЗ
async function getOffices(baseUrl, authToken, queryParams) {
  const url = new URL(`${baseUrl}/deliverypoints`);
  Object.keys(queryParams).forEach((key) =>
    url.searchParams.append(key, queryParams[key])
  );

  console.log("Fetching offices from:", url.toString());

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
      "X-App-Name": "widget_pvz",
      "X-App-Version": "3.11.1",
    },
  });

  const result = await response.json();
  console.log("Offices response:", JSON.stringify(result, null, 2));
  return result;
}

// Функция для расчета тарифов
async function calculate(baseUrl, authToken, body) {
  console.log("Request body to CDEK API:", JSON.stringify(body, null, 2));

  // Модифицируем тело запроса для соответствия API СДЭК
  const modifiedBody = {
    from_location: {
      code: Number(body.from_location?.code) || 270, // Кострома
    },
    to_location: {
      code: Number(body.to_location?.code), // Код ПВЗ (например, MSK223)
    },
    packages: body.packages || [
      {
        weight: 250, // 0.25 кг в граммах (реальный заказ)
        length: 25, // Длина в см
        width: 7, // Ширина в см
        height: 25, // Высота в см
      },
    ],
    tariff_codes: ["137"], // Только "Посылка склад-склад"
  };

  // Проверяем обязательные поля
  if (!modifiedBody.to_location.code) {
    console.error("Missing or invalid to_location.code in request body");
    return { error: "Missing or invalid to_location.code", status: 400 };
  }

  if (!modifiedBody.from_location.code) {
    console.error("Missing or invalid from_location.code in request body");
    return { error: "Missing or invalid from_location.code", status: 400 };
  }

  // Проверяем параметры посылки
  const packageData = modifiedBody.packages[0];
  if (
    !packageData.weight ||
    packageData.weight <= 0 ||
    !packageData.length ||
    packageData.length <= 0 ||
    !packageData.width ||
    packageData.width <= 0 ||
    !packageData.height ||
    packageData.height <= 0
  ) {
    console.error("Invalid package parameters:", packageData);
    return { error: "Invalid package parameters", status: 400 };
  }

  console.log(
    "Modified body to CDEK API:",
    JSON.stringify(modifiedBody, null, 2)
  );

  const response = await fetch(`${baseUrl}/calculator/tarifflist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
      "X-App-Name": "widget_pvz",
      "X-App-Version": "3.11.1",
    },
    body: JSON.stringify(modifiedBody),
  });

  const result = await response.json();
  console.log("CDEK API response:", JSON.stringify(result, null, 2));

  if (!response.ok) {
    console.error(
      "CDEK API error:",
      JSON.stringify(result.errors || result, null, 2)
    );
    return { error: result.errors || result, status: response.status };
  }

  return result;
}
