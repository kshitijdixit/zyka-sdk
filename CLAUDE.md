# Zyka SDK

Programmatic AI media generation SDK. Generate videos, images, TTS, and more via Zyka's APIs.

## Quick Start (Simplest Usage — No Composition Needed)

```js
const { ZykaClient } = require('zyka-sdk');

const client = new ZykaClient({
  apiKey: process.env.ZYKA_API_KEY,  // or pass 'zk_live_...' directly
});

// Generate a video — waits for completion by default!
const video = await client.createVideo({ model: 'wan', prompt: 'A sunset over mountains' });
console.log(video.outputUrl);

// Generate an image from a local file — auto-uploaded!
const image = await client.createImage(
  { model: 'nano_banana', image: './photo.png', prompt: 'make hair straight' },
  { output: './result.png' }  // auto-downloaded!
);
```

---

## ✨ Key DX Features

### Local File Support
Pass local file paths instead of URLs. The SDK auto-uploads them.
```js
// Before (painful): manually upload to get URL, then use URL
// After (easy): just pass the path
await client.createVideo({ model: 'kling', image_url: './photo.png', prompt: 'Animate this' });
await client.createImage({ model: 'nano_banana', image: './input.jpg', prompt: '...' });
await client.createTTS({ provider: 'chatterbox', actual_voice_url: './my-voice.mp3', script: '...' });
```

### Auto-Wait (waitForCompletion = true by default)
```js
// Just await — no manual polling!
const result = await client.createVideo({ model: 'wan', prompt: 'A sunset' });
console.log(result.outputUrl);  // ready immediately

// To get fire-and-forget behavior:
const pending = await client.createVideo(
  { model: 'wan', prompt: 'A sunset' },
  { waitForCompletion: false }
);
```

### Auto-Download Results
```js
const result = await client.createImage(
  { model: 'nano_banana', prompt: 'neon city' },
  { output: './output.png' }  // downloaded to this path
);
```

### CLI Generate Command
```bash
npx zyka generate image -m nano_banana -p "neon city" -o ./result.png
npx zyka generate video -m wan -p "sunset over mountains" -o ./video.mp4
npx zyka generate tts --script "Hello world" --voice-id abc123 -o ./speech.mp3
```

### asset() Helper (Remotion-like public/ folder)
```js
import { asset } from 'zyka-sdk';
// Place files in ./public/ — reference by name
await client.createImage({ model: 'nano_banana', image: asset('photo.png'), prompt: '...' });
```

---

## Video Models

The `model` field must be one of: `sora`, `veo`, `kling`, `bytedance`, `wan`, `infinite_talk`, `grok`, `ltx`

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

### kling (Kling AI)
```js
{ model: 'kling', sub_model: 'kling-v2-master', prompt: '...', duration: '5', aspect_ratio: '16:9' }
```
- **sub_model**: `'motion-control'` (default), `'kling-v1'` thru `'kling-v3-pro'`, `'kling-o3'`, `'kling-o3-pro'`, `'multi-image-to-video'`, `'kling-video-o1'`
- **duration**: `'5'` or `'10'` (most); `'3'`–`'10'` (video-o1); `'3'`–`'15'` (v3/o3)
- **mode**: `'std'`, `'pro'`
- **aspect_ratio**: `'16:9'`, `'9:16'`, `'1:1'`

### bytedance (Seedance / OmniHuman)
```js
{ model: 'bytedance', sub_model: 'Seedance V1.5 Pro', prompt: '...', duration: '5', resolution: '1080p' }
```
- **sub_model**: `'Seedance V1.5 Pro'` (default), `'Seedance 2.0'`, `'Seedance 2.0 Fast'`, `'OmniHuman'`, `'OmniHuman v1.5'`
- **duration**: `'4'`–`'12'`
- **resolution**: `'480p'`, `'720p'`, `'1080p'`
- **aspect_ratio**: `'21:9'`, `'16:9'`, `'4:3'`, `'1:1'`, `'3:4'`, `'9:16'`

