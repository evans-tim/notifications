const { createClient } = require("redis");
const webPush = require("web-push");

const SUBSCRIPTION_KEY = "reminder:subscription";
const REMINDER_TEXT = "Eat protein and work on my cursor clone";
const VAPID_PUBLIC_KEY = "BKxVWSDwvxrUqfzGTGTh43XV52qB237XZpLH3vcIge_7JgkgSl1VBLiHc8oGWzP7YRdroPKN8pybc_y6lU4-OsQ";

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const redisUrl = process.env.KV_REDIS_URL;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:daily-reminder@example.com";

  if (!redisUrl) {
    response.status(500).json({ error: "Missing KV_REDIS_URL" });
    return;
  }

  if (!vapidPrivateKey) {
    response.status(500).json({ error: "Missing VAPID_PRIVATE_KEY" });
    return;
  }

  const redis = createClient({ url: redisUrl });
  redis.on("error", (error) => console.error(error));

  try {
    await redis.connect();
    const savedSubscription = await redis.get(SUBSCRIPTION_KEY);

    if (!savedSubscription) {
      response.status(404).json({ error: "No saved subscription" });
      return;
    }

    const subscription = JSON.parse(savedSubscription);
    webPush.setVapidDetails(vapidSubject, VAPID_PUBLIC_KEY, vapidPrivateKey);

    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Daily Reminder",
        body: REMINDER_TEXT,
      }),
    );
  } catch (error) {
    response.status(502).json({ error: "Failed to send notification", details: error.message });
    return;
  } finally {
    await redis.disconnect();
  }

  response.status(200).json({ ok: true });
};
