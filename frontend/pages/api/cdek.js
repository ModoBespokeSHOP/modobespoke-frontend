import fetch from "node-fetch";

export default async function handler(req, res) {
  const { action, ...queryParams } = req.query;
  const body = req.body;

  console.log("Received request:", {
    method: req.method,
    query: req.query,
    body: JSON.stringify(body, null, 2),
  });

  const determinedAction =
    action || (req.method === "POST" ? "calculate" : null);

  if (!determinedAction) {
    console.error("Missing action parameter in request");
    return res.status(400).json({ message: "Action is required" });
  }

  const baseUrl = process.env.CDEK_API_URL || "https://api.cdek.ru/v2";
  const account = process.env.CDEK_ACCOUNT;
  const securePassword = process.env.CDEK_SECURE_PASSWORD;

  if (!account || !securePassword) {
    console.error("CDEK credentials missing in environment variables");
    return res.status(500).json({ message: "CDEK credentials not configured" });
  }

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

  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Service-Version", "3.11.1");
  res.status(200).json(result);
}

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

async function calculate(baseUrl, authToken, body) {
  console.log("Request body to CDEK API:", JSON.stringify(body, null, 2));

  const modifiedBody = {
    from_location: {
      code: Number(body.from_location?.code) || 270, // Кострома
    },
    to_location: {
      code: Number(body.to_location?.code),
    },
    packages: body.packages || [
      {
        weight: 250, // 0.25 кг в граммах
        length: 25,
        width: 7,
        height: 25,
      },
    ],
    tariff_codes: ["137"],
  };

  console.log("to_location.code:", modifiedBody.to_location.code); // Добавлено для диагностики

  if (!modifiedBody.to_location.code) {
    console.error("Missing or invalid to_location.code in request body");
    return { error: "Missing or invalid to_location.code", status: 400 };
  }

  if (!modifiedBody.from_location.code) {
    console.error("Missing or invalid from_location.code in request body");
    return { error: "Missing or invalid from_location.code", status: 400 };
  }

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

  const tariff = result.tariffs?.find((t) => t.tariff_code === "137");
  if (tariff) {
    console.log("Cost for tariff 137 (Посылка склад-склад):", {
      cost: tariff.total_amount,
      currency: tariff.currency,
      delivery_period: `${tariff.period_min}-${tariff.period_max} days`,
    });
  } else {
    console.log("Tariff 137 not found in response");
  }

  return result;
}
