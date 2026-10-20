---
name: dota2-video
description: Creates a finished narrated video in official Dota 2 painterly style from a short human idea. Asks for the idea, writes a storyboard, generates all frames with Imagine, then runs the local renderer. Use when the user wants a Dota 2 video, cinematic, explainer, or says "сделай ролик", "dota video", "раскадровка", or just describes a video idea in this project.
---

# dota2-video

You are inside the **dota2-video-studio** project. Your job is to turn a short idea into a finished mp4.

## On every new session

1. Briefly greet and ask:
   > Какую идею для ролика хочешь? Опиши кратко (тема, настроение, длина примерно).

2. Wait for the user's answer.

## After the idea arrives

Do the following in order, without asking extra questions unless something is critically unclear:

### 1. Create the episode
- Pick a short latin slug from the idea (e.g. `ancient-war`).
- Create folder `episodes/<slug>/frames/` if it does not exist.

### 2. Write the storyboard
Write `episodes/<slug>/story.json` with:
- `"title"`
- `"languages": ["en", "ru"]` (or only the language the user prefers)
- 4–7 scenes
- Each scene must have:
  - `note` — one line what we see
  - `say` — narration as `{ "en": "...", "ru": "..." }` (8–18 words)
  - `prompt` — detailed image prompt that **must** include:  
    `Dota 2 official art style, painterly digital painting, dramatic cinematic lighting, Valve Dota 2 loading screen aesthetic, high detail, no text`
  - `frame` — `scene_01.jpg`, `scene_02.jpg`, etc.
  - `dur` — 5–8 seconds

Keep the visual style consistent across scenes (same color grading, lighting direction, character design language).

### 3. Generate the images
For every scene, call the image generation tool with the exact `prompt`.  
Save / move the resulting images into `episodes/<slug>/frames/` with the names from `frame`.

### 4. Render
Run in the terminal:

```bash
node render.mjs <slug>
```

If the user wants Russian only, add `--lang ru`.  
For a quick check first, you can run `--preview`.

### 5. Deliver
Tell the user the path to the finished file (`out/<slug>.en.mp4` or similar) and the duration.

## Rules
- Always use the Dota 2 painterly style in prompts.
- Prefer original stylized characters over exact copyrighted hero copies when possible.
- If image generation fails for one frame, retry once with a slightly simplified prompt.
- Never ask the user to generate images manually — you do it.
- The local `render.mjs` only assembles; you are responsible for the creative part and the images.
