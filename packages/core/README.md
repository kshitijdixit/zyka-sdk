# zyka-sdk

Core library for [Zyka](https://zyka.ai) — AI media generation platform. Generate videos, images, and voice with 30+ AI models through one unified API.

## Quick Start (CLI — Recommended)

The fastest way to use Zyka is via the CLI. No code needed:

```bash
# Generate an image
npx zyka generate image -m gpt_image_1 -p "A neon cyberpunk cityscape" -o ./city.png

# Edit an existing image
npx zyka generate image -m nano_banana -s nano-banana-pro -p "make the hair straight" --image ./me.png -o ./result.png

# Generate a video
npx zyka generate video -m wan -p "A cinematic sunset over mountains" -d 5 -o ./sunset.mp4

# Animate a photo
npx zyka generate video -m kling -s kling-v2-master -p "gentle zoom with wind" --image ./photo.jpg -o ./animated.mp4

# Text-to-speech
npx zyka generate tts --provider elevenlabs --voice-id YOUR_VOICE_ID --script "Hello world" -o ./speech.mp3
```

## Setup

Get your API key at [zyka.ai/settings/api-keys](https://zyka.ai/settings/api-keys) and set it:

```bash
export ZYKA_API_KEY=zk_live_...
```

## Programmatic Usage

```bash
npm install zyka-sdk
```

```js
const { ZykaClient } = require('zyka-sdk');
const client = new ZykaClient({ apiKey: 'zk_live_...' });

// Generate an image
const result = await client.createImage({
  model: 'gpt_image_1',
  prompt: 'A beautiful mountain landscape'
}, { output: './landscape.png' });

// Generate a video
const video = await client.createVideo({
  model: 'wan',
  prompt: 'A cinematic sunset timelapse',
  duration: 5
}, { output: './sunset.mp4' });

// Text-to-speech
const audio = await client.createTTS({
  provider: 'elevenlabs',
  voice_id: 'your-voice-id',
  script: 'Welcome to Zyka!'
}, { output: './welcome.mp3' });
```

## Key Features

- **30+ AI models** — Sora, Veo, Kling, DALL·E, GPT Image, Flux, ElevenLabs, and more
- **Auto-upload** — Pass local files (`./photo.png`) and they're uploaded automatically
- **Auto-wait** — All methods wait for completion by default, no polling needed
- **Auto-download** — Use `{ output: './file.mp4' }` to save results to disk
- **CLI included** — Use `npx zyka generate` for zero-code generation

## Supported Models

### Video
Sora, Veo, Kling, WAN, Seedance, Infinite Talk (talking heads)

### Image
DALL·E 3, GPT Image 1/1.5, Flux Schnell/Dev, Nano Banana, Stable Diffusion XL, Kling Image, Z Image Turbo

### Text-to-Speech
ElevenLabs, Qwen3, Chatterbox, MiniMax, VoxCPM

## Links

- [CLI package (`zyka`)](https://www.npmjs.com/package/zyka)
- [GitHub](https://github.com/kshitijdixit/zyka-sdk)
- [Website](https://zyka.ai)

## License

MIT
