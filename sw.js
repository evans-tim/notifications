self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const payload = event.data?.json() || {};
  const title = payload.title || "Daily Reminder";
  const body = payload.body || "Eat protein and work on my cursor clone";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
    }),
  );
});
