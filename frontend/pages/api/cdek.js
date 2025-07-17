// pages/api/cdek.js
import fetch from "node-fetch";

// Получение access_token из CDEK
let cachedToken = null;
let tokenExpires = 0;
async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpires) {
    return cachedToken;
  }
  const res = await fetch("https://api.edu.cdek.ru/v2/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.CDEK_CLIENT_ID,
      client_secret: process.env.CDEK_CLIENT_SECRET,
    }),
  });
  const json = await res.json();
  cachedToken = json.access_token;
  tokenExpires = now + (json.expires_in - 60) * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  const token = await getToken();
  // Определяем action: getList, offices, calculate
  const { action, ...params } = req.body || req.query;
  let apiUrl = "";
  let options = {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  };

  switch (action) {
    case "getList":
      apiUrl = `https://api.edu.cdek.ru/v2/location/cities?name=${encodeURIComponent(
        params.city_name
      )}`;
      break;
    case "offices":
      apiUrl = `https://api.edu.cdek.ru/v2/location/offices?city_code=${params.city_code}`;
      break;
    case "calculate":
      apiUrl = "https://api.edu.cdek.ru/v2/orders/calculate";
      options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tariff_code: params.tariff_code,
          sender_city_id: params.sender_city_id || 44, // ваш код отправки
          receiver_city_id: params.receiver_city_id,
          packages: [
            { weight: +params.weight, length: 10, width: 10, height: 10 },
          ],
        }),
      };
      break;
    default:
      return res.status(400).json({ error: "Не указан action" });
  }

  const apiRes = await fetch(apiUrl, options);
  const data = await apiRes.json();

  // Проксируем заголовки пагинации (если нужны)
  if (apiRes.headers.get("X-Total-Elements")) {
    res.setHeader("X-Total-Elements", apiRes.headers.get("X-Total-Elements"));
    res.setHeader("X-Current-Page", apiRes.headers.get("X-Current-Page"));
  }

  res.status(apiRes.status).json(data);
}
