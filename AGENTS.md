# dota2-video-studio

This is a local studio for making narrated videos in official Dota 2 painterly style.

## How it works
- Human gives a short idea.
- Grok (via the `dota2-video` skill) writes the storyboard and generates all frames with Imagine.
- `node render.mjs <slug>` assembles the frames into a finished mp4 (Ken Burns, timing, optional TTS, captions).

## Commands
- Render: `node render.mjs <slug>`
- Preview: `node render.mjs <slug> --preview`
- Russian only: `node render.mjs <slug> --lang ru`

## Structure
- `episodes/<slug>/story.json` — scenes, narration, prompts
- `episodes/<slug>/frames/` — generated images
- `out/` — finished videos

## Rules for the agent
- Always follow the `dota2-video` skill when the user describes a video idea.
- Generate images yourself; do not ask the user to draw them.
- Keep prompts in the official Dota 2 loading-screen painterly style.
- After images are ready, automatically run the renderer.
