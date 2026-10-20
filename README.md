# dota2-video-studio

**Идея → Grok (раскадровка + кадры в стиле Dota 2) → локальный рендер → готовый mp4**

Работает через официальный **Grok Build** в терминале.

## Как пользоваться

1. Установи Grok Build (один раз):

   **Windows (PowerShell):**
   ```powershell
   irm https://x.ai/cli/install.ps1 | iex
   ```

   **macOS / Linux:**
   ```bash
   curl -fsSL https://x.ai/cli/install.sh | bash
   ```

2. Дважды кликни по ярлыку:
   - **Windows:** `Start-Grok.bat`
   - **macOS / Linux:** `start-grok.sh`

3. При первом запуске откроется браузер — залогинься под своим аккаунтом.

4. Grok спросит: **«Какую идею для ролика хочешь?»**  
   Напиши кратко.

5. Дальше он сам:
   - напишет раскадровку
   - сгенерирует все кадры в стиле Dota 2
   - запустит рендер

Готовое видео появится в папке `out/`.

## Требования

- Node.js ≥ 18
- ffmpeg в PATH
- Grok Build (`grok` в терминале)
- Аккаунт xAI / Grok (SuperGrok для генерации картинок)

## Структура

- `.grok/skills/dota2-video/` — скилл, который Grok подхватывает автоматически
- `AGENTS.md` — правила проекта
- `episodes/` — эпизоды (story.json + кадры)
- `out/` — готовые видео
- `render.mjs` — локальный рендерер

## Опционально: озвучка

Положи OpenRouter-ключ в `.env` в корне проекта:

```env
OPENROUTER_API_KEY=sk-or-v1-...
```

Тогда в видео будет голос (Fish Audio free tier). Без ключа видео будет без звука.
