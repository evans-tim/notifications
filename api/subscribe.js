const SUBSCRIPTION_KEY = "reminder:subscription";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const subscription = request.body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    response.status(400).json({ error: "Invalid subscription" });
    return;
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) {
    response.status(500).json({ error: "Missing KV_REST_API_URL or KV_REST_API_TOKEN" });
    return;
  }

  const saveResponse = await fetch(kvUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SET", SUBSCRIPTION_KEY, JSON.stringify(subscription)]),
  });

  if (!saveResponse.ok) {
    response.status(502).json({ error: "Failed to save subscription" });
    return;
  }

  response.status(200).json({ ok: true });
};
