# dota2-video-studio

**Идея → Grok пишет story.json → локальный движок рисует кадры кодом → готовый mp4**

Стиль: тёмное фэнтези в духе Dota 2.  
Отрисовка: та же кодовая система, что в [tvhead-studio](https://github.com/Vladic20/tvhead-studio) (SVG-персонажи из деталей, анимации, переходы).

## Как пользоваться

1. Установи Grok Build (один раз):

   **Windows (PowerShell):**
   ```powershell
   irm https://x.ai/cli/install.ps1 | iex
   ```

2. Дважды кликни `Start-Grok.bat`.

3. При первом запуске залогинься (если регион блокирует — через VPN).

4. Grok спросит идею. Напиши кратко.

5. Он сам напишет `story.json` с `"look": "dota"` и запустит рендер.

Готовое видео появится в `out/`.

## Требования

- Node.js ≥ 18
- ffmpeg
- Google Chrome (или Chromium) для рендера кадров
- Grok Build

## Озвучка

Положи OpenRouter-ключ в `.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-...
```

Без ключа видео будет без голоса.

## Команды вручную

```bash
node make.mjs example --stills auto   # проверить кадры
node make.mjs example                 # полный рендер
node make.mjs example --preview       # быстрый черновик
```
