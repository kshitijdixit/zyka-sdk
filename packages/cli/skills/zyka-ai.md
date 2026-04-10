<!-- zyka-skill-version: 0.3.0 -->
---
name: zyka-ai
description: Generate AI videos, images, voice, and use AI apps using the Zyka CLI. Use when users want to create AI-generated media — videos (Sora, Veo, Kling, WAN, Seedance, Grok), images (DALL·E, GPT Image, Flux, Nano Banana, Kling, Grok, Zyka Helion, Qwen), TTS (ElevenLabs, Chatterbox, Qwen3, MiniMax, Fish Audio), talking heads, or AI apps (upscale, face swap, captions, dubbing, etc.).
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

## CRITICAL: Always use CLI commands, never write code scripts

When a user asks to generate media, **run the `npx zyka generate` command directly** — do NOT write JavaScript files. The CLI handles file uploads, waiting, and downloading.

---

## Generate Videos

```bash
npx zyka generate video -m MODEL -p "prompt" [options]
```

### Video Models

| Model | `-m` value | Key options |
|---|---|---|
| OpenAI Sora | `sora` | `-s sora-2`, `-d 4/8/12`, `--size 1280x720` |
| Google Veo | `veo` | `-s veo-3.1-generate-001`, `-d 4-8`, `-a 16:9/9:16`, `--size 720p/1080p/4k` |
| Kling AI | `kling` | `-s kling-v2-master`, `-d 5/10`, `-a 16:9`, `--mode std/pro` |
| Kling V3 | `kling` | `-s kling-v3` or `kling-v3-pro`, `-d 3-15`, `--first-frame ./img.jpg` |
| Kling O3 | `kling` | `-s kling-o3` or `kling-o3-pro`, `-d 3-15` |
| Kling Omni | `kling` | `-s kling-video-o1`, `-d 3-10` |
| Kling Multi-Image | `kling` | `-s multi-image-to-video` (pass image_list via SDK) |
| ByteDance Seedance V1.5 Pro | `bytedance` | `-s "Seedance V1.5 Pro"`, `-d 4-12`, `--resolution 720p` |
| ByteDance Seedance 2.0 | `bytedance` | `-s "Seedance 2.0"`, `-d 4-12`, `--resolution 720p` |
| ByteDance Seedance 2.0 Fast | `bytedance` | `-s "Seedance 2.0 Fast"`, `-d 4-12`, `--resolution 720p` |
| ByteDance OmniHuman | `bytedance` | `-s "OmniHuman"`, `--image ./face.jpg --audio ./speech.mp3` |
| ByteDance OmniHuman v1.5 | `bytedance` | `-s "OmniHuman v1.5"`, `--image ./face.jpg --audio ./speech.mp3` |
| Alibaba WAN T2V | `wan` | `-s wan-2-6-t2v`, `-d 5/10/15`, `--size 1280*720` |
| Alibaba WAN 2.7 | `wan` | `-s wan-2-7`, `-d 5/10/15`, `--size 1280*720` |
| Alibaba WAN I2V | `wan` | `-s wan-2-6-i2v`, `--image ./img.jpg`, `-d 5/10/15` |
| Alibaba WAN I2V 2.5 | `wan` | `-s wan-2-5-i2v`, `--image ./img.jpg`, `-d 5/10/15` |
| WAN Animate Replace | `wan` | `-s wan-v2-2-animate-replace`, `--video ./vid.mp4 --image ./char.png` |
| WAN Animate Move | `wan` | `-s wan-v2-2-animate-move`, `--video ./vid.mp4 --image ./char.png` |
| Talking Head | `infinite_talk` | `--image ./face.jpg --audio ./speech.mp3` |
| Aurora (Lip Sync) | `aurora` | `--video ./face.mp4 --audio ./speech.mp3` |
| LTX Video T2V | `ltx` | `-s ltx-2.3-text-to-video` |
| LTX Video I2V | `ltx` | `-s ltx-2.3-image-to-video`, `--image ./img.jpg` |
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

**First/last frame interpolation:**
```bash
npx zyka generate video -m veo -s veo-3.1-generate-001 -p "smooth transition" --first-frame ./start.jpg --last-frame ./end.jpg -d 8 -a 16:9 -o ./transition.mp4
```

**Grok video:**
```bash
npx zyka generate video -m grok -p "Medieval knight in mystical forest" -d 6 --resolution 720p -o ./knight.mp4
```

**WAN animate replace (swap character in video):**
```bash
npx zyka generate video -m wan -s wan-v2-2-animate-replace --video ./original.mp4 --image ./new-character.png --resolution 480p -o ./swapped.mp4
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
| Flux 2 Klein 9B | `flux_2_klein_9b` | Compact high quality |
| Kling Image | `kling` | `-s kling-v1`, `kling-v2`, `kling-image-v3`, `kling-image-v3-text-to-image`, `omni-image`, `kling-image-o1`, `multi-image-to-image` |
| SD XL | `stable_diffusion_xl_base_1_0` | `--negative-prompt "blurry"` |
| SD img2img | `stable_diffusion_v1_5_img2img` | Needs `--image` |
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
npx zyka generate image -m nano_banana -s nano-banana-2 -p "cinematic portrait" --resolution 4K --size 5504x3072 -o ./portrait.png
```

**Transparent background:**
```bash
npx zyka generate image -m gpt_image_1 -p "product photo of sneakers" --background transparent -o ./sneakers.png
```

