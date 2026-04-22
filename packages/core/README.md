# Zyka SDK

> TypeScript and JavaScript SDK for AI image, video, and audio generation with Zyka.

Think of it like [Remotion](https://remotion.dev) for AI generation: instead of React components rendering video frames, you write typed **pipeline definitions** (compositions + scenes) and the SDK orchestrates Zyka's API calls, polls for results, and delivers output URLs.

Zyka SDK gives developers a unified way to generate images, videos, speech, and media transformations using multiple AI models through one programmable API. It includes a low-level client for direct generation, a composition system for multi-step workflows, and a CLI for quick starts and automation.

## Why Zyka SDK?

Build AI media pipelines without manually handling uploads, polling loops, or output downloads.

### Highlights

- `🖼️` Generate images with models like GPT Image, DALL·E, Flux, Kling Image, Nano Banana, and more
- `🎬` Generate videos with models like Sora, Veo, Kling, WAN, Bytedance, and Grok Imagine Video
- `🔊` Generate TTS audio with providers like ElevenLabs, MiniMax, Qwen3, Chatterbox, and Fish Audio
- `⚡` Use a simple Node.js API with sensible defaults
- `📤` Pass local file paths and let the SDK upload them automatically
- `⏳` Wait for completion automatically or manage async jobs manually
- `💾` Download outputs directly to disk
- `🧱` Compose multi-scene AI workflows with typed inputs and dependencies
- `🛠️` Use the included CLI for auth, scaffolding, rendering, and direct generation

## Features

- `🖼️ Image Generation`
- `🎬 Video Generation`
- `🔊 Audio / TTS Generation`
- `⚡ Fast Developer API`
- `📡 Async Progress Workflows`
- `🧠 Multiple AI Models`

## Core Features

| Feature             | What it does                                                                  | Why it matters                                              |
| ------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Unified client      | One `ZykaClient` for image, video, audio, and app endpoints                   | Fewer SDKs and wrappers to manage                           |
| Auto-upload         | Detects local file paths and uploads them before API requests                 | Easier image-to-video, img2img, and voice cloning workflows |
| Auto-polling        | `createImage`, `createVideo`, and `createTTS` wait for completion by default  | No manual polling code for common use cases                 |
| Auto-download       | Save completed outputs with `output: './path.ext'`                            | Faster local testing and scripting                          |
| Multi-model support | Supports multiple providers and model families behind one API                 | Easier experimentation and model switching                  |
| Composition engine  | Define scenes, dependencies, and typed inputs                                 | Great for repeatable creative pipelines                     |
| CLI                 | `zyka auth`, `zyka init`, `zyka render`, `zyka generate`                      | Useful for prototyping and CI scripts                       |
| Prompt refinement   | Refine prompts before generation                                              | Better prompts with less manual iteration                   |
| Media apps          | Includes utility endpoints like upscaling, captioning, dubbing, and face swap | Covers more than just generation                            |

## Installation

### npm

```bash
npm install zyka-sdk
```

### yarn

```bash
yarn add zyka-sdk
```

### pnpm

```bash
pnpm add zyka-sdk
```

If you want input validation for compositions, install `zod` as well:

```bash
npm install zod
```

## Authentication

The SDK resolves credentials in this order:

1. `apiKey` passed to `new ZykaClient()`
2. `ZYKA_API_KEY`
3. `token` passed to `new ZykaClient()`
4. `ZYKA_API_TOKEN`
5. `~/.zyka/config.json`

### Recommended

```bash
export ZYKA_API_KEY=zk_live_your_api_key_here
```

### Constructor-based auth

```ts
import { ZykaClient } from "zyka-sdk";

const client = new ZykaClient({
  apiKey: "zk_live_your_api_key_here",
});
```

## Environment Variables

| Variable         | Required    | Description                      | Default                  |
| ---------------- | ----------- | -------------------------------- | ------------------------ |
| `ZYKA_API_KEY`   | Recommended | Primary API key for SDK requests | None                     |
| `ZYKA_API_TOKEN` | Optional    | Legacy bearer token fallback     | None                     |
| `ZYKA_API_URL`   | Optional    | Override the Zyka API base URL   | `https://zyka.ai/api-v2` |

## Quick Start

### JavaScript

```js
const { ZykaClient } = require("zyka-sdk");

const client = new ZykaClient({
  apiKey: process.env.ZYKA_API_KEY,
});

async function main() {
  const result = await client.createImage(
    {
      model: "gpt_image_1",
      prompt:
        "A cinematic product photo of a silver smartwatch on a black studio background",
      size: "1024x1024",
    },
    {
      output: "./outputs/watch.png",
    },
  );

  console.log(result.id);
  console.log(result.status);
  console.log(result.outputUrl);
}

main().catch(console.error);
```

### TypeScript

```ts
import { ZykaClient } from "zyka-sdk";

const client = new ZykaClient({
  apiKey: process.env.ZYKA_API_KEY,
});

async function main() {
  const video = await client.createVideo({
    model: "wan",
    prompt: "A cinematic drone shot over snow-covered mountains at sunrise",
    duration: 5,
  });

  console.log(video.outputUrl);
}

main().catch(console.error);
```

## Usage Examples

### Generate Image

```ts
import { ZykaClient } from "zyka-sdk";

const client = new ZykaClient();

const image = await client.createImage(
  {
    model: "nano_banana",
    prompt: "A neon cyberpunk street market in heavy rain",
    size: "1024x1024",
  },
  {
    output: "./outputs/cyberpunk.png",
  },
);

console.log(image.outputUrl);
```

### Generate Video

```ts
import { ZykaClient } from "zyka-sdk";

const client = new ZykaClient();

const video = await client.createVideo(
  {
    model: "kling",
    sub_model: "kling-v2-master",
    prompt:
      "A luxury perfume bottle rotating on a reflective surface with soft studio lighting",
    duration: "5",
    aspect_ratio: "16:9",
  },
  {
    output: "./outputs/perfume.mp4",
  },
);

console.log(video.status);
console.log(video.outputUrl);
```

### Generate Audio

```ts
import { ZykaClient } from "zyka-sdk";

const client = new ZykaClient();

const audio = await client.createTTS(
  {
    provider: "elevenlabs",
    voice_id: "your_voice_id",
    script: "Welcome to Zyka SDK. Let us build AI media workflows faster.",
  },
  {
    output: "./outputs/voiceover.mp3",
  },
);

console.log(audio.outputUrl);
```

### Upload Input Media

Local paths are automatically uploaded before the request is sent.

```ts
import { ZykaClient, asset } from "zyka-sdk";

const client = new ZykaClient();

const edited = await client.createImage({
  model: "nano_banana",
  image: "./assets/source-photo.jpg",
  prompt: "Turn this portrait into a high-fashion editorial photo",
});

const animated = await client.createVideo({
  model: "wan",
  sub_model: "wan-2-6-i2v",
  image_url: asset("hero.jpg"),
  prompt: "Subtle camera push-in with cinematic motion",
  duration: 5,
});
```

### Handle Streaming Responses

The SDK does not currently expose chunked/token streaming. For long-running jobs, use async polling or progress callbacks.

```ts
import { ZykaClient } from "zyka-sdk";

const client = new ZykaClient();

const pending = await client.createVideo(
  {
    model: "wan",
    prompt: "A futuristic city skyline during golden hour",
    duration: 5,
  },
  {
    waitForCompletion: false,
  },
);

console.log(`Queued job: ${pending.id}`);

const completed = await client.pollUntilComplete(pending.id, "video", {
  timeoutMs: 10 * 60 * 1000,
  pollIntervalMs: 3000,
});

console.log(completed.outputUrl);
```

Composition progress callbacks are also available:

```ts
import { composition, scene, render, renderImage, renderTTS } from "zyka-sdk";

const SocialClip = composition({
  id: "social-clip",
  scenes: [
    scene("image", ({ config }) =>
      renderImage(
        {
          model: "gpt_image_1",
          prompt: "A bold campaign poster for a sneaker brand",
        },
        config,
      ),
    ),
    scene("voice", ({ config }) =>
      renderTTS(
        {
          provider: "elevenlabs",
          voice_id: "voice_id",
          script: "New drop. Limited release. Available now.",
        },
        config,
      ),
    ),
  ],
});

await render(SocialClip, {}, undefined, {
  onSceneProgress(sceneId, result) {
    console.log(sceneId, result.status);
  },
  onSceneComplete(sceneId, result) {
    console.log(sceneId, result.outputUrl);
  },
});
```

### Error Handling

```ts
import { ZykaClient } from "zyka-sdk";

const client = new ZykaClient();

try {
  const result = await client.createImage({
    model: "gpt_image_1",
    prompt: "Minimal product photography for a ceramic mug",
  });

  console.log(result.outputUrl);
} catch (error) {
  if (error instanceof Error) {
    console.error("Zyka request failed:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Composition Workflows

For multi-step AI pipelines, use `composition()` and `scene()`.

```ts
import { composition, scene, render, renderImage, renderTTS } from "zyka-sdk";
import { z } from "zod";

const Promo = composition({
  id: "promo",
  inputSchema: z.object({
    prompt: z.string(),
    script: z.string(),
    voiceId: z.string(),
  }),
  scenes: [
    scene("hero-image", ({ inputs, config }) =>
      renderImage(
        {
          model: "gpt_image_1",
          prompt: inputs.prompt,
        },
        config,
      ),
    ),
    scene("voiceover", ({ inputs, config }) =>
      renderTTS(
        {
          provider: "elevenlabs",
          voice_id: inputs.voiceId,
          script: inputs.script,
        },
        config,
      ),
    ),
  ],
});

const result = await render(Promo, {
  prompt: "A premium travel campaign poster for Iceland",
  script: "Adventure starts where the road ends.",
  voiceId: "voice_id",
});

console.log(result.scenes["hero-image"].outputUrl);
```

## Configuration

### Client Configuration

| Option           | Type     | Required | Description                                | Default                      |
| ---------------- | -------- | -------- | ------------------------------------------ | ---------------------------- |
| `apiKey`         | `string` | No       | Preferred Zyka API key                     | `process.env.ZYKA_API_KEY`   |
| `token`          | `string` | No       | Legacy bearer token                        | `process.env.ZYKA_API_TOKEN` |
| `apiUrl`         | `string` | No       | Base URL for Zyka API                      | `https://zyka.ai/api-v2`     |
| `timeoutMs`      | `number` | No       | Max time to wait for generation completion | `300000`                     |
| `pollIntervalMs` | `number` | No       | Polling interval for async jobs            | `3000`                       |

### Common Generation Options

| Option       | Type               | Applies To          | Description                                                                | Example                                  |
| ------------ | ------------------ | ------------------- | -------------------------------------------------------------------------- | ---------------------------------------- |
| `apiKey`     | `string`           | Client              | API key used for auth                                                      | `zk_live_...`                            |
| `model`      | `string`           | Image, video, audio | Model or provider family to use                                            | `'gpt_image_1'`, `'wan'`, `'elevenlabs'` |
| `resolution` | `string`           | Image, video, apps  | Model-specific output resolution                                           | `'4K'`, `'1080p'`, `'2k'`                |
| `duration`   | `number \| string` | Video               | Output clip length in seconds                                              | `5`, `'10'`                              |
| `voice`      | `string`           | Audio               | Reference audio path or voice identifier depending on workflow             | `'./voice.mp3'`                          |
| `format`     | `string`           | Image, audio        | Output format where supported                                              | `'png'`, `'jpeg'`, `'mp3'`               |
| `streaming`  | `boolean`          | Workflow            | Not a direct SDK option today; use `waitForCompletion: false` plus polling | `false`                                  |

### Wait Options

| Option              | Type      | Description                                        | Default     |
| ------------------- | --------- | -------------------------------------------------- | ----------- |
| `waitForCompletion` | `boolean` | If `false`, returns immediately with a pending job | `true`      |
| `output`            | `string`  | Download completed output to a local path          | `undefined` |
| `timeoutMs`         | `number`  | Override wait timeout per request                  | `300000`    |
| `pollIntervalMs`    | `number`  | Override polling interval per request              | `3000`      |

## API Methods

### Primary Client Methods

| Method                    | Description                                           | Parameters                              | Example                                                              |
| ------------------------- | ----------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| `createImage()`           | Generate or edit an image                             | `ImageGenerationParams`, `WaitOptions?` | `client.createImage({ model: 'gpt_image_1', prompt: '...' })`        |
| `createVideo()`           | Generate a video                                      | `VideoGenerationParams`, `WaitOptions?` | `client.createVideo({ model: 'wan', prompt: '...' })`                |
| `createTTS()`             | Generate speech audio                                 | `TTSParams`, `WaitOptions?`             | `client.createTTS({ provider: 'elevenlabs', script: '...' })`        |
| `pollUntilComplete()`     | Poll a queued image, video, or TTS job                | `id`, `type`, polling options           | `client.pollUntilComplete(id, 'video')`                              |
| `getImage()`              | Fetch image job details                               | `id`                                    | `client.getImage(id)`                                                |
| `getImageStatus()`        | Fetch image job status                                | `id`                                    | `client.getImageStatus(id)`                                          |
| `getVideo()`              | Fetch video job details                               | `id`                                    | `client.getVideo(id)`                                                |
| `getVideoStatus()`        | Fetch video job status                                | `id`                                    | `client.getVideoStatus(id)`                                          |
| `getTTSStatus()`          | Fetch TTS job status                                  | `id`                                    | `client.getTTSStatus(id)`                                            |
| `checkStatus()`           | Generic status checker for `image`, `video`, or `tts` | `type`, `id`                            | `client.checkStatus('image', id)`                                    |
| `refinePrompt()`          | Refine a prompt for image or video generation         | `PromptRefinementParams`                | `client.refinePrompt({ user_input: '...', generate_type: 'image' })` |
| `calculateImageCredits()` | Estimate image generation credits                     | params object                           | `client.calculateImageCredits({...})`                                |
| `calculateVideoCredits()` | Estimate video generation credits                     | params object                           | `client.calculateVideoCredits({...})`                                |

### Media App Methods

| Method                      | Description                            | Parameters                                | Example                                                           |
| --------------------------- | -------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| `createUpscale()`           | Upscale an image                       | `UpscaleParams`                           | `client.createUpscale({ image: url, resolution: '4k' })`          |
| `createFaceSwap()`          | Swap faces in an image or video        | `FaceSwapParams`                          | `client.createFaceSwap({ type: 'image', url, face_image })`       |
| `createVirtualTryOn()`      | Apply clothing to a person image       | `VirtualTryOnParams`                      | `client.createVirtualTryOn({ human_image, cloth_image })`         |
| `createOutfitSwap()`        | Transfer outfit from a character image | `OutfitSwapParams`                        | `client.createOutfitSwap({ user_image, character_image })`        |
| `createSkinEnhancer()`      | Enhance portrait skin rendering        | `SkinEnhancerParams`                      | `client.createSkinEnhancer({ image, type: 'realistic_skin' })`    |
| `createBehindTheScene()`    | Create behind-the-scenes style output  | `BehindTheSceneParams`                    | `client.createBehindTheScene({ image, type: 'video' })`           |
| `createAngles()`            | Generate alternate camera angles       | `AnglesParams`                            | `client.createAngles({ image, angle: 'left' })`                   |
| `createNineShorts()`        | Generate 9 shot variations             | `NineShortsParams`                        | `client.createNineShorts({ image })`                              |
| `createZooms()`             | Generate zoom variations               | `ZoomsParams`                             | `client.createZooms({ image })`                                   |
| `createStoryGenerator()`    | Generate a cinematic story grid        | `StoryGeneratorParams`                    | `client.createStoryGenerator({ image })`                          |
| `createCaptionGenerator()`  | Caption a video or audio file (MP4, SRT, or both) | `CaptionGeneratorParams`, `WaitOptions?`  | `client.createCaptionGenerator({ url, output_mode: 'both' })`           |
| `createVideoToScript()`     | Convert video to text/script           | `VideoToScriptParams`, `WaitOptions?`     | `client.createVideoToScript({ url })`                             |
| `createVideoCleaner()`      | Remove fillers or clean a video        | `VideoCleanerParams`, `WaitOptions?`      | `client.createVideoCleaner({ url })`                              |
| `createVideoUpscaler()`     | Upscale a video                        | `VideoUpscalerParams`, `WaitOptions?`     | `client.createVideoUpscaler({ video_url })`                       |
| `createVideoDubbing()`      | Dub a video to another language (models: `heygen`, `elevenlabs`, `sarvam`) | `VideoDubbingParams`, `WaitOptions?` | `client.createVideoDubbing({ video_url, model: 'heygen', output_language: 'Hindi (India)' })` |
| `getVideoDubbingLanguages()` | Fetch supported languages for a dubbing model | `VideoDubbingModel` | `client.getVideoDubbingLanguages('elevenlabs')` |
| `createShortVideoCreator()` | Extract short clips from a video       | `ShortVideoCreatorParams`, `WaitOptions?` | `client.createShortVideoCreator({ url })`                         |
| `createBroll()`             | Add B-roll to a video                  | `BrollParams`, `WaitOptions?`             | `client.createBroll({ url })`                                     |
| `createYouTubeDownloader()` | Download a YouTube video through Zyka  | `YouTubeDownloaderParams`, `WaitOptions?` | `client.createYouTubeDownloader({ url })`                         |
| `createHoliSpecial()`       | Apply Holi color effect to an image    | `HoliSpecialParams`                       | `client.createHoliSpecial({ image })`                             |
| `createSimpleApp()`         | Run a simple app on an image           | `SimpleAppParams`                         | `client.createSimpleApp({ image, app_id: '...' })`                |
| `createVoiceChanger()`      | ElevenLabs Speech-to-Speech voice transform | `VoiceChangerParams`, `WaitOptions?` | `client.createVoiceChanger({ source_audio_url, target_voice_id: '...' })` |
| `createVoiceIsolation()`    | Isolate vocals (remove background noise/music) | `VoiceIsolationParams`, `WaitOptions?` | `client.createVoiceIsolation({ source_audio_url: './noisy.mp3' })`      |
| `createImageToSvg()`        | Convert an image to an SVG vector    | `ImageToSvgParams`                        | `client.createImageToSvg({ image: './photo.png' })`               |

### Composition Helpers

| Method          | Description                       | Parameters                                     | Example                                                        |
| --------------- | --------------------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| `composition()` | Define a multi-scene workflow     | `CompositionConfig`                            | `composition({ id: 'promo', scenes: [...] })`                  |
| `scene()`       | Define a scene and dependencies   | `id`, `fn`, `dependsOn?`                       | `scene('voice', async () => ...)`                              |
| `render()`      | Execute a composition             | `composition`, `inputs`, `config?`, `options?` | `render(Promo, inputs)`                                        |
| `renderImage()` | Scene helper for image generation | image params                                   | `renderImage({ model: 'gpt_image_1', prompt: '...' }, config)` |
| `renderVideo()` | Scene helper for video generation | video params                                   | `renderVideo({ model: 'wan', prompt: '...' }, config)`         |
| `renderTTS()`   | Scene helper for TTS              | tts params                                     | `renderTTS({ provider: 'elevenlabs', script: '...' }, config)` |
| `asset()`       | Resolve files from `public/`      | `filename`                                     | `asset('hero.jpg')`                                            |

## Supported Model Categories

| Category    | Examples                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Video       | `sora`, `veo`, `kling`, `bytedance`, `wan`, `infinite_talk`, `grok`, `ltx`, `aurora`                                                 |
| Image       | `nano_banana`, `flux_1_schnell`, `flux_2_dev`, `flux_2_klein_9b`, `dall_e_3`, `gpt_image_1`, `gpt_image_2`, `kling`, `grok_imagine`, `zyka_helion` |
| Audio / TTS | `elevenlabs`, `qwen3`, `chatterbox`, `minimax`, `voxcpm`, `voxcpm2`, `moss-tts`, `fish-audio`, `sarvam`, `gemini-tts` |

## Model Lists

Use these tables when you need the exact SDK string, the provider behind it, and the main feature it supports.

### Video Models

| Copy String            | Parent Model | Provider  | Supported Feature                         |
| ---------------------- | ------------ | --------- | ----------------------------------------- |
| `sora-2`               | `sora`       | OpenAI    | Text-to-video                             |
| `sora-2-pro`           | `sora`       | OpenAI    | Higher-end text-to-video                  |
| `veo-2.0-generate-001`        | `veo`        | Google    | Text-to-video                             |
| `veo-3.0-generate-001`        | `veo`        | Google    | Text-to-video                             |
| `veo-3.0-fast-generate-001`   | `veo`        | Google    | Fast text-to-video                        |
| `veo-3.1-generate-001`        | `veo`        | Google    | Text-to-video                             |
| `veo-3.1-fast-generate-001`   | `veo`        | Google    | Fast text-to-video                        |
| `kling-v1`                    | `kling`      | Kling AI  | Text-to-video, image-to-video             |
| `kling-v1-5`                  | `kling`      | Kling AI  | Text-to-video, image-to-video             |
| `kling-v1-6`                  | `kling`      | Kling AI  | Text-to-video, image-to-video             |
| `kling-v2-master`             | `kling`      | Kling AI  | Text-to-video, image-to-video             |
| `kling-v2-1`                  | `kling`      | Kling AI  | Text-to-video, image-to-video             |
| `kling-v2-5-turbo`            | `kling`      | Kling AI  | Fast text-to-video                        |
| `kling-v2-6`                  | `kling`      | Kling AI  | Text-to-video, image-to-video             |
| `kling-v3`                    | `kling`      | Kling AI  | Advanced video generation                 |
| `kling-v3-pro`                | `kling`      | Kling AI  | Higher-quality advanced video generation  |
| `kling-v3-pro-motion-control` | `kling`      | Kling AI  | Motion-controlled video generation        |
| `kling-o3`                    | `kling`      | Kling AI  | Advanced video generation                 |
| `kling-o3-pro`                | `kling`      | Kling AI  | Higher-quality advanced video generation  |
| `kling-o3-pro-v2v-edit`       | `kling`      | Kling AI  | Video-to-video editing                    |
| `motion-control`              | `kling`      | Kling AI  | Motion-controlled video generation        |
| `multi-image-to-video`        | `kling`      | Kling AI  | Multi-image-to-video                      |
| `kling-video-o1`              | `kling`      | Kling AI  | Advanced video generation                 |
| `Seedance V1.5 Pro`           | `bytedance`  | ByteDance | Text-to-video                             |
| `Seedance 2.0`                | `bytedance`  | ByteDance | Text-to-video                             |
| `Seedance 2.0 Fast`           | `bytedance`  | ByteDance | Fast text-to-video                        |
| `OmniHuman`                   | `bytedance`  | ByteDance | Character / human animation               |
| `OmniHuman v1.5`              | `bytedance`  | ByteDance | Character / human animation               |
| `wan-2-6-t2v`                 | `wan`        | Alibaba   | Text-to-video                             |
| `wan-2-6-i2v`                 | `wan`        | Alibaba   | Image-to-video                            |
| `wan-2-5-i2v`                 | `wan`        | Alibaba   | Image-to-video                            |
| `wan-v2-2-animate-replace`    | `wan`        | Alibaba   | Video animate replace                     |
| `wan-v2-2-animate-move`       | `wan`        | Alibaba   | Video animate move                        |
| `wan-2-7`                     | `wan`        | Alibaba   | Text-to-video                             |
| `grok-imagine-video`          | `grok`       | xAI       | Text-to-video, image-to-video             |
| `ltx-2.3-text-to-video`       | `ltx`        | LTX       | Text-to-video                             |
| `ltx-2.3-image-to-video`      | `ltx`        | LTX       | Image-to-video                            |
| `aurora`                       | `aurora`     | Sync Labs | Lip sync (video/image + audio)            |

### Image Models

| Copy String        | Parent Model       | Provider              | Supported Feature                |
| ------------------ | ------------------ | --------------------- | -------------------------------- |
| `nano-banana-1`                 | `nano_banana`                   | Google / Gemini-based | Text-to-image, image-to-image    |
| `nano-banana-pro`               | `nano_banana`                   | Google / Gemini-based | Higher-quality image generation  |
| `nano-banana-2`                 | `nano_banana`                   | Google / Gemini-based | Newer image generation variant   |
| `flux-1-schnell`                | `flux_1_schnell`                | Black Forest Labs     | Fast text-to-image               |
| `flux-2-dev`                    | `flux_2_dev`                    | Black Forest Labs     | Text-to-image                    |
| `flux-2-klein-9b`               | `flux_2_klein_9b`               | Black Forest Labs     | Text-to-image                    |
| `dall-e-2`                      | `dall_e_2`                      | OpenAI                | Text-to-image                    |
| `dall-e-3`                      | `dall_e_3`                      | OpenAI                | Text-to-image                    |
| `gpt-image-1`                   | `gpt_image_1`                   | OpenAI                | Text-to-image                    |
| `gpt-image-1-mini`              | `gpt_image_1_mini`              | OpenAI                | Text-to-image                    |
| `gpt-image-1.5`                 | `gpt_image_1_5`                 | OpenAI                | Text-to-image                    |
| `gpt-image-2`                   | `gpt_image_2`                   | OpenAI                | Text-to-image + edit via `image_list` (up to 16 refs); sizes up to 3840x2160 |
| `kling-v1`                      | `kling`                         | Kling AI              | Text-to-image                    |
| `kling-v1-5`                    | `kling`                         | Kling AI              | Text-to-image                    |
| `kling-v2`                      | `kling`                         | Kling AI              | Text-to-image                    |
| `kling-v2-new`                  | `kling`                         | Kling AI              | Text-to-image                    |
| `kling-v2-1`                    | `kling`                         | Kling AI              | Text-to-image                    |
| `omni-image`                    | `kling`                         | Kling AI              | Multi-reference image generation |
| `kling-image-o1`                | `kling`                         | Kling AI              | Advanced image generation        |
| `multi-image-to-image`          | `kling`                         | Kling AI              | Multi-image generation           |
| `kling-image-v3`                | `kling`                         | Kling AI              | Advanced image generation        |
| `kling-image-v3-text-to-image`  | `kling`                         | Kling AI              | Advanced text-to-image           |
| `lucid-origin`                  | `lucid_origin`                  | Leonardo              | Text-to-image                    |
| `phoenix-1.0`                   | `phoenix_1_0`                   | Leonardo              | Text-to-image                    |
| `stable-diffusion-xl-base-1.0`  | `stable_diffusion_xl_base_1_0`  | Stability AI          | Text-to-image                    |
| `stable-diffusion-v1-5-img2img` | `stable_diffusion_v1_5_img2img` | Stability AI          | Image-to-image                   |
| `z-image-turbo`                 | `z_image_turbo`                 | Zyka                  | Fast text-to-image               |
| `zyka-helion`                   | `zyka_helion`                   | Zyka                  | Fast text-to-image               |
| `grok-imagine-image`            | `grok_imagine`                  | xAI                   | Text-to-image                    |
| `qwen-image-2-pro`              | `qwen_image_2_pro`              | Qwen                  | Text-to-image                    |

### Audio / TTS Providers

| SDK String   | Provider          | Supported Feature                            | Notes                                 |
| ------------ | ----------------- | -------------------------------------------- | ------------------------------------- |
| `elevenlabs` | ElevenLabs        | Text-to-speech                               | Default. `voice_id` required. `model`: `eleven_multilingual_v2` / `eleven_v3` (inline [bracket] tags) |
| `qwen3`      | Qwen              | Voice design, voice clone, custom voice      | Flexible speech workflows             |
| `chatterbox` | Chatterbox        | Voice cloning, expressive speech             | Supports emotion and speed control    |
| `voxcpm`     | VoxCPM            | Voice cloning                                | Reference-audio-based workflow        |
| `voxcpm2`    | VoxCPM2           | 30 languages, Basic/Design/Clone             | `output_format`, `cfg_value`, `inference_timesteps` |
| `minimax`    | MiniMax           | Text-to-speech, preset voices, voice cloning | SDK supports clone-to-TTS flow        |
| `moss-tts`   | RunPod / MOSS-TTS | Text-to-speech                               | Hosted TTS workflow                   |
| `fish-audio` | Fish Audio        | Instant voice cloning                        | Good for reference voice generation   |
| `sarvam`     | Sarvam            | Indian-language TTS (Bulbul v2/v3)           | `target_language_code`, `speaker`, `model` (bulbul:v2/v3), `pace`, `pitch` (v2), `loudness` (v2) |
| `gemini-tts` | Google Gemini     | Single + multi-speaker TTS (30 voices)       | `voice_name`, `speakers` (max 2), `model`        |

### Video Dubbing Providers

| Model (`model` field) | Provider   | Language Format | Key Options |
| --------------------- | ---------- | --------------- | ----------- |
| `heygen`              | HeyGen     | Full name — `'Hindi (India)'` | `mode: 'speed'\|'precision'`, `enable_caption`, `enable_speech_enhancement`, `translate_audio_only` |
| `elevenlabs`          | ElevenLabs | ISO code — `'hi'` | `source_lang`, `num_speakers`, `highest_resolution`, `drop_background_audio`, `use_profanity_filter` |
| `sarvam`              | Sarvam     | Language name — `'Hindi'`; comma-separated for multi-target: `'Hindi,Tamil,Telugu'` | `source_lang`, `num_speakers`, `genre: 'general'\|'news'\|'entertainment'\|'education'\|'sports'\|'religious'` |

```js
// HeyGen — lip-sync dubbing
await client.createVideoDubbing({ video_url: './video.mp4', model: 'heygen', output_language: 'Hindi (India)', mode: 'precision' });

// ElevenLabs — high-quality voice dubbing
await client.createVideoDubbing({ video_url: './video.mp4', model: 'elevenlabs', output_language: 'hi', highest_resolution: true });

// Sarvam — multi-language Indian dubbing
await client.createVideoDubbing({ video_url: './video.mp4', model: 'sarvam', output_language: 'Hindi,Tamil', genre: 'education' });

// Fetch supported languages
const langs = await client.getVideoDubbingLanguages('heygen');
```

## CLI

The monorepo also includes a CLI package published as `zyka`.

```bash
npx zyka auth login
npx zyka auth whoami
npx zyka auth logout
npx zyka init my-zyka-project
npx zyka render ./dist/promo.js --inputs '{"prompt":"A cinematic launch video"}'
npx zyka generate image -m gpt_image_1 -p "A luxury watch ad" -o ./watch.png
npx zyka generate video -m wan -p "A drone shot over mountains" -d 5 -o ./mountains.mp4
npx zyka generate tts --provider elevenlabs --voice-id VOICE_ID --script "Welcome to Zyka" -o ./voice.mp3
```

## Rate Limits

Rate limits are enforced by the Zyka API account and plan behind your credentials. The SDK itself does not hard-code request throttling.

Recommended practices:

- Queue large workloads instead of firing many long-running jobs at once
- Use `waitForCompletion: false` for batch orchestration
- Retry transient failures with backoff in your application layer
- Monitor credits and provider-specific limits before large renders

## Error Handling

The SDK throws regular JavaScript `Error` objects when requests fail, authentication is missing, responses cannot be parsed, or jobs time out.

Common error categories:

| Error Type           | Example Cause                                                 |
| -------------------- | ------------------------------------------------------------- |
| Authentication error | Missing `ZYKA_API_KEY`, invalid token, expired credentials    |
| API error            | Invalid params, unsupported model settings, backend rejection |
| Timeout error        | Long-running job exceeded `timeoutMs`                         |
| Upload error         | Local file path does not exist or upload failed               |
| Download error       | Output file URL returned `403` or `5xx` beyond retry window   |

## Project Structure

```text
zyka-sdk/
├── examples/
│   ├── product-ad/
│   └── social-video/
├── packages/
│   ├── cli/
│   │   ├── src/
│   │   │   └── commands/
│   │   └── skills/
│   └── core/
│       ├── src/
│       └── skills/
├── skills/
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

### Folder Guide

| Path                  | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `packages/core/src`   | Main SDK client, types, helpers, composition engine, file utilities |
| `packages/cli/src`    | CLI entrypoint and commands for auth, render, and direct generation |
| `examples/`           | Real composition examples for ads and social content                |
| `skills/`             | Internal skill/docs files used by the project                       |
| `pnpm-workspace.yaml` | Workspace configuration for the monorepo                            |

## Best Practices

- Use environment variables for credentials instead of hardcoding keys
- Start with `waitForCompletion: true` during development for simpler debugging
- Switch to `waitForCompletion: false` when orchestrating many jobs
- Save outputs with the `output` option during local testing and CI verification
- Pass local file paths when convenient; the SDK will upload them automatically
- Use `zod` input schemas for compositions to catch bad inputs early
- Prefer model-specific parameters only when needed; keep first examples minimal
- Set custom `timeoutMs` for slow video workflows or large batch jobs

## Troubleshooting

### `Zyka API key not found`

Set `ZYKA_API_KEY` or pass `apiKey` to `new ZykaClient()`.

```bash
export ZYKA_API_KEY=zk_live_your_api_key_here
```

### Local file upload fails

Check that the file path exists and is readable from your current working directory.

### Job times out

Increase `timeoutMs` for slower generations.

```ts
const client = new ZykaClient({ timeoutMs: 10 * 60 * 1000 });
```

### Rendered file is not downloaded

Make sure you passed `output` in the request options and that the process has permission to write to the destination directory.

### Composition file fails in CLI

Compile TypeScript before calling `zyka render` if you are pointing the CLI at built output.

```bash
npx tsc
npx zyka render dist/my-composition.js --inputs '{}'
```

## Contributing

Contributions are welcome.

### Local development

```bash
pnpm install
pnpm build
pnpm test
```

### Useful scripts

| Command      | Description                            |
| ------------ | -------------------------------------- |
| `pnpm build` | Build all workspace packages           |
| `pnpm dev`   | Run package build watchers in parallel |
| `pnpm test`  | Run workspace tests                    |
| `pnpm lint`  | Run workspace lint scripts             |
| `pnpm clean` | Remove package build artifacts         |

Before opening a PR:

- Keep README and examples aligned with the public API
- Prefer typed examples in TypeScript when adding new docs
- Document new models or methods in the API tables
- Avoid breaking existing method names and defaults without updating examples

## License

MIT

---

Built for developers who want a practical, programmable way to generate AI media with images, videos, audio, and workflow orchestration in one SDK.