### wan (Alibaba WAN)
```js
{ model: 'wan', sub_model: 'wan-2-6-t2v', prompt: '...', duration: 5 }
```
- **sub_model**: `'wan-2-6-t2v'` (default), `'wan-2-7'`, `'wan-2-6-i2v'`, `'wan-2-5-i2v'`, `'wan-v2-2-animate-replace'`, `'wan-v2-2-animate-move'`
- **duration**: `5`, `10`, or `15` (number)
- **size**: `'1280*720'`, `'1920*1080'`, `'720*1280'`, `'1080*1920'`

### infinite_talk (Talking Head)
```js
{ model: 'infinite_talk', image_url: './face.jpg', audio_url: './speech.mp3' }
```
- **image_url**: Face image (required) — local path or URL
- **audio_url**: Speech audio (required) — local path or URL

### ltx (LTX Video)
```js
{ model: 'ltx', sub_model: 'ltx-2.3-text-to-video', prompt: '...' }
```
- **sub_model**: `'ltx-2.3-text-to-video'` (default), `'ltx-2.3-image-to-video'`

### grok (xAI Grok Imagine Video)
```js
{ model: 'grok', sub_model: 'grok-imagine-video', prompt: '...', duration: '6', aspect_ratio: '16:9' }
```
- **sub_model**: `'grok-imagine-video'` (default)
- **duration**: `1`–`15` (default `6`)
- **aspect_ratio**: `'auto'`, `'16:9'`, `'9:16'`, `'1:1'`, `'4:3'`, `'3:2'`, etc.
- **resolution**: `'480p'`, `'720p'`
- **image_url**: Optional — if provided, switches to Image-to-Video mode

---

## Image Models

| Model | Notes |
|---|---|
| `nano_banana` | Sub-models: `nano-banana-1` (default), `nano-banana-pro`, `nano-banana-2` |
| `flux_1_schnell` | Fast generation |
| `flux_2_dev` | Flux 2 Dev |
| `flux_2_klein_9b` | Flux 2 Klein 9B |
| `dall_e_2` | Sizes: 256², 512², 1024² |
| `dall_e_3` | Quality: `'standard'`/`'hd'` |
| `gpt_image_1` | `background: 'transparent'` supported |
| `gpt_image_1_mini` | Cheaper variant |
| `gpt_image_1_5` | Latest |
| `kling` | Sub-models: `kling-v1`, `kling-v1-5`, `kling-v2`, `kling-v2-1`, `kling-image-v3`, `kling-image-v3-text-to-image`, `omni-image`, `kling-image-o1`, `multi-image-to-image` |
| `stable_diffusion_xl_base_1_0` | SD XL |
| `stable_diffusion_v1_5_img2img` | Requires `image` |
| `lucid_origin` | Leonardo |
| `phoenix_1_0` | Phoenix |
| `z_image_turbo` | Fast |
| `zyka_helion` | Fast Zyka-native model |
| `grok_imagine` | xAI Grok Imagine Image |
| `qwen_image_2_pro` | Qwen Image 2 Pro (Chinese/English) |

---

## TTS Providers

| Provider | Features |
|---|---|
| `elevenlabs` | Default. Requires `voice_id` |
| `qwen3` | voice_design, voice_clone, custom_voice |
| `chatterbox` | Voice cloning + emotion control |
| `voxcpm` | Voice cloning |
| `minimax` | 17 preset voices |
| `moss-tts` | RunPod-based |
| `fish-audio` | Fish Audio IVC (instant voice cloning) |

---

## Video Dubbing

Dub a video into another language using one of 3 provider models.

### Models