**Grok image:**
```bash
npx zyka generate image -m grok_imagine -p "Abstract golden particles, data visualization style" -o ./abstract.png
```

**Qwen image:**
```bash
npx zyka generate image -m qwen_image_2_pro -p "A serene mountain landscape at sunset" -o ./landscape.png
```

**Zyka Helion (fast):**
```bash
npx zyka generate image -m zyka_helion -p "cyberpunk cat in neon city" -o ./cat.png
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
| Chatterbox | `chatterbox` | Clone + emotion tags `[happy]`, `[sad]`, `[angry]`, `[calm]` |
| VoxCPM | `voxcpm` | Voice cloning only (requires reference audio) |
| MiniMax | `minimax` | 17 preset voices (Wise_Woman, Friendly_Person, Deep_Voice_Man, etc.) |
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

**MiniMax preset voice:**
```bash
npx zyka generate tts --provider minimax --script "Hello! Welcome to MiniMax TTS." -o ./minimax.mp3
```

---

## AI Apps (via SDK)

These apps are available through the `ZykaClient` SDK:

```js
const { ZykaClient } = require('zyka-sdk');
const client = new ZykaClient();
```

### Image Apps
| App | Method | Params |
|---|---|---|
| Upscale | `createUpscale()` | `{ image, resolution: '1k'/'2k'/'4k' }` |
| Face Swap | `createFaceSwap()` | `{ type: 'image'/'video', url, face_image }` |
| Virtual Try-On | `createVirtualTryOn()` | `{ human_image, cloth_image }` |
| Outfit Swap | `createOutfitSwap()` | `{ user_image, character_image }` |
| Skin Enhancer | `createSkinEnhancer()` | `{ image, type: 'perfect_skin'/'realistic_skin'/'imperfect_skin' }` |
| Behind the Scene | `createBehindTheScene()` | `{ image, type: 'image'/'video' }` |
| Camera Angles | `createAngles()` | `{ image, angle: { azimuth, elevation } }` |
| 9 Shorts | `createNineShorts()` | `{ image }` |
| Zooms | `createZooms()` | `{ image }` |
| Story Generator | `createStoryGenerator()` | `{ image }` |

### Video Apps
| App | Method | Params |
|---|---|---|
| Caption Generator | `createCaptionGenerator()` | `{ url, language?, caption_style? }` |
| Video to Script | `createVideoToScript()` | `{ url, script_style?: 'general'/'screenplay'/'blog_post'/'social_media'/'documentary' }` |
| Video Cleaner | `createVideoCleaner()` | `{ url, language? }` |
| Video Upscaler | `createVideoUpscaler()` | `{ video_url, target_resolution: '1080p'/'2k'/'4k', target_fps: '30fps'/'60fps' }` |
| Video Dubbing (HeyGen) | `createVideoDubbing()` | `{ video_url, model: 'heygen', output_language: 'Hindi (India)', mode?, enable_caption?, enable_speech_enhancement?, translate_audio_only? }` |
| Video Dubbing (ElevenLabs) | `createVideoDubbing()` | `{ video_url, model: 'elevenlabs', output_language: 'hi', source_lang?, num_speakers?, highest_resolution?, drop_background_audio?, use_profanity_filter? }` |
| Video Dubbing (Sarvam) | `createVideoDubbing()` | `{ video_url, model: 'sarvam', output_language: 'Hindi' (or comma-separated), source_lang?, num_speakers?, genre?: 'general'/'news'/'entertainment'/'education'/'sports'/'religious' }` |
| Dubbing Languages | `getVideoDubbingLanguages(model)` | model: `'heygen'`/`'elevenlabs'`/`'sarvam'` — returns supported languages |
| Short Video Creator | `createShortVideoCreator()` | `{ url, clip_duration_sec: 'auto'/5/15/30/45 }` |
| B-roll | `createBroll()` | `{ url, broll_duration_sec?: 'auto'/2-10 }` |
| YouTube Downloader | `createYouTubeDownloader()` | `{ url, quality?: '720p', format?: 'mp4' }` |
| Voice Changer | `createVoiceChanger()` | `{ source_audio_url, target_voice_url?, voice_strength? }` |
| Image to SVG | `createImageToSvg()` | `{ image_url }` |

### CLI App Commands
```bash
npx zyka generate voice-changer --audio ./input.mp3 --voice ./reference.mp3 -o ./output.mp3
npx zyka generate image-to-svg --image ./photo.png -o ./result.svg
npx zyka generate upscale --image ./photo.jpg --resolution 4k -o ./upscaled.jpg
npx zyka generate face-swap --type image --url ./target.jpg --face ./face.jpg -o ./result.jpg
npx zyka generate caption --url ./video.mp4 --language en -o ./captioned.mp4
npx zyka generate video-dubbing --url ./video.mp4 --model heygen --language "Hindi (India)" --mode precision -o ./dubbed.mp4
npx zyka generate video-dubbing --url ./video.mp4 --model elevenlabs --language hi --source-lang en --num-speakers 2 --highest-resolution -o ./dubbed.mp4
npx zyka generate video-dubbing --url ./video.mp4 --model sarvam --language "Hindi,Tamil" --genre education -o ./dubbed.mp4
npx zyka generate short-video --url ./long.mp4 --duration auto -o ./clips/
npx zyka generate youtube-download --url "https://youtube.com/watch?v=..." --quality 720p -o ./video.mp4
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
- For transparent backgrounds, use `-m gpt_image_1 --background transparent`

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
