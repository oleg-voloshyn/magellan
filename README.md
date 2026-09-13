# Travel Quest — Telegram Mini App

Планер подорожі: ◆ основна сюжетна лінія + ✦ побічні квести, з галочками, геолокацією (маршрут громадським транспортом), годинами роботи, історією місця, фото- і відео-чеклістами.

- `trip.js` — усі дані поїздки (редагується тут)
- `app.js` — логіка; галочки зберігаються в Telegram CloudStorage (синхронізація між пристроями) + localStorage
- `index.html` — розмітка і стилі (кольори беруться з теми Telegram)

## Підключити до Telegram

1. У @BotFather: `/newbot` → назва → username.
2. `/mybots` → бот → **Bot Settings → Menu Button → Configure menu button** → URL сторінки (HTTPS) → назва кнопки, напр. `Планер`.
3. (Опційно) `/newapp` — щоб мати пряме посилання `t.me/<bot>/<app>`.

## Локально

```bash
python3 -m http.server 8765
```