| Model | `model` value | Language format | Notes |
|---|---|---|---|
| HeyGen | `heygen` | Full name: `'Hindi (India)'` | Lip-sync, caption, speed/precision modes |
| ElevenLabs | `elevenlabs` | ISO code: `'hi'` | High-res output, background audio control |
| Sarvam | `sarvam` | Name: `'Hindi'` | Indian-language specialist, multi-target via comma-separated string |

### Usage

```js
// HeyGen (default)
await client.createVideoDubbing({
  video_url: 'https://example.com/video.mp4',
  model: 'heygen',
  output_language: 'Hindi (India)',
  mode: 'precision',
  enable_caption: true,
});

// ElevenLabs
await client.createVideoDubbing({
  video_url: 'https://example.com/video.mp4',
  model: 'elevenlabs',
  output_language: 'hi',
  source_lang: 'en',
  num_speakers: 2,
  highest_resolution: true,
});

// Sarvam (multi-target)
await client.createVideoDubbing({
  video_url: 'https://example.com/video.mp4',
  model: 'sarvam',
  output_language: 'Hindi,Tamil,Telugu',
  genre: 'education',
});

// Fetch supported languages for a model
const langs = await client.getVideoDubbingLanguages('elevenlabs');
```

### Params by model

**HeyGen** (`model: 'heygen'`):
- `output_language` — full name e.g. `'Hindi (India)'`
- `translate_audio_only?` — keep original video, replace audio only
- `mode?` — `'speed'` | `'precision'`
- `enable_caption?` — overlay captions
- `enable_speech_enhancement?` — clean up audio

**ElevenLabs** (`model: 'elevenlabs'`):
- `output_language` — ISO code e.g. `'hi'`
- `source_lang?` — source language ISO code
- `num_speakers?` — number of speakers
- `highest_resolution?` — output at max resolution
- `drop_background_audio?` — strip background noise
- `use_profanity_filter?` — filter profanity

**Sarvam** (`model: 'sarvam'`):
- `output_language` — language name e.g. `'Hindi'`; comma-separate for multiple: `'Hindi,Tamil'`
- `source_lang?` — source language name
- `num_speakers?` — number of speakers
- `genre?` — `'general'` | `'news'` | `'entertainment'` | `'education'` | `'sports'` | `'religious'`

---

## Apps (AI Tools)

| Method | Description |
|---|---|
| `client.createUpscale({ image, resolution })` | Upscale image to 1k/2k/4k |
| `client.createFaceSwap({ type, url, face_image })` | Face swap (image or video) |
| `client.createVirtualTryOn({ human_image, cloth_image })` | Virtual clothing try-on |
| `client.createOutfitSwap({ user_image, character_image })` | Swap outfit from character |
| `client.createSkinEnhancer({ image, type })` | Skin enhancement (perfect/realistic/imperfect) |
| `client.createBehindTheScene({ image, type })` | Behind-the-scene film effect |
| `client.createAngles({ image, angle })` | Generate image from new camera angle |
| `client.createNineShorts({ image })` | 9 unique shots from different angles |
| `client.createZooms({ image })` | 9 progressive zoom levels |
| `client.createStoryGenerator({ image })` | 3x3 cinematic story grid |
| `client.createCaptionGenerator({ url })` | Auto-caption a video |
| `client.createVideoToScript({ url })` | Extract script from video |
| `client.createVideoCleaner({ url })` | Remove filler words from video |
| `client.createVideoUpscaler({ video_url })` | Upscale video to 1080p/2k/4k |
| `client.createVideoDubbing({ video_url, output_language, model? })` | Dub video to another language (models: `heygen`, `elevenlabs`, `sarvam`) |
| `client.getVideoDubbingLanguages(model)` | Fetch supported languages for a dubbing model |
| `client.createShortVideoCreator({ url, clip_duration_sec })` | Extract viral clips |
| `client.createBroll({ url })` | Insert B-roll stock footage |
| `client.createYouTubeDownloader({ url })` | Download YouTube video |

---

## Direct Client API

