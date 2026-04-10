---
name: zyka-ai
description: Generate AI videos, images, voice, and use AI apps (upscale, face swap, captions, video dubbing, etc.) using the Zyka CLI. Use this skill when users want to create AI-generated media — videos (Sora, Veo, Kling, WAN, Seedance, Grok), images (DALL·E, GPT Image, Flux, Nano Banana, Kling, Grok, Zyka Helion, Qwen), text-to-speech (ElevenLabs, Chatterbox, Qwen3, MiniMax, Fish Audio), talking heads, or AI apps. Run CLI commands directly — no code needed.
---

# Zyka AI Media Generation

Generate AI videos, images, voice, and use AI-powered apps directly from the terminal using the `zyka` CLI. One command, 40+ AI models. No code writing required.

## Setup

```bash
npx zyka --help          # no install needed
npm install -g zyka      # or install globally
```

Set your API key:
```bash
export ZYKA_API_KEY=zk_live_...
```

Get an API key at https://zyka.ai/settings/api-keys

## IMPORTANT: Always use CLI commands, never write code scripts

When a user asks to generate media, **run the `npx zyka generate` command directly** — do NOT write JavaScript files. The CLI handles file uploads, waiting, and downloading.

---

## Generate Videos

```bash
npx zyka generate video -m MODEL -p "prompt" [options]
```

### Video Models & Examples

| Model | `-m` value | Key options |
|---|---|---|
| OpenAI Sora | `sora` | `-s sora-2`, `-d 4/8/12`, `--size 1280x720` |
| Google Veo | `veo` | `-s veo-3.1-generate-001`, `-d 4-8`, `-a 16:9/9:16`, `--size 720p/1080p/4k` |
| Kling AI | `kling` | `-s kling-v2-master`, `-d 5/10`, `-a 16:9`, `--mode std/pro` |
| Kling V3 | `kling` | `-s kling-v3` or `kling-v3-pro`, `-d 3-15`, `--first-frame ./img.jpg` |
| Kling O3 | `kling` | `-s kling-o3` or `kling-o3-pro`, `-d 3-15` |
| Kling Omni | `kling` | `-s kling-video-o1`, `-d 3-10` |
| ByteDance Seedance | `bytedance` | `-s "Seedance V1.5 Pro"`, `-d 4-12`, `--resolution 720p` |
| ByteDance OmniHuman | `bytedance` | `-s "OmniHuman v1.5"`, `--image ./face.jpg --audio ./speech.mp3` |
| Alibaba WAN T2V | `wan` | `-s wan-2-6-t2v`, `-d 5/10/15`, `--size 1280*720` |
| Alibaba WAN I2V | `wan` | `-s wan-2-6-i2v`, `--image ./img.jpg`, `-d 5/10/15` |
| WAN Animate | `wan` | `-s wan-v2-2-animate-replace` or `wan-v2-2-animate-move`, `--video ./vid.mp4 --image ./char.png` |
| Talking Head | `infinite_talk` | `--image ./face.jpg --audio ./speech.mp3` |
| Aurora (Lip Sync) | `aurora` | `--video ./face.mp4 --audio ./speech.mp3` |
| Grok Video | `grok` | `-s grok-imagine-video`, `-d 1-15`, `--resolution 720p` |

### Video Examples

**Text to video:**
```bash
npx zyka generate video -m wan -p "A cinematic sunset over mountains" -d 5 -o ./sunset.mp4
```

**Image to video (animate a photo):**
```bash
npx zyka generate video -m kling -s kling-v2-master -p "gentle zoom in with wind" --image ./photo.jpg -d 5 -a 16:9 --mode pro -o ./animated.mp4
```

**Talking head (lip sync):**
```bash
npx zyka generate video -m infinite_talk -p "lip sync" --image ./face.jpg --audio ./speech.mp3 -o ./talking.mp4
```

**First/last frame interpolation (Veo 3.1):**
```bash
npx zyka generate video -m veo -s veo-3.1-generate-001 -p "smooth transition" --first-frame ./start.jpg --last-frame ./end.jpg -d 8 -a 16:9 -o ./transition.mp4
```

**Grok video:**
```bash
npx zyka generate video -m grok -p "Medieval knight walking through mystical forest" -d 6 --resolution 720p -o ./knight.mp4
```

---

## Generate Images

```bash
npx zyka generate image -m MODEL -p "prompt" [options]
```

