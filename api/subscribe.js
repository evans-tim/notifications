const { createClient } = require("redis");

const SUBSCRIPTION_KEY = "reminder:subscription";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const subscription = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    response.status(400).json({ error: "Invalid subscription" });
    return;
  }

  const redisUrl = process.env.KV_REDIS_URL;
  if (!redisUrl) {
    response.status(500).json({ error: "Missing KV_REDIS_URL" });
    return;
  }

  const redis = createClient({ url: redisUrl });
  redis.on("error", (error) => console.error(error));

  try {
    await redis.connect();
    await redis.set(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  } catch (error) {
    response.status(502).json({ error: "Failed to save subscription", details: error.message });
    return;
  } finally {
    await redis.disconnect();
  }

  response.status(200).json({ ok: true });
};
