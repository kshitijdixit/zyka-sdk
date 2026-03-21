# Zyka SDK

Programmatic AI media generation SDK. Generate videos, images, TTS, and more via Zyka's APIs.

## Quick Start (Simplest Usage — No Composition Needed)

```js
const { ZykaClient } = require('zyka-sdk');

const client = new ZykaClient({
  token: process.env.ZYKA_API_TOKEN,
  apiUrl: 'https://zyka.ai/api-v2',  // production default
});

// Generate a video and wait for completion
const video = await client.createVideo(
  { model: 'wan', prompt: 'A sunset over mountains', duration: 5, aspect_ratio: '16:9' },
  { waitForCompletion: true }
);
console.log(video.outputUrl);
```

---

## Video Models

The `model` field must be one of: `sora`, `veo`, `kling`, `bytedance`, `wan`, `infinite_talk`

### sora (OpenAI Sora)
```js
{ model: 'sora', sub_model: 'sora-2', prompt: '...', seconds: '4', size: '1280x720' }
```
- **sub_model**: `'sora-2'` (default), `'sora-2-pro'`
- **seconds**: `'4'`, `'8'`, `'12'`
- **size**: `'720x1280'`, `'1280x720'`, `'1024x1792'`, `'1792x1024'`

### veo (Google Veo)
```js
{ model: 'veo', sub_model: 'veo-3.0-generate-001', prompt: '...', seconds: '8', aspect_ratio: '16:9' }
```
- **sub_model**: `'veo-2.0-generate-001'`, `'veo-3.0-generate-001'`, `'veo-3.0-fast-generate-001'`, `'veo-3.1-generate-001'`, `'veo-3.1-fast-generate-001'`, etc.
- **seconds**: `'4'`–`'8'`
- **aspect_ratio**: `'16:9'`, `'9:16'` (required)
- **size**: `'720p'`, `'1080p'`, `'4k'`
- **ingredients**: Array of up to 20 image URLs (Veo 3.1 only)

### kling (Kling AI)
```js
// Image-to-video (motion-control, default sub_model)
{ model: 'kling', sub_model: 'motion-control', image_url: '...', prompt: '...', mode: 'std', character_orientation: 'image', duration: '5' }

// Text-to-video
{ model: 'kling', sub_model: 'kling-v2-master', prompt: '...', duration: '5', aspect_ratio: '16:9' }
```
- **sub_model**: `'motion-control'` (default), `'kling-v1'`, `'kling-v1-5'`, `'kling-v1-6'`, `'kling-v2-master'`, `'kling-v2-1-master'`, `'kling-v2-5-turbo'`, `'kling-v2-6'`, `'kling-v3'`, `'kling-v3-pro'`, `'kling-o3'`, `'kling-o3-pro'`, `'multi-image-to-video'`, `'kling-video-o1'`
- **duration**: `'5'` or `'10'` (most); `'3'`–`'10'` (video-o1); `'3'`–`'15'` (v3/o3)
- **mode**: `'std'`, `'pro'`
- **aspect_ratio**: `'16:9'`, `'9:16'`, `'1:1'`
- **image_url**: Required for motion-control (image-to-video)
- **character_orientation**: `'image'` or `'video'` (required for motion-control)
- **sound**: `'on'`/`'off'` (v2.6+ only)

### bytedance (Seedance / OmniHuman)
```js
{ model: 'bytedance', sub_model: 'Seedance V1.5 Pro', prompt: '...', duration: '5', resolution: '1080p', aspect_ratio: '16:9' }
```
- **sub_model**: `'Seedance V1.5 Pro'` (default), `'OmniHuman'`, `'OmniHuman v1.5'`
- **duration**: `'4'`–`'12'`
- **resolution**: `'480p'`, `'720p'`, `'1080p'`
- **aspect_ratio**: `'21:9'`, `'16:9'`, `'4:3'`, `'1:1'`, `'3:4'`, `'9:16'`
- **generate_audio**: boolean (default true)

### wan (Alibaba WAN)
```js
// Text-to-video
{ model: 'wan', sub_model: 'wan-2-6-t2v', prompt: '...', duration: 5:, aspect_ratio: '16:9' }
// Image-to-video
{ model: 'wan', sub_model: 'wan-2-6-i2v', prompt: '...', image_url: '...', duration: 5 }
```
- **sub_model**: `'wan-2-6-t2v'` (default, text-to-video), `'wan-2-6-i2v'` (image-to-video), `'wan-2-5-i2v'`, `'wan-v2-2-animate-replace'`, `'wan-v2-2-animate-move'`
- **duration**: `5`, `10`, or `15` (number)
- **seconds**: `'5'`, `'10'`, `'15'` (string alternative)
- **size**: `'1280*720'`, `'1920*1080'`, `'720*1280'`, `'1080*1920'`
- **seed**: number (-1 for random)
- **audio_url**: WAV or MP3 URL (optional, for audio-reactive video)

### infinite_talk (Talking Head)
```js
{ model: 'infinite_talk', image_url: 'https://face.jpg', audio_url: 'https://speech.mp3' }
```
- **image_url**: Face image URL (required)
- **audio_url**: Speech audio URL (required)
- **input_type**: `'image'` or `'video'`
- **person_count**: `'single'` or `'multi'`
- **audio_url_2**: Required for multi-person
- **width/height**: 256–1024

