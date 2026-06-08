module.exports = async function (context, req) {
  const LOGIC_APP_URL = process.env.LOGIC_APP_URL;
  const API_KEY       = process.env.API_KEY;

  if (!LOGIC_APP_URL || !API_KEY) {
    context.res = { status: 500, body: "Brak konfiguracji serwera" };
    return;
  }

  try {
    const response = await fetch(LOGIC_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    context.res = { status: response.status, body: text };
  } catch (err) {
    context.res = { status: 500, body: err.message };
  }
};