import fetch from "node-fetch";

export default async function handler(req, res) {
  const { action, ...queryParams } = req.query;
  const body = req.body;

  console.log("Получен запрос:", { action, queryParams, body });
  console.log("Полученные параметры запроса:", req.body);
  console.log("Параметры query:", req.query);
  if (!action) {
    console.error("Ошибка: action отсутствует");
    return res.status(400).json({ message: "Action is required" });
  }

  const baseUrl = process.env.CDEK_API_URL || "https://api.edu.cdek.ru/v2";
  const account = process.env.CDEK_ACCOUNT;
  const securePassword = process.env.CDEK_SECURE_PASSWORD;

  if (!account || !securePassword) {
    console.error("Ошибка: отсутствуют CDEK_ACCOUNT или CDEK_SECURE_PASSWORD");
    return res.status(500).json({ message: "CDEK credentials missing" });
  }

  try {
    // Получение токена аутентификации
    console.log("Запрос токена CDEK...");
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
    console.log("Ответ токена:", authData);

    if (!authResponse.ok || !authData.access_token) {
      console.error("Ошибка получения токена:", authData);
      return res
        .status(401)
        .json({ message: "Failed to get CDEK token", error: authData });
    }
    const authToken = authData.access_token;

    // Обработка действий
    let result;
    switch (action) {
      case "offices":
        console.log("Запрос ПВЗ:", queryParams);
        result = await getOffices(baseUrl, authToken, queryParams);
        break;
      case "calculate":
        console.log("Запрос расчёта:", body);
        result = await calculate(baseUrl, authToken, body);
        break;
      default:
        console.error("Ошибка: неизвестное действие", action);
        return res.status(400).json({ message: "Unknown action" });
    }

    console.log("Ответ API:", result);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("X-Service-Version", "3.11.1");
    res.status(200).json(result);
  } catch (error) {
    console.error("Ошибка в API-роуте:", error.message, error.stack);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

async function getOffices(baseUrl, authToken, queryParams) {
  const url = new URL(`${baseUrl}/deliverypoints`);
  Object.keys(queryParams).forEach((key) =>
    url.searchParams.append(key, queryParams[key])
  );

  console.log("Отправка запроса ПВЗ:", url.toString());
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
      "X-App-Name": "widget_pvz",
      "X-App-Version": "3.11.1",
    },
  });

  const data = await response.json();
  console.log("Ответ ПВЗ:", data);
  if (!response.ok) {
    console.error("Ошибка ответа ПВЗ:", data);
    throw new Error(`CDEK API error: ${data.message || "Unknown error"}`);
  }
  return data;
}

async function calculate(baseUrl, authToken, body) {
  console.log("Отправка запроса расчёта:", body);
  const response = await fetch(`${baseUrl}/calculator/tarifflist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
      "X-App-Name": "widget_pvz",
      "X-App-Version": "3.11.1",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log("Ответ расчёта:", data);
  if (!response.ok) {
    console.error("Ошибка ответа расчёта:", data);
    throw new Error(`CDEK API error: ${data.message || "Unknown error"}`);
  }
  return data;
}