| Method | Auto-Wait | Description |
|---|---|---|
| `client.createVideo(params, opts?)` | ✅ default | Video generation |
| `client.createImage(params, opts?)` | ✅ default | Image generation |
| `client.createTTS(params, opts?)` | ✅ default | Text-to-speech |
| `client.createUpscale(params)` | ✅ sync | Image upscaling |
| `client.createFaceSwap(params)` | ✅ sync | Face swap |
| `client.createVirtualTryOn(params)` | ✅ sync | Virtual try-on |
| `client.createOutfitSwap(params)` | ✅ sync | Outfit swap |
| `client.createSkinEnhancer(params)` | ✅ sync | Skin enhancement |
| `client.createBehindTheScene(params)` | ✅ sync | Behind-the-scene |
| `client.createAngles(params)` | ✅ sync | Camera angle change |
| `client.createNineShorts(params)` | ✅ sync | 9 angle variations |
| `client.createZooms(params)` | ✅ sync | 9 zoom levels |
| `client.createStoryGenerator(params)` | ✅ sync | Cinematic story grid |
| `client.createCaptionGenerator(params, opts?)` | ✅ default | Auto-caption video |
| `client.createVideoToScript(params, opts?)` | ✅ default | Video to script |
| `client.createVideoCleaner(params, opts?)` | ✅ default | Remove fillers |
| `client.createVideoUpscaler(params, opts?)` | ✅ default | Upscale video |
| `client.createVideoDubbing(params, opts?)` | ✅ default | Dub/translate video (models: `heygen`, `elevenlabs`, `sarvam`) |
| `client.getVideoDubbingLanguages(model)` | — | Fetch supported languages for dubbing model |
| `client.createShortVideoCreator(params, opts?)` | ✅ default | Extract viral clips |
| `client.createBroll(params, opts?)` | ✅ default | Insert B-roll |
| `client.createYouTubeDownloader(params, opts?)` | ✅ default | Download YouTube |
| `client.pollUntilComplete(id, type)` | — | Manual polling |

**WaitOptions**: `{ waitForCompletion?: boolean, output?: string, timeoutMs?: number }`

---

## Auth

### API Key (Recommended)
Generate an API key from the Zyka dashboard or via API:
```bash
# Via API (requires JWT login first)
curl -X POST https://zyka.ai/api-v2/api/api-keys \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"name": "My SDK Key"}'
# Returns: { data: { key: "zk_live_..." } }  ← save this, shown once only
```

### Using the API Key
```js
// Option 1: Constructor
const client = new ZykaClient({ apiKey: 'zk_live_...' });

// Option 2: Environment variable (preferred for CI/scripts)
// export ZYKA_API_KEY=zk_live_...
const client = new ZykaClient();  // auto-detects from env
```

### Resolution Priority
1. `config.apiKey` → 2. `ZYKA_API_KEY` env → 3. `config.token` → 4. `ZYKA_API_TOKEN` env → 5. `~/.zyka/config.json`

### Managing API Keys
```bash
# List keys
curl -H "Authorization: Bearer <jwt>" https://zyka.ai/api-v2/api/api-keys

# Revoke a key
curl -X DELETE -H "Authorization: Bearer <jwt>" https://zyka.ai/api-v2/api/api-keys/<key-id>
```

## Build
```bash
pnpm install
pnpm --filter zyka-sdk build
pnpm --filter zyka build
```

## Project Structure
```
packages/core/src/
  types.ts        — All types (models, params, sub-models)
  client.ts       — ZykaClient (API methods + auto-upload + polling + download)
  file-utils.ts   — Local file detection, upload, download
  asset.ts        — asset() helper (public/ folder convention)
  helpers.ts      — Convenience functions (renderVideo, renderImage, etc.)
  composition.ts  — Pipeline composition() + scene()
  runner.ts       — Pipeline executor
  index.ts        — Barrel export
packages/cli/src/ — CLI (auth, init, render, generate commands)
```