---

## Image Models

The `model` field must be one of:

| Model                              | Sub-model default               | Notes                                 |
|------------------------------------|---------------------------------|---------------------------------------|
| `nano_banana`                      | `nano-banana-1`                 | Gemini-based. Sub-models: `nano-banana-1`, `nano-banana-pro` |
| `flux_2_dev`                       | `flux-2-dev`                    | Flux 2 Dev                            |
| `flux_1_schnell`                   | `flux-1-schnell`                | Flux 1 Schnell (fast)                 |
| `lucid_origin`                     | `lucid-origin`                  | Lucid Origin                          |
| `phoenix_1_0`                      | `phoenix-1.0`                   | Phoenix 1.0                           |
| `stable_diffusion_v1_5_img2img`    | `stable-diffusion-v1-5-img2img` | SD 1.5 img2img (requires `image`)     |
| `stable_diffusion_xl_base_1_0`     | `stable-diffusion-xl-base-1.0`  | SD XL Base 1.0                        |
| `dall_e_2`                         | `dall-e-2`                      | DALL-E 2. Sizes: 256², 512², 1024²    |
| `dall_e_3`                         | `dall-e-3`                      | DALL-E 3. Quality: `'standard'`/`'hd'` |
| `gpt_image_1`                      | `gpt-image-1`                   | GPT Image 1. `background: 'transparent'` supported |
| `gpt_image_1_mini`                 | `gpt-image-1-mini`              | GPT Image 1 Mini (cheaper)            |
| `gpt_image_1_5`                    | `gpt-image-1.5`                 | GPT Image 1.5 (latest)                |
| `kling`                            | `kling-v1`                      | Sub-models: `kling-v2`, `omni-image`, `kling-image-v3`, etc. |
| `z_image_turbo`                    | `z-image-turbo`                 | Fast generation                       |

```js
// Nano Banana 1
{ model: 'nano_banana', prompt: 'A neon city', size: '1024x1024' }

// Nano Banana Pro (higher res)
{ model: 'nano_banana', sub_model: 'nano-banana-pro', prompt: '...', resolution: '4K' }

// GPT Image 1 with transparent background
{ model: 'gpt_image_1', prompt: 'Product photo of sneakers', size: '1024x1024', background: 'transparent' }

// DALL-E 3
{ model: 'dall_e_3', prompt: 'Watercolor sunset', size: '1024x1024', quality: 'hd' }
```

---

## TTS (Text-to-Speech)

Providers: `elevenlabs` (default), `qwen3`, `chatterbox`, `voxcpm`, `minimax`, `moss-tts`

```js
// ElevenLabs (simplest)
await client.createTTS(
  { voice_id: 'your-elevenlabs-voice-id', script: 'Hello world' },
  { waitForCompletion: true }
);

// Chatterbox with voice cloning
{ provider: 'chatterbox', script: 'Hello', actual_voice_url: 'https://ref.mp3', temperature: 0.7, speed: 1.0 }

// MiniMax preset voice
{ provider: 'minimax', script: 'Hello', voice_setting: { voice_id: 'Wise_Woman', speed: 1.0 } }
```

---

## Direct Client API

```js
const { ZykaClient } = require('zyka-sdk');
const client = new ZykaClient();
```

| Method | Polling | Description |
|--------|---------|-------------|
| `client.createVideo(params, opts?)` | ✅ | Start video generation |
| `client.createImage(params, opts?)` | ✅ | Start image generation |
| `client.createTTS(params, opts?)` | ✅ | Start text-to-speech |
| `client.getVideoStatus(id)` | — | Check video job status |
| `client.getImageStatus(id)` | — | Check image job status |
| `client.getTTSStatus(id)` | — | Check TTS job status |
| `client.pollUntilComplete(id, type, opts?)` | — | Poll any job until done |
| `client.createUpscale(params)` | — | Upscale image |
| `client.createFaceSwap(params)` | — | Face swap |
| `client.createVirtualTryOn(params)` | — | Virtual try-on |
| `client.refinePrompt(params)` | — | AI prompt refinement |

All `create*` methods accept optional `{ waitForCompletion: true, timeoutMs: 300000, pollIntervalMs: 5000 }`.

---

## Auth

Token resolution order:
1. Constructor: `new ZykaClient({ token: '...' })`
2. Environment: `ZYKA_API_TOKEN`
3. Config file: `~/.zyka/config.json` (set via `zyka auth login`)

## Build

```bash
pnpm install
pnpm --filter zyka-sdk build    # core SDK → packages/core/dist/
pnpm --filter zyka build        # CLI → packages/cli/dist/
```

## Project Structure

```
packages/core/src/
  types.ts        — All TypeScript types (models, params, sub-models)
  client.ts       — ZykaClient class (all API methods + polling)
  helpers.ts      — Convenience functions (renderVideo, renderImage, etc.)
  composition.ts  — Pipeline composition() + scene() factories
  runner.ts       — Pipeline executor (render function)
  index.ts        — Barrel export
packages/cli/src/ — CLI binary (auth, init, render commands)
```
