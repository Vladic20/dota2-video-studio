# dota2-video-studio

Local studio for narrated videos in **Dota 2 dark-fantasy style**.

Frames are drawn **by code** (the same SVG engine as tvhead-studio), not by image generation.

## How it works
1. Human gives a short idea.
2. Grok writes `episodes/<slug>/story.json` with `"look": "dota"`, characters, scenes and narration.
3. `node make.mjs <slug>` renders the frames and assembles the mp4.

## Commands
- Stills (check the pictures): `node make.mjs <slug> --stills auto`
- Final render: `node make.mjs <slug>`
- Preview: `node make.mjs <slug> --preview`
- Russian only: `node make.mjs <slug> --lang ru`

## Structure
- `engine/` — code that draws characters, props and scenes
- `lib/` — timeline, voice, frames
- `episodes/<slug>/story.json` — the story
- `out/` — finished videos

## Rules for the agent
- Always set `"look": "dota"`.
- Build characters from the modular parts (heads, bodies, hats, held items).
- Never use Imagine or external image generation for the frames.
- After writing the story, run the local renderer.