### Image Models

| Model | `-m` value | Notes |
|---|---|---|
| Nano Banana | `nano_banana` | `-s nano-banana-1` (default), `nano-banana-pro` (4K), `nano-banana-2` (fast 4K) |
| DALL·E 2 | `dall_e_2` | `--size 256x256/512x512/1024x1024` |
| DALL·E 3 | `dall_e_3` | `--quality standard/hd`, `--style vivid/natural` |
| GPT Image 1 | `gpt_image_1` | `--background transparent`, `--quality auto/low/medium/high` |
| GPT Image 1 Mini | `gpt_image_1_mini` | Cheaper variant |
| GPT Image 1.5 | `gpt_image_1_5` | Latest OpenAI |
| Flux Schnell | `flux_1_schnell` | Fast |
| Flux 2 Dev | `flux_2_dev` | High quality |
| Kling Image | `kling` | `-s kling-v2`, `kling-image-v3`, `omni-image` |
| SD XL | `stable_diffusion_xl_base_1_0` | `--negative-prompt "blurry"` |
| SD img2img | `stable_diffusion_v1_5_img2img` | Needs `--image`, `--strength 0.8` |
| Lucid Origin | `lucid_origin` | Leonardo AI |
| Phoenix 1.0 | `phoenix_1_0` | Leonardo AI |
| Zyka Helion | `zyka_helion` | Fast Zyka-native |
| Grok Imagine | `grok_imagine` | xAI Grok |
| Qwen Image 2 Pro | `qwen_image_2_pro` | Chinese/English support |
| Z Image Turbo | `z_image_turbo` | Fast |

### Image Examples

**Generate from text:**
```bash
npx zyka generate image -m gpt_image_1 -p "A neon cyberpunk cityscape" -o ./city.png
```

**Edit an existing image:**
```bash
npx zyka generate image -m nano_banana -s nano-banana-pro -p "make the hair straight" --image ./me.png -o ./result.png
```

**4K high-res image:**
```bash
npx zyka generate image -m nano_banana -s nano-banana-pro -p "cinematic portrait" --resolution 4K --size 5504x3072 -o ./portrait.png
```

**Transparent background:**
```bash
npx zyka generate image -m gpt_image_1 -p "product photo of sneakers" --background transparent -o ./sneakers.png
```

**Grok image:**
```bash
npx zyka generate image -m grok_imagine -p "Abstract golden particles, data visualization style" -o ./abstract.png
```

---

## Generate Text-to-Speech

```bash
npx zyka generate tts --script "text" [options]
```

### TTS Providers

| Provider | `--provider` value | Notes |
|---|---|---|
| ElevenLabs | `elevenlabs` | Needs `--voice-id` |
| Qwen3 | `qwen3` | Voice design/clone/custom |
| Chatterbox | `chatterbox` | Clone + emotion `[happy]`, `[sad]` |
| VoxCPM | `voxcpm` | Voice cloning only |
| MiniMax | `minimax` | 17 preset voices |
| MOSS-TTS | `moss-tts` | RunPod-based |
| Fish Audio | `fish-audio` | Instant voice cloning |

### TTS Examples

**Generate speech:**
```bash
npx zyka generate tts --provider elevenlabs --voice-id VOICE_ID --script "Welcome to Zyka" -o ./speech.mp3
```

**Clone a voice:**
```bash
npx zyka generate tts --provider chatterbox --voice ./my-voice.mp3 --script "[happy] This sounds like me!" -o ./cloned.mp3
```

**Fish Audio:**
```bash
npx zyka generate tts --provider fish-audio --voice ./sample.wav --script "Hello world" -o ./fish.mp3
```

---

## AI Apps (via SDK — programmatic usage)

These apps are available through the `ZykaClient` SDK. For CLI usage, use `npx zyka generate` commands above.

```js
const { ZykaClient } = require('zyka-sdk');
const client = new ZykaClient();
```

