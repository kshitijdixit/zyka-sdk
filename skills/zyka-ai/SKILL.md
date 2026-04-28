---
name: zyka-ai
version: 0.4.11
description: Generate AI videos, images, voice, and use AI apps using the Zyka SDK. Use when users want to create AI-generated media — videos (Sora, Veo, Kling, WAN, Seedance, Grok, LTX, Aurora), images (DALL·E, GPT Image, Flux, Nano Banana, Kling, Grok, Zyka Helion, Qwen), TTS (ElevenLabs, Chatterbox, Qwen3, MiniMax, Fish Audio), talking heads, or AI apps (upscale, face swap, captions, dubbing, etc.).
homepage: https://zyka.ai
repository: https://github.com/kshitijdixit/zyka-sdk
license: MIT
---

# Zyka AI Media Generation (SDK)

Generate AI videos, images, voice, and use AI-powered apps via the `zyka-sdk` Node library. 40+ AI models in one API.

## Setup

The `zyka-sdk` library is published on npm: https://www.npmjs.com/package/zyka-sdk

**One-time per project:**

```bash
# in your project directory (or any working directory)
npm init -y                    # if you don't already have package.json
npm install zyka-sdk
```

Set your API key (required — get one at https://zyka.ai/settings/api-keys):

```bash
# bash / zsh
export ZYKA_API_KEY=zk_live_...

# PowerShell
$env:ZYKA_API_KEY = "zk_live_..."
```

## CRITICAL: Use the SDK via Node scripts

When a user asks to generate media, **write a small Node script that uses `ZykaClient`** and run it with `node`. Each method auto-uploads local files, auto-waits for completion, and auto-downloads the output when `output` is provided.

Standard pattern for any one-off generation:

```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
const client = new ZykaClient();
client.METHOD(PARAMS, { output: './FILE' })
  .then(r => console.log('Done:', r.outputUrl))
  .catch(e => { console.error(e); process.exit(1); });
"
```

For multi-step or parameter-heavy work, write a `.js` file and run `node script.js` instead of using `-e`.

---

## Generate Videos

```js
const { ZykaClient } = require('zyka-sdk');
const client = new ZykaClient();
const result = await client.createVideo(
  { model: 'wan', prompt: 'A cinematic sunset over mountains', duration: 5 },
  { output: './sunset.mp4' }
);
```

### Video Models

| Model | `model` value | Key options |
|---|---|---|
| OpenAI Sora | `sora` | `sub_model: 'sora-2'`, `seconds: '4'/'8'/'12'`, `size: '1280x720'` |
| Google Veo | `veo` | `sub_model: 'veo-3.1-generate-001'`, `seconds: '4'-'8'`, `aspect_ratio: '16:9'` |
| Kling AI | `kling` | `sub_model: 'kling-v2-master'`, `duration: '5'/'10'`, `aspect_ratio: '16:9'`, `mode: 'std'/'pro'` |
| Kling V3 / O3 | `kling` | `sub_model: 'kling-v3'`/`'kling-o3'`, `duration: '3'-'15'`, `image_url: './img.jpg'` |
| ByteDance Seedance | `bytedance` | `sub_model: 'Seedance V1.5 Pro'`/`'2.0'`/`'2.0 Fast'`, `duration: '4'-'12'`, `resolution: '720p'` |
| ByteDance OmniHuman | `bytedance` | `sub_model: 'OmniHuman'`, `image_url: './face.jpg'`, `audio_url: './speech.mp3'` |
| Alibaba WAN T2V | `wan` | `sub_model: 'wan-2-6-t2v'`, `duration: 5/10/15`, `size: '1280*720'` |
| Alibaba WAN I2V | `wan` | `sub_model: 'wan-2-6-i2v'`, `image_url: './img.jpg'`, `duration: 5/10/15` |
| WAN Animate | `wan` | `sub_model: 'wan-v2-2-animate-replace'`, `video_url: './vid.mp4'`, `image_url: './char.png'` |
| Talking Head | `infinite_talk` | `image_url: './face.jpg'`, `audio_url: './speech.mp3'` |
| Aurora (Lip Sync) | `aurora` | `video_url: './face.mp4'`, `audio_url: './speech.mp3'` |
| LTX | `ltx` | `sub_model: 'ltx-2.3-text-to-video'`/`'ltx-2.3-image-to-video'` |
| Grok Video | `grok` | `sub_model: 'grok-imagine-video'`, `duration: '6'`, `resolution: '720p'` |

### Video Examples

**Text to video:**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createVideo(
  { model: 'wan', prompt: 'A cinematic sunset over mountains', duration: 5 },
  { output: './sunset.mp4' }
).then(r => console.log(r.outputUrl));
"
```

**Image to video:**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createVideo(
  { model: 'kling', sub_model: 'kling-v2-master', prompt: 'gentle zoom with wind', image_url: './photo.jpg', duration: '5', aspect_ratio: '16:9', mode: 'pro' },
  { output: './animated.mp4' }
).then(r => console.log(r.outputUrl));
"
```

**Talking head:**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createVideo(
  { model: 'infinite_talk', image_url: './face.jpg', audio_url: './speech.mp3' },
  { output: './talking.mp4' }
).then(r => console.log(r.outputUrl));
"
```

**Aurora lip sync:**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createVideo(
  { model: 'aurora', video_url: './face.mp4', audio_url: './speech.mp3' },
  { output: './lipsync.mp4' }
).then(r => console.log(r.outputUrl));
"
```

---

## Generate Images

```js
const result = await client.createImage(
  { model: 'nano_banana', prompt: 'A neon cyberpunk city' },
  { output: './city.png' }
);
```

### Image Models

| Model | `model` value | Notes |
|---|---|---|
| Nano Banana | `nano_banana` | `sub_model: 'nano-banana-1'` (default), `'nano-banana-pro'` (4K), `'nano-banana-2'` (fast 4K) |
| DALL·E 2 | `dall_e_2` | `size: '256x256'/'512x512'/'1024x1024'` |
| DALL·E 3 | `dall_e_3` | `quality: 'standard'/'hd'`, `style: 'vivid'/'natural'` |
| GPT Image 1 / 1.5 / 2 | `gpt_image_1`, `gpt_image_1_5`, `gpt_image_2` | `background: 'transparent'`, `quality: 'auto'/'low'/'medium'/'high'` |
| Flux | `flux_1_schnell`, `flux_2_dev`, `flux_2_klein_9b` | Various quality/speed tradeoffs |
| Kling Image | `kling` | `sub_model: 'kling-v3'`/`'kling-image-o1'`/`'omni-image'` |
| Stable Diffusion | `stable_diffusion_xl_base_1_0`, `stable_diffusion_v1_5_img2img` | `negative_prompt`, requires `image` for img2img |
| Leonardo | `lucid_origin`, `phoenix_1_0` | High quality |
| Zyka Helion | `zyka_helion` | Fast Zyka-native |
| Grok Imagine | `grok_imagine` | xAI |
| Qwen Image 2 Pro | `qwen_image_2_pro` | Chinese/English |

### Image Examples

**Generate from text:**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createImage(
  { model: 'gpt_image_1', prompt: 'A neon cyberpunk cityscape' },
  { output: './city.png' }
).then(r => console.log(r.outputUrl));
"
```

**Edit an existing image:**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createImage(
  { model: 'nano_banana', sub_model: 'nano-banana-pro', prompt: 'make the hair straight', image: './me.png' },
  { output: './result.png' }
).then(r => console.log(r.outputUrl));
"
```

**Transparent background:**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createImage(
  { model: 'gpt_image_1', prompt: 'product photo of sneakers', background: 'transparent' },
  { output: './sneakers.png' }
).then(r => console.log(r.outputUrl));
"
```

---

## Generate Text-to-Speech

```js
const result = await client.createTTS(
  { provider: 'elevenlabs', voice_id: 'VOICE_ID', script: 'Welcome to Zyka' },
  { output: './speech.mp3' }
);
```

### TTS Providers

| Provider | `provider` value | Notes |
|---|---|---|
| ElevenLabs | `elevenlabs` | Needs `voice_id`. `model: 'eleven_multilingual_v2'`/`'eleven_v3'` |
| Qwen3 | `qwen3` | Voice design / clone / custom |
| Chatterbox | `chatterbox` | Clone + emotion tags `[happy]`, `[sad]`, etc. |
| VoxCPM / VoxCPM2 | `voxcpm`, `voxcpm2` | Voice cloning, 30 languages on v2 |
| MiniMax | `minimax` | 17 preset voices, `emotion`, `channel` |
| Fish Audio | `fish-audio` | Instant voice cloning |
| Sarvam | `sarvam` | Indian languages, `target_language_code`, `speaker` |
| Gemini TTS | `gemini-tts` | Google, single/multi-speaker |

### TTS Examples

**ElevenLabs:**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createTTS(
  { provider: 'elevenlabs', voice_id: 'VOICE_ID', script: 'Welcome to Zyka' },
  { output: './speech.mp3' }
).then(r => console.log(r.outputUrl));
"
```

**Voice clone (Chatterbox):**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createTTS(
  { provider: 'chatterbox', actual_voice_url: './my-voice.mp3', script: '[happy] This sounds like me!' },
  { output: './cloned.mp3' }
).then(r => console.log(r.outputUrl));
"
```

---

## AI Apps

All apps follow the same pattern: `client.METHOD(params, { output: './file' })`.

### Image Apps
| App | Method | Params |
|---|---|---|
| Upscale | `createUpscale()` | `{ image, resolution: '1k'/'2k'/'4k' }` |
| Face Swap | `createFaceSwap()` | `{ type: 'image'/'video', url, face_image }` |
| Virtual Try-On | `createVirtualTryOn()` | `{ human_image, cloth_image }` |
| Outfit Swap | `createOutfitSwap()` | `{ user_image, character_image }` |
| Skin Enhancer | `createSkinEnhancer()` | `{ image, type: 'perfect_skin'/'realistic_skin' }` |
| Camera Angles | `createAngles()` | `{ image, angle: { azimuth, elevation } }` |
| 9 Shorts | `createNineShorts()` | `{ image }` |
| Zooms | `createZooms()` | `{ image }` |
| Story Generator | `createStoryGenerator()` | `{ image }` |
| Image to SVG | `createImageToSvg()` | `{ image_url }` |
| Holi Special | `createHoliSpecial()` | `{ image }` |
| Simple App | `createSimpleApp()` | `{ image, app_id?, prompt? }` |

### Video Apps
| App | Method | Params |
|---|---|---|
| Caption Generator | `createCaptionGenerator()` | `{ url, language?, output_mode?: 'video'/'srt'/'both' }` |
| Video to Script | `createVideoToScript()` | `{ url, script_style? }` |
| Video Cleaner | `createVideoCleaner()` | `{ url, language? }` |
| Video Upscaler | `createVideoUpscaler()` | `{ video_url, target_resolution: '1080p'/'2k'/'4k' }` |
| Video Dubbing | `createVideoDubbing()` | `{ video_url, model: 'heygen'/'elevenlabs'/'sarvam', output_language }` |
| Short Video Creator | `createShortVideoCreator()` | `{ url, clip_duration_sec }` |
| B-roll | `createBroll()` | `{ url, broll_duration_sec? }` |
| YouTube Downloader | `createYouTubeDownloader()` | `{ url, quality?, format? }` |
| Voice Changer | `createVoiceChanger()` | `{ source_audio_url, target_voice_id?, voice_id? }` |
| Voice Isolation | `createVoiceIsolation()` | `{ source_audio_url }` |

### App Example

**Upscale to 4K:**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createUpscale(
  { image: './photo.jpg', resolution: '4k' }
).then(r => require('fs').promises.writeFile('./upscaled.jpg', Buffer.from(r.outputUrl)));
" 
# or just use the {output} option:
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createUpscale(
  { image: './photo.jpg', resolution: '4k' },
  { output: './upscaled.jpg' }
).then(r => console.log(r.outputUrl));
"
```

**Video Dubbing (Hindi):**
```bash
node -e "
const { ZykaClient } = require('zyka-sdk');
new ZykaClient().createVideoDubbing(
  { video_url: './video.mp4', model: 'heygen', output_language: 'Hindi (India)', mode: 'precision' },
  { output: './dubbed.mp4' }
).then(r => console.log(r.outputUrl));
"
```

---

## Auth (API key resolution)

The SDK resolves the API key in this order:
1. `new ZykaClient({ apiKey: 'zk_live_...' })`
2. `ZYKA_API_KEY` env var (preferred)
3. `~/.zyka/config.json`

## Guidelines

- **Always use the SDK via Node** — write `node -e '...'` for one-shots, write a `.js` file for multi-step work.
- Set `ZYKA_API_KEY` in env before invoking.
- Use `{ output: './file' }` to auto-download results to disk.
- Pass local file paths (`'./photo.png'`) for any `image`/`audio`/`video`/`image_url`/etc. param — the SDK auto-uploads.
- All `createX()` methods auto-wait for completion by default; pass `{ waitForCompletion: false }` to fire-and-forget.
- When editing images, default to `{ model: 'nano_banana', sub_model: 'nano-banana-pro' }`.
- When generating videos from text, default to `{ model: 'wan' }`.
- When animating images to video, default to `{ model: 'kling', sub_model: 'kling-v2-master' }`.
- For 4K images, use `{ model: 'nano_banana', sub_model: 'nano-banana-2', resolution: '4K' }`.
- For fast image generation, use `{ model: 'zyka_helion' }` or `{ model: 'flux_1_schnell' }`.
- For transparent backgrounds, use `{ model: 'gpt_image_1', background: 'transparent' }`.

## Security & Privacy

- **Outbound data flow:** any local files referenced (images, audio, video) are uploaded to Zyka's API. Zyka proxies generation requests to third-party providers (OpenAI, Google, ByteDance, ElevenLabs, etc.). Don't pass private personal data, proprietary content, credentials, or files you don't want third parties to see. Review https://zyka.ai/privacy and https://zyka.ai/terms-and-conditions.
- **API key handling:** treat `ZYKA_API_KEY` as a service secret. Use a least-privilege key, never commit it. Monitor usage in your Zyka dashboard.
- **Autonomous use:** the agent can call Zyka endpoints (and spend credits) without an extra prompt once the skill is enabled. Use interactively if you want explicit confirmation per call.
