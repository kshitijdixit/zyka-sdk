# Zyka SDK — Claude Code Skill

## What This Repo Is

A programmatic AI media generation SDK (like Remotion, but for Zyka's AI APIs).
Developers write typed pipeline definitions ("compositions") and the SDK orchestrates Zyka API calls.

## Package Structure

| Package | Path | npm name |
|---------|------|----------|
| Core SDK | `packages/core/` | `zyka-sdk` |
| CLI binary | `packages/cli/` | `zyka` (binary) |

## Build

```bash
pnpm install          # install all workspace deps
pnpm --filter zyka-sdk build   # compile core SDK → packages/core/dist/
pnpm --filter zyka build       # compile CLI  → packages/cli/dist/
```

## Test Run a Composition

The CLI binary is at `packages/cli/dist/index.js`. Always use compiled `.js` files with the CLI:

```bash
# 1. Set token
export ZYKA_API_TOKEN=your_jwt_token_here
# or: node packages/cli/dist/index.js auth login

# 2. Write a test composition (see examples/ folder)
cp examples/social-video/social-video.zyka.ts /tmp/test.ts
# Compile it: npx tsc --skipLibCheck --module commonjs /tmp/test.ts --outDir /tmp/out

# 3. Run it
node packages/cli/dist/index.js render /tmp/out/test.js \
  --inputs '{"imagePrompt":"a glowing city","captionText":"Hello world","voiceId":"YOUR_VOICE_ID"}'
```

## Core SDK API

Located in `packages/core/src/`:
- `types.ts` — all TypeScript types
- `client.ts` — HTTP client (uses Node built-in http/https, token from `ZYKA_API_TOKEN` or `~/.zyka/config.json`)
- `composition.ts` — `composition()` and `scene()` factories
- `runner.ts` — `render()` — executes pipeline, polls status, resolves dependencies
- `helpers.ts` — `renderVideo()`, `renderImage()`, `renderTTS()`, `renderUpscale()`, etc.

## CLI Commands

```bash
node packages/cli/dist/index.js --help
node packages/cli/dist/index.js auth login
node packages/cli/dist/index.js auth whoami
node packages/cli/dist/index.js init <project-name>
node packages/cli/dist/index.js render <file.js> --inputs '<json>'
```

## Key Convention

- Compositions must be **compiled JS** at runtime (the CLI uses `require()`)
- Token priority: constructor param → `ZYKA_API_TOKEN` env → `~/.zyka/config.json`
- Polling: exponential wait, default 5 min timeout, 3s poll interval
- All generation responses follow `{ status: 'success', data: { ... } }`
