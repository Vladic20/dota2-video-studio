#!/usr/bin/env node
/**
 * dota2-video-studio renderer
 * 
 * Takes a story.json + pre-generated frames (by Grok) and produces a finished mp4.
 * 
 * Usage:
 *   node render.mjs example
 *   node render.mjs example --lang en
 *   node render.mjs example --preview
 * 
 * Requires: Node 18+, ffmpeg in PATH
 * Optional: OPENROUTER_API_KEY in .env for TTS (Fish Audio free tier)
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const ep = argv.find(a => !a.startsWith('--')) || 'example';
const lang = argv.includes('--lang') ? argv[argv.indexOf('--lang') + 1] : 'en';
const preview = argv.includes('--preview');

const epDir = path.join(__dirname, 'episodes', ep);
const storyPath = path.join(epDir, 'story.json');
const framesDir = path.join(epDir, 'frames');
const outDir = path.join(__dirname, 'out');

if (!existsSync(storyPath)) {
  console.error(`\u2717 No story.json at ${storyPath}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
mkdirSync(path.join(epDir, 'build'), { recursive: true });

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const story = JSON.parse(readFileSync(storyPath, 'utf8'));
const scenes = story.scenes || [];
if (!scenes.length) {
  console.error('\u2717 No scenes in story.json');
  process.exit(1);
}

console.log(`\u25b8 Rendering "${story.title || ep}" [${lang}] \u00b7 ${scenes.length} scenes`);

// ─── Collect frames ──────────────────────────────────────────────────────────────
const frameFiles = [];
for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  const frameName = s.frame || `scene_${String(i + 1).padStart(2, '0')}.jpg`;
  const framePath = path.join(framesDir, frameName);
  if (!existsSync(framePath)) {
    console.warn(`\u26a0 Missing frame: ${frameName} \u2014 will use black placeholder`);
    frameFiles.push(null);
  } else {
    frameFiles.push(framePath);
  }
}

// ─── Simple TTS (optional, OpenRouter Fish Audio) ─────────────────────────────
async function generateVoice(text, outPath) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.log('  (no OPENROUTER_API_KEY \u2014 skipping TTS, video will be silent)');
    return false;
  }
  try {
    const res = await fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.TVHEAD_TTS_MODEL || 'fish-audio/s2.1-pro-free:free',
        input: text,
        voice: process.env.TVHEAD_VOICE_EN || 'bf322df2096a46f18c579d0baa36f41d',
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(outPath, buf);
    return true;
  } catch (e) {
    console.warn(`  TTS failed: ${e.message}`);
    return false;
  }
}

// ─── Build per-scene clips with Ken Burns ──────────────────────────────────
const tmpDir = path.join(epDir, 'build', 'tmp');
mkdirSync(tmpDir, { recursive: true });

const sceneClips = [];
const voiceClips = [];

for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  const say = typeof s.say === 'object' ? (s.say[lang] || s.say.en || '') : (s.say || '');
  const dur = s.dur || 5;
  const frame = frameFiles[i];
  const clipPath = path.join(tmpDir, `scene_${i}.mp4`);
  const voicePath = path.join(tmpDir, `voice_${i}.mp3`);

  console.log(`  Scene ${i + 1}/${scenes.length}: ${dur}s`);

  // Voice
  let hasVoice = false;
  if (say) {
    hasVoice = await generateVoice(say, voicePath);
    if (hasVoice) voiceClips.push(voicePath);
  }

  // Ken Burns: slow zoom + slight pan
  const zoom = preview ? 1.05 : 1.12;
  const w = preview ? 1280 : 1920;
  const h = preview ? 720 : 1080;
  const fps = 30;
  const frames = Math.round(dur * fps);

  if (frame) {
    const filter = [
      `scale=${w * zoom}:${h * zoom}:force_original_aspect_ratio=increase`,
      `crop=${w}:${h}`,
      `zoompan=z='min(zoom+0.0008,${zoom})':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${w}x${h}:fps=${fps}`,
    ].join(',');

    const ff = spawnSync('ffmpeg', [
      '-y', '-loop', '1', '-i', frame,
      '-vf', filter,
      '-t', String(dur),
      '-c:v', 'libx264', '-preset', preview ? 'veryfast' : 'medium', '-crf', preview ? '28' : '23',
      '-pix_fmt', 'yuv420p',
      clipPath,
    ], { stdio: 'pipe' });

    if (ff.status !== 0) {
      console.warn(`  ffmpeg scene ${i} failed, using solid color`);
      spawnSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', `color=c=black:s=${w}x${h}:d=${dur}`, '-c:v', 'libx264', clipPath]);
    }
  } else {
    spawnSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', `color=c=#1a1020:s=${w}x${h}:d=${dur}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', clipPath]);
  }

  sceneClips.push(clipPath);
}

// ─── Concatenate with crossfades ───────────────────────────────────────────────
const listPath = path.join(tmpDir, 'list.txt');
writeFileSync(listPath, sceneClips.map(c => `file '${c}'`).join('\n'));

const videoOnly = path.join(tmpDir, 'video_only.mp4');

spawnSync('ffmpeg', [
  '-y', '-f', 'concat', '-safe', '0', '-i', listPath,
  '-c:v', 'libx264', '-preset', preview ? 'veryfast' : 'medium', '-crf', preview ? '28' : '22',
  '-pix_fmt', 'yuv420p',
  videoOnly,
], { stdio: 'inherit' });

// ─── Mix voice if available ─────────────────────────────────────────────────
const finalOut = path.join(outDir, `${ep}.${lang}${preview ? '_preview' : ''}.mp4`);

if (voiceClips.length) {
  const voiceList = path.join(tmpDir, 'voices.txt');
  const silence = path.join(tmpDir, 'silence.mp3');
  spawnSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '0.4', silence]);

  let voiceConcat = '';
  for (let i = 0; i < voiceClips.length; i++) {
    voiceConcat += `file '${voiceClips[i]}'\n`;
    if (i < voiceClips.length - 1) voiceConcat += `file '${silence}'\n`;
  }
  writeFileSync(voiceList, voiceConcat);

  const voiceAll = path.join(tmpDir, 'voice_all.mp3');
  spawnSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', voiceList, '-c', 'copy', voiceAll]);

  spawnSync('ffmpeg', [
    '-y', '-i', videoOnly, '-i', voiceAll,
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    finalOut,
  ], { stdio: 'inherit' });
} else {
  spawnSync('ffmpeg', ['-y', '-i', videoOnly, '-c', 'copy', finalOut], { stdio: 'inherit' });
}

// ─── SRT ───────────────────────────────────────────────────────────────────────
let srt = '';
let t = 0;
for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  const say = typeof s.say === 'object' ? (s.say[lang] || s.say.en || '') : (s.say || '');
  if (!say) continue;
  const start = t;
  const end = t + (s.dur || 5);
  const fmt = sec => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
  };
  srt += `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${say}\n\n`;
  t = end;
}
if (srt) writeFileSync(finalOut.replace('.mp4', '.srt'), srt);

console.log(`\n\u2713 Done \u2192 ${finalOut}`);
console.log(`  ${scenes.length} scenes \u00b7 ${lang}`);
if (!process.env.OPENROUTER_API_KEY) {
  console.log('  Tip: put OPENROUTER_API_KEY in .env for free Fish Audio narration');
}
