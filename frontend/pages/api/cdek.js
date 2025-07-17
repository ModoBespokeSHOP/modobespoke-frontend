export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Метод не разрешён" });
  }

  try {
    const { cityTo, tariff_code = 137 } = req.body;

    const tokenResponse = await fetch(
      "https://api.cdek.ru/v2/oauth/token?parameters",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: process.env.CDEK_CLIENT_ID,
          client_secret: process.env.CDEK_CLIENT_SECRET,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res
        .status(500)
        .json({ error: "Не удалось получить токен авторизации" });
    }

    const deliveryResponse = await fetch(
      "https://api.cdek.ru/v2/calculator/tariff",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        body: JSON.stringify({
          tariff_code: tariff_code,
          from_location: { code: 137 }, // Москва
          to_location: { code: cityTo },
          packages: [
            {
              weight: 500,
              length: 10,
              width: 10,
              height: 10,
            },
          ],
        }),
      }
    );

    const deliveryData = await deliveryResponse.json();

    if (deliveryData.errors) {
      return res.status(400).json({ error: deliveryData.errors });
    }

    res.status(200).json(deliveryData);
  } catch (error) {
    console.error("Ошибка при расчёте доставки:", error);
    res.status(500).json({ error: "Ошибка сервера при обращении к CDEK API" });
  }
}
