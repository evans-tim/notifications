# Minimum Viable POC Plan

Goal: make a tiny iPhone-installable PWA that sends this reminder every day at 7pm Eastern:

> Eat protein and work on my cursor clone

## Hello Worlds

1. Hello static page
   - Create the smallest possible web page with the reminder text and one button: `Enable reminder`.
   - Deploy it over HTTPS on Vercel.
   - Status: deployed successfully to Vercel.

2. Hello installable PWA
   - Add `manifest.webmanifest`.
   - Add a basic app name, icon, start URL, display mode, and theme color.
   - Confirm Safari can add it to the iPhone home screen.
   - Status: installed successfully on iPhone, with the PNG displaying as the home screen icon.

3. Hello service worker
   - Add `sw.js`.
   - Register it from the page.
   - Confirm the service worker installs successfully.
   - Status: `sw.js` is activated and running in DevTools.

4. Hello notification permission
   - On button click, call `Notification.requestPermission()`.
   - Show the result on the page so the POC is debuggable.
   - Status: permission request returned `granted`.

5. Hello push subscription
   - Generate VAPID keys for Web Push.
   - Use the public VAPID key in the client.
   - Call `registration.pushManager.subscribe()`.
   - Print the subscription JSON on the page first.
   status: {
  "endpoint": "https://web.push.apple.com/QBdoIsW8hOwMR4jY3aDVN0PAbStxs_RX7UzyQ61gxVRVKKo1o6C-qags3rkinE9Rvy_NbFcNNHTxffyyWfnu7wpEs7mEVskkhmUeJmBBsif23I-3WEDzLc1mKtTbQ2_vipI3zp0wQCGEY1lGN_llm4OUvTS9lRVVveWVHHzzamk",
  "keys": {
    "p256dh": "BPrbXIPUPj8Wl1N2B9nbo8gpxFPT1F3vwx5yXcdA64bsolQlCLWrqw3d2xfVJSat-DpZB1lP8BTydhhmbgosMg0",
    "auth": "fnRvn48zBQ_KlChHmut9Jg"
  }
}

6. Hello save subscription
   - Add a Vercel API route like `/api/subscribe`.
   - POST the subscription JSON to it.
   - Store one subscription in the simplest durable store available, such as Vercel KV, Postgres, or Supabase.
   - Status: saved successfully to Vercel Redis via `KV_REDIS_URL`.

7. Hello manual push
   - Add a Vercel API route like `/api/send`.
   - Load the saved subscription.
   - Send one Web Push notification with the reminder text.
   - Confirm the installed iPhone PWA receives it while closed.

8. Hello push handler
   - In `sw.js`, listen for the `push` event.
   - Call `self.registration.showNotification()` with the reminder text.
   - Keep the notification payload minimal.

9. Hello cron
   - Add `vercel.json` with a cron that calls `/api/send`.
   - Because Vercel cron is UTC, either schedule `0 23 * * *` during Eastern daylight time and `0 0 * * *` during Eastern standard time, or run hourly and have `/api/send` only send when the current time is 7pm in `America/New_York`.

10. Hello minimum viable reminder
   - Keep one installed device subscription.
   - Send exactly one notification per qualifying 7pm Eastern run.
   - Avoid accounts, settings, multiple reminders, custom UI, or extra styling until the POC works.

## Simplest Stack

- Vercel static hosting for the PWA.
- Vercel Functions for `/api/subscribe` and `/api/send`.
- Vercel Cron for the daily trigger.
- One durable store for the push subscription.
- `web-push` on the server for sending notifications.

## Success Criteria

- The app can be installed on an iPhone home screen.
- Tapping `Enable reminder` grants notification permission and saves a push subscription.
- Manually calling `/api/send` sends the reminder to the iPhone.
- Vercel Cron triggers the same send flow at 7pm Eastern.
