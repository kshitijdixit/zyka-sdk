---
name: zyka-ai-media
description: Generate AI videos, images, and voice using the Zyka SDK. Use this when users want to create AI-generated media — videos (Sora, Veo, Kling, WAN), images (DALL·E, GPT Image, Flux, Nano Banana), text-to-speech (ElevenLabs, Chatterbox), or talking head videos. Supports local file uploads, auto-waiting, and auto-download.
---

# Zyka SDK — AI Media Generation

Generate videos, images, and voice programmatically using Zyka's unified API.

## Setup

```bash
npm install zyka-sdk
```

Authentication — set your API key:
```bash
export ZYKA_API_KEY=zk_live_...
```

Or pass it directly:
```js
const { ZykaClient } = require('zyka-sdk');
const client = new ZykaClient({ apiKey: 'zk_live_...' });
```

## Key Behaviors
- **Local files** are auto-uploaded. Pass `'./photo.png'` instead of a URL.
- **Auto-wait** is on by default. `await client.createVideo(...)` returns when the video is ready.
- **Auto-download** with the `output` option: `{ output: './result.mp4' }`.

---

## Video Generation

```js
const result = await client.createVideo({
  model: 'MODEL_NAME',
  prompt: 'description of what to generate',
  // model-specific params below
});
console.log(result.outputUrl);
```

### Available Video Models

| Model | `model` value | Key params |
|---|---|---|
| OpenAI Sora | `sora` | `sub_model: 'sora-2'`, `seconds: '4'/'8'/'12'`, `size: '1280x720'` |
| Google Veo | `veo` | `sub_model: 'veo-3.0-generate-001'`, `seconds: '4'-'8'`, `aspect_ratio: '16:9'/'9:16'` |
| Kling AI | `kling` | `sub_model: 'kling-v2-master'`, `duration: '5'/'10'`, `aspect_ratio: '16:9'` |
| ByteDance Seedance | `bytedance` | `sub_model: 'Seedance V1.5 Pro'`, `duration: '4'-'12'`, `resolution: '1080p'` |
| Alibaba WAN | `wan` | `sub_model: 'wan-2-6-t2v'`, `duration: 5/10/15` |
| Talking Head | `infinite_talk` | `image_url: './face.jpg'`, `audio_url: './speech.mp3'` |

### Video Examples

**Text to video:**
```js
await client.createVideo({
  model: 'wan',
  prompt: 'A cinematic sunset over mountains with golden light',
  duration: 5
});
```

**Image to video (animate a photo):**
```js
await client.createVideo({
  model: 'kling',
  sub_model: 'kling-v2-master',
  prompt: 'gentle camera zoom in with wind blowing',
  image_url: './photo.jpg',
  duration: '5',
  aspect_ratio: '16:9'
});
```

**Talking head (lip sync):**
```js
await client.createVideo({
  model: 'infinite_talk',
  image_url: './face.jpg',
  audio_url: './speech.mp3'
});
```

---

## Image Generation

```js
const result = await client.createImage({
  model: 'MODEL_NAME',
  prompt: 'description',
}, { output: './result.png' });
```

### Available Image Models

| Model | `model` value | Notes |
|---|---|---|
| Nano Banana | `nano_banana` | Sub-models: `nano-banana-1`, `nano-banana-pro`. Good for edits. |
| DALL·E 3 | `dall_e_3` | Quality: `'standard'`/`'hd'` |
| GPT Image 1 | `gpt_image_1` | Supports `background: 'transparent'` |
| GPT Image 1.5 | `gpt_image_1_5` | Latest OpenAI model |
| Flux Schnell | `flux_1_schnell` | Fast generation |
| Flux 2 Dev | `flux_2_dev` | High quality |
| Kling Image | `kling` | Sub-models: `kling-v1` to `kling-image-v3` |
| Stable Diffusion XL | `stable_diffusion_xl_base_1_0` | Classic SD |
| SD 1.5 img2img | `stable_diffusion_v1_5_img2img` | Requires `image` input |
| Lucid Origin | `lucid_origin` | Leonardo |
| Phoenix 1.0 | `phoenix_1_0` | Phoenix |
| Z Image Turbo | `z_image_turbo` | Fast |

### Image Examples

**Generate from text:**
```js
await client.createImage({
  model: 'gpt_image_1',
  prompt: 'A neon-lit cyberpunk cityscape at night'
}, { output: './city.png' });
```

**Edit an existing image:**
```js
await client.createImage({
  model: 'nano_banana',
  sub_model: 'nano-banana-pro',
  image: './photo.png',
  prompt: 'make the background a tropical beach'
}, { output: './edited.png' });
```

**Transparent background:**
```js
await client.createImage({
  model: 'gpt_image_1',
  prompt: 'a cute cartoon cat mascot',
  background: 'transparent'
}, { output: './mascot.png' });
```

---

## Text-to-Speech (TTS)

```js
const result = await client.createTTS({
  provider: 'PROVIDER_NAME',
  script: 'Text to speak',
  // provider-specific params
});
```

### Available TTS Providers

| Provider | `provider` value | Notes |
|---|---|---|
| ElevenLabs | `elevenlabs` | Requires `voice_id` |
| Qwen3 | `qwen3` | Voice design, clone, custom |
| Chatterbox | `chatterbox` | Voice cloning + emotion |
| VoxCPM | `voxcpm` | Voice cloning |
| MiniMax | `minimax` | 17 preset voices |
| Moss TTS | `moss-tts` | RunPod-based |

### TTS Examples

**Generate speech:**
```js
await client.createTTS({
  provider: 'elevenlabs',
  voice_id: 'voice-id-here',
  script: 'Welcome to Zyka, the AI media generation platform.'
}, { output: './speech.mp3' });
```

**Clone a voice:**
```js
await client.createTTS({
  provider: 'chatterbox',
  actual_voice_url: './my-voice.mp3',
  script: 'This sounds just like me!',
  exaggeration: 0.5
}, { output: './cloned.mp3' });
```

---

## API Methods

| Method | Description |
|---|---|
| `client.createVideo(params, opts?)` | Video generation (auto-waits) |
| `client.createImage(params, opts?)` | Image generation (auto-waits) |
| `client.createTTS(params, opts?)` | Text-to-speech (auto-waits) |
| `client.pollUntilComplete(id, type)` | Manual polling |

**Options:** `{ waitForCompletion?: boolean, output?: string, timeoutMs?: number }`

## Auth Priority
1. `config.apiKey` → 2. `ZYKA_API_KEY` env → 3. `config.token` → 4. `ZYKA_API_TOKEN` env → 5. `~/.zyka/config.json`
