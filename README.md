# Zyka SDK

**Programmatic AI media generation** — the developer's way to orchestrate [Zyka](https://zyka.ai)'s AI APIs.

Think of it like [Remotion](https://remotion.dev) for AI generation: instead of React components rendering video frames, you write typed **pipeline definitions** (compositions + scenes) and the SDK orchestrates Zyka's API calls, polls for results, and delivers output URLs.

---

## Quick Start

```bash
# Install
npm install zyka-sdk

# Scaffold a starter project
npx zyka init my-video-project
cd my-video-project

# Set your API token
npx zyka auth login
# or: export ZYKA_API_TOKEN=your_token_here

# Run your first composition
npx zyka render my-video.zyka.js --inputs '{"prompt":"A cinematic sunrise over mountains"}'
```

---

## Core Concepts

### Composition

A **composition** is a named pipeline of AI generation steps.

```typescript
import { composition, scene, renderVideo, renderTTS } from 'zyka-sdk';
import { z } from 'zod';

const MyAd = composition({
  id: 'my-ad',

  inputSchema: z.object({
    tagline: z.string(),
    voiceId: z.string(),
  }),

  scenes: [
    // Scene 1: Generate background video
    scene('background', async ({ inputs, config }) =>
      renderVideo({
        model: 'kling-v2',
        prompt: `Cinematic luxury ad background`,
        duration: 6,
        aspect_ratio: '16:9',
      }, config)
    ),

    // Scene 2: Generate voiceover (runs in parallel with Scene 1)
    scene('voiceover', async ({ inputs, config }) =>
      renderTTS({ voice_id: inputs.voiceId, text: inputs.tagline }, config)
    ),
  ],
});

export default MyAd;
```

### Scene Dependencies

Use `useAsset(sceneId)` to access the output of a completed upstream scene:

```typescript
scene(
  'upscaled',
  async ({ useAsset, config }) => {
    const hero = useAsset('hero-image');    // get output of a previous scene
    return renderImage({ model: 'real-esrgan', image: hero.outputUrl! }, config);
  },
  ['hero-image']  // declare dependency — this scene waits for 'hero-image'
),
```

---

## API Reference

### Render Helpers

| Function | Description |
|---|---|
| `renderVideo(params, config?)` | Generate a video clip |
| `renderImage(params, config?)` | Generate an image |
| `renderTTS(params, config?)` | Generate text-to-speech audio |
| `renderUpscale(params, config?)` | Upscale an image |
| `renderFaceSwap(params, config?)` | Face swap |
| `renderVirtualTryOn(params, config?)` | Virtual try-on |
| `renderOutfitSwap(params, config?)` | Outfit swap |
| `renderSkinEnhancer(params, config?)` | Skin enhancement |
| `renderBehindTheScene(params, config?)` | Behind-the-scene effect |
| `refinePrompt(text, type?, config?)` | AI prompt refinement |

### `composition(config)`

Declare a named pipeline.

### `scene(id, fn, dependsOn?)`

Declare a single pipeline step.

### `render(composition, inputs, config?, options?)`

Execute a composition and return a `ZykaRenderResult`.

---

## CLI

```bash
npx zyka init <project-name>              # Scaffold a new project
npx zyka render <file> --inputs '<json>'  # Run a composition
npx zyka auth login                       # Save your API token
npx zyka auth whoami                      # Show saved token info
npx zyka auth logout                      # Remove saved token
npx zyka studio                           # Browser dashboard (Phase 2)
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `ZYKA_API_TOKEN` | Your Zyka JWT token (from app.zyka.ai/settings) |
| `ZYKA_API_URL` | Override API base URL (default: `https://api.zyka.ai`) |

---

## Examples

| Example | Description |
|---|---|
| [`examples/product-ad/`](./examples/product-ad/) | Background video + product upscale + TTS voiceover |
| [`examples/social-video/`](./examples/social-video/) | AI image + caption audio + upscale (with dependency) |

---

## Project Structure

```
zyka-sdk/
├── packages/
│   ├── core/          # Main SDK — types, client, composition, runner, helpers
│   └── cli/           # CLI tool (npx zyka ...)
├── examples/
│   ├── product-ad/
│   └── social-video/
└── templates/
    └── starter/
```

---

## License

MIT — © Zyka AI
