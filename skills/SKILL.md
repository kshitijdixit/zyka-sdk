---
name: zyka-ai
description: Generate AI videos, images, voice, and use AI apps (upscale, face swap, captions, video dubbing, etc.) using the Zyka CLI (npm package 'zyka'). Use this skill when users want to create AI-generated media — videos (Sora, Veo, Kling, WAN, Seedance, Grok), images (DALL·E, GPT Image, Flux, Nano Banana, Kling, Grok, Zyka Helion, Qwen), text-to-speech (ElevenLabs, Chatterbox, Qwen3, MiniMax, Fish Audio), talking head videos, or AI apps. Run CLI commands directly — no code needed.
---

# Zyka AI Media Generation

Generate AI videos, images, and voice directly from the terminal using the `zyka` CLI. One command, 40+ AI models. No code writing required.

## Setup

The CLI is available via npx (no install needed) or can be installed globally:
```bash
npx zyka --help
# or install globally:
npm install -g zyka
```

Set your API key:
```bash
export ZYKA_API_KEY=zk_live_...
```

Users can get an API key at https://zyka.ai/settings/api-keys

## IMPORTANT: Always use CLI commands, never write code scripts

When a user asks to generate media, **run the `npx zyka generate` command directly** — do NOT write JavaScript files or scripts. The CLI handles everything: file uploads, waiting for completion, and downloading results.
