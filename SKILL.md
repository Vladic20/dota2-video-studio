---
name: dota2-video
description: Turns a human idea into a finished narrated video in official Dota 2 painterly style. Grok creates the storyboard (scenes + detailed image prompts) and generates the frames. The local PC renderer (render.mjs + ffmpeg) assembles them into an mp4 with optional free Fish Audio narration. Use when the user wants a Dota 2 style explainer, cinematic, story video, or says "сделай ролик в стиле доты", "dota video", "раскадровка grok".
---

# dota2-video

**Human idea → Grok storyboard + Dota 2 frames → local render → mp4**

You (Grok) do the creative work. The user's machine does the final assembly.

## Workflow

1. **Human gives the idea** (topic, angle, length, language preference).

2. **You create the story** in `episodes/<slug>/story.json`:
   - 4–8 scenes for a 30–60 s video
   - Each scene has:
     - `note` — short description of the picture
     - `say` — narration as `{ "en": "...", "ru": "..." }` (or single language)
     - `prompt` — detailed image generation prompt in **official Dota 2 painterly style**
     - `frame` — filename like `scene_01.jpg`
     - `dur` — approximate seconds (5–8 typical)
   - Keep narration 8–20 words per scene.
   - Prompts must specify: "Dota 2 official art style, painterly digital painting, dramatic cinematic lighting, Valve Dota 2 loading screen aesthetic, high detail, no text"

3. **You generate the frames**:
   - For every scene, generate an image with the `prompt`.
   - Save them into `episodes/<slug>/frames/` as `scene_01.jpg`, `scene_02.jpg`, etc.
   - Use consistent visual language (same heroes, color palette, lighting direction when possible).

4. **Local render** (user or you run on their machine):
   ```bash
   node render.mjs <slug>
   node render.mjs <slug> --lang ru
   node render.mjs <slug> --preview
   ```
   Output lands in `out/<slug>.<lang>.mp4` + `.srt`.

## Story JSON shape (minimal)

```json
{
  "title": "Short Title",
  "languages": ["en", "ru"],
  "scenes": [
    {
      "note": "What we see",
      "say": { "en": "Narration line.", "ru": "Строка озвучки." },
      "prompt": "Dota 2 official art style, painterly..., specific scene description, no text",
      "frame": "scene_01.jpg",
      "dur": 6
    }
  ]
}
```

## Style rules for prompts

- Always start or include: `Dota 2 official art style, painterly digital painting, dramatic cinematic lighting, Valve Dota 2 loading screen aesthetic`
- Describe characters, environment, lighting, mood, composition
- End with `high detail, no text, no watermark`
- Prefer original stylized characters or classic Dota 2 hero silhouettes (never copyrighted exact copies if avoidable)
- Keep consistent color grading across the film (e.g. warm dusk, cold night, purple magic)

## After frames exist

Tell the user:
```bash
cd dota2-video-studio
node render.mjs <slug>
```
Optional: put `OPENROUTER_API_KEY` in `.env` for free narration.

## Pitfalls

- Missing frame file → black scene (warn the user)
- No API key → silent video (still useful for review)
- Keep scene count reasonable (4–10); each image gen takes time
- Test with `--preview` first

## Deliver

Once rendered, the mp4 is ready. Send the file or tell the user the path. Mention duration and languages.
