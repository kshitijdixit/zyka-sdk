# Zyka SDK

Programmatic AI media generation SDK. Generate videos, images, TTS, and more via Zyka's APIs.

## Quick Start (Simplest Usage — No Composition Needed)

```js
const { ZykaClient } = require('zyka-sdk');

const client = new ZykaClient({
  token: process.env.ZYKA_API_TOKEN, // or reads from ~/.zyka/config.json
  apiUrl: 'https://zyka.ai/api-v2',  // production default
});

// Generate a video and wait for completion (built-in polling)
const video = await client.createVideo(
  { model: 'wan', prompt: 'A sunset over mountains', duration: 5, aspect_ratio: '16:9' },
  { waitForCompletion: true }
);
console.log(video.outputUrl); // https://d22ofvg8yrf77k.cloudfront.net/...mp4
```

## Supported Video Models

| Model         | Type            | Duration       | Notes                                        |
|---------------|-----------------|----------------|----------------------------------------------|
| `wan`         | text-to-video   | 5s             | Best for general text-to-video               |
| `grok`        | text-to-video   | 1-15s          | Duration as string: `"5s"`, `"10s"`          |
| `veo`         | text-to-video   | up to 8s       | Google Veo                                   |
| `sora`        | text-to-video   | variable       | OpenAI Sora                                  |
| `bytedance`   | text-to-video   | variable       | ByteDance Seedance                           |
| `kling`       | image-to-video  | 5 or 10s       | **Requires** `image_url` or `first_frame`    |
| `infinite_talk` | image-to-video | variable      | Talking-head animation, requires `image_url` |

## Supported Image Models

| Model                  | Notes                                    |
|------------------------|------------------------------------------|
| `flux-1`               | Flux 1 Schnell/Dev (text-to-image)       |
| `stable-diffusion-xl`  | Stable Diffusion XL                      |
| `nano-banana-pro`      | Batch generation (up to 14 images)       |

## Direct Client API

```js
const { ZykaClient } = require('zyka-sdk');
const client = new ZykaClient();
```

### Video
```js
// Text-to-video (wan)
const video = await client.createVideo(
  { model: 'wan', prompt: 'A cinematic sunset', duration: 5, aspect_ratio: '16:9' },
  { waitForCompletion: true }
);

// Text-to-video (grok — use string duration)
const video = await client.createVideo(
  { model: 'grok', prompt: 'A cat playing piano', duration: '5s' },
  { waitForCompletion: true }
);

// Image-to-video (kling — requires image_url)
const video = await client.createVideo(
  { model: 'kling', prompt: 'Animate this', image_url: 'https://...', duration: 5 },
  { waitForCompletion: true }
);

// Fire-and-forget (poll manually later)
const pending = await client.createVideo({ model: 'wan', prompt: '...' });
// ... later ...
const status = await client.getVideoStatus(pending.id);
```

### Image
```js
const image = await client.createImage(
  { model: 'flux-1', prompt: 'A neon city at night' },
  { waitForCompletion: true }
);
```

### TTS
```js
const audio = await client.createTTS(
  { voice_id: 'your-elevenlabs-voice-id', text: 'Hello world' },
  { waitForCompletion: true }
);
```

### Manual Polling
```js
const result = await client.pollUntilComplete(jobId, 'video', {
  timeoutMs: 300000, // 5 minutes
  pollIntervalMs: 5000,
});
```

## Build

```bash
pnpm install
pnpm --filter zyka-sdk build    # core SDK → packages/core/dist/
pnpm --filter zyka build        # CLI → packages/cli/dist/
```

## CLI

```bash
node packages/cli/dist/index.js auth login
node packages/cli/dist/index.js init <project-name>
node packages/cli/dist/index.js render <file.js> --inputs '<json>'
```

## Auth

Token resolution order:
1. Constructor: `new ZykaClient({ token: '...' })`
2. Environment: `ZYKA_API_TOKEN`
3. Config file: `~/.zyka/config.json` (set via `zyka auth login`)

## Project Structure

```
packages/core/src/
  types.ts        — All TypeScript types (VideoModel, WaitOptions, etc.)
  client.ts       — ZykaClient class (createVideo, createImage, createTTS, pollUntilComplete)
  helpers.ts      — Convenience functions (renderVideo, renderImage, renderTTS, etc.)
  composition.ts  — Pipeline composition() + scene() factories
  runner.ts       — Pipeline executor (render function)
  index.ts        — Barrel export
packages/cli/src/ — CLI binary (auth, init, render commands)
examples/         — Example compositions
```