### Image Apps
```js
// Upscale image to 4K
await client.createUpscale({ image: 'https://...', resolution: '4k' });

// Face swap (image)
await client.createFaceSwap({ type: 'image', url: 'https://target.jpg', face_image: 'https://face.jpg' });

// Face swap (video)
await client.createFaceSwap({ type: 'video', url: 'https://target.mp4', face_image: 'https://face.jpg' });

// Virtual try-on
await client.createVirtualTryOn({ human_image: 'https://person.jpg', cloth_image: 'https://dress.jpg' });

// Outfit swap
await client.createOutfitSwap({ user_image: 'https://me.jpg', character_image: 'https://celeb.jpg' });

// Skin enhancer
await client.createSkinEnhancer({ image: 'https://...', type: 'perfect_skin' });

// Behind the scene
await client.createBehindTheScene({ image: 'https://...', type: 'image' });

// Camera angles (49 credits)
await client.createAngles({ image: 'https://...', angle: { azimuth: 45, elevation: 30 } });

// 9 Shorts - 9 angle variations (99 credits)
await client.createNineShorts({ image: 'https://...' });

// Zooms - 9 progressive zoom levels (99 credits)
await client.createZooms({ image: 'https://...' });

// Story generator - 3x3 cinematic grid (99 credits)
await client.createStoryGenerator({ image: 'https://...' });
```

### Video Apps
```js
// Caption generator
await client.createCaptionGenerator({ url: 'https://video.mp4', language: 'en' });

// Video to script
await client.createVideoToScript({ url: 'https://video.mp4', script_style: 'screenplay' });

// Video cleaner (remove filler words)
await client.createVideoCleaner({ url: 'https://video.mp4' });

// Video upscaler (249 credits)
await client.createVideoUpscaler({ video_url: 'https://video.mp4', target_resolution: '4k' });

// Video dubbing (299 credits)
await client.createVideoDubbing({ video_url: 'https://video.mp4', output_language: 'Hindi (India)' });

// Short video creator - extract viral clips (99 credits)
await client.createShortVideoCreator({ url: 'https://long-video.mp4', clip_duration_sec: 'auto' });

// B-roll insertion (99 credits)
await client.createBroll({ url: 'https://video.mp4', broll_duration_sec: 'auto' });

// YouTube downloader (49 credits, link expires in 1h)
await client.createYouTubeDownloader({ url: 'https://youtube.com/watch?v=...', quality: '720p' });

// Voice changer — clone/transform voice
await client.createVoiceChanger({ source_audio_url: 'https://audio.mp3', target_voice_url: 'https://voice.mp3' });

// Image to SVG vector
await client.createImageToSvg({ image_url: 'https://photo.png' });
```

---

## Guidelines

- **ALWAYS use `npx zyka generate` CLI commands** — never write JavaScript files
- Set `ZYKA_API_KEY` env var before running commands
- Use `-o ./filename` to save results to disk (auto-downloads)
- Use `--image ./path` to pass local image files (auto-uploads)
- Use `--audio ./path` to pass local audio files (auto-uploads)
- Use `--video ./path` to pass local video files (auto-uploads)
- All commands auto-wait for completion — no polling needed
- When editing images, default to `-m nano_banana -s nano-banana-pro`
- When generating videos from text, default to `-m wan`
- When animating images to video, default to `-m kling -s kling-v2-master`
- When generating 4K images, use `-m nano_banana -s nano-banana-2 --resolution 4K`
- For fast image generation, use `-m zyka_helion` or `-m flux_1_schnell`

## CLI Options Reference

| Flag | Description |
|---|---|
| `-m, --model` | Model name (required for video/image) |
| `-p, --prompt` | Text prompt (required) |
| `-s, --sub-model` | Model variant |
| `-d, --duration` | Video duration in seconds |
| `-a, --aspect-ratio` | Aspect ratio (16:9, 9:16, 1:1) |
| `--size` | Output size (e.g. 1024x1024, 720p) |
| `--image` | Input image path (for editing/animating) |
| `--audio` | Input audio path (for talking heads) |
| `--video` | Input video path (for V2V) |
| `-o, --output` | Save result to this file path |
| `--no-wait` | Don't wait for completion |
| `--negative-prompt` | What to avoid in generation |
| `--mode` | Kling mode: std or pro |
| `--resolution` | Resolution: 480p, 720p, 1080p, 1K, 2K, 4K |
| `--first-frame` | First frame image (Kling, Veo 3.1, Bytedance) |
| `--last-frame` | Last frame image (Kling, Veo 3.1, Bytedance) |
| `--quality` | Quality: standard, hd, auto, low, medium, high |
| `--background` | GPT Image background: transparent, opaque, auto |
| `--style` | DALL-E 3 style: vivid, natural |
| `-n, --count` | Number of images to generate |
| `--title` | Title for the generation job |
