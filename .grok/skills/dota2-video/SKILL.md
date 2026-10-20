---
name: dota2-video
description: Creates a finished narrated video in Dota 2 dark-fantasy style using the local code-based renderer (same engine as tvhead-studio). Asks for the idea, writes a story.json with characters and scenes, then runs the local make.mjs to render frames and video. Use when the user wants a Dota video, cinematic, or describes a video idea in this project.
---

# dota2-video

You are inside the **dota2-video-studio** project. Frames are drawn **by code** (SVG engine), not by Imagine.

## On every new session

1. Ask:
   > Какую идею для ролика хочешь? Опиши кратко (тема, герои, настроение).

2. Wait for the answer.

## After the idea arrives

### 1. Create the episode
- Choose a short latin slug (e.g. `ancient-clash`).
- Write `episodes/<slug>/story.json` using the full story API (see `references/story-api.md` if needed, or follow the rules below).

### 2. Story rules for Dota style
Always set:
```json
"look": "dota"
```
- 4–8 scenes, ~60–90 s total.
- Languages: `["en", "ru"]` or the user's preference.
- Characters: 2–4 named heroes built from parts (`head`, `body`, `hat`, `hold`, etc.). Prefer armor-like, fantasy, dramatic descriptions.
- Sets: use dramatic ones (`city` with night, `mountains`, `stage`, `blackout`, or invent via notes).
- Every scene has `note`, `say` as `{ "en": "...", "ru": "..." }`, and something visual happening.
- Use kinetic type or props for key moments.
- Transitions: mix `curve`, `zoom`, `iris`, `whip`.

Example character:
```json
"characters": {
  "hero": { "name": { "en": "The Ancient", "ru": "Древний" }, "head": "round", "body": "suit", "hat": "crown", "color": "#c9a227", "desc": "armored ancient with glowing runes" }
}
```

### 3. Render with the local engine
Run:
```bash
node make.mjs <slug> --stills auto
```
Read the contact sheet if it appears, fix obvious problems in story.json once, then:
```bash
node make.mjs <slug>
```
Or `--preview` for a fast draft.

### 4. Deliver
Tell the user the path to `out/<slug>.en.mp4` (and `.ru.mp4` if bilingual) and the duration.

## Important
- Do **not** generate images with Imagine. The engine draws the frames from the story.json.
- Use only the character parts, props, faces, poses and transitions listed in the story API.
- If something looks wrong on the sheet, edit story.json and re-run `--stills`.
