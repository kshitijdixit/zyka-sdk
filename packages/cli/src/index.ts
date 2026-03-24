#!/usr/bin/env node
import { Command } from 'commander';
import { authLogin, authWhoami, authLogout } from './commands/auth';
import { init } from './commands/init';
import { runRender } from './commands/render';

const program = new Command();

program
  .name('zyka')
  .description('Zyka SDK CLI — programmatic AI media generation')
  .version('0.3.0');

// ── zyka auth ────────────────────────────────

const auth = program.command('auth').description('Manage Zyka API authentication');

auth
  .command('login')
  .description('Save your Zyka API token')
  .action(async () => {
    await authLogin();
  });

auth
  .command('whoami')
  .description('Show currently saved token info')
  .action(() => {
    authWhoami();
  });

auth
  .command('logout')
  .description('Remove saved token')
  .action(() => {
    authLogout();
  });

// ── zyka init ────────────────────────────────

program
  .command('init <project-name>')
  .description('Scaffold a new Zyka project')
  .action(async (projectName: string) => {
    await init(projectName);
  });

// ── zyka render ──────────────────────────────

program
  .command('render <file>')
  .description('Run a Zyka composition file')
  .option('-i, --inputs <json>', 'JSON string of input parameters', '{}')
  .option('-o, --output <path>', 'Write result JSON to this file path')
  .option('--silent', 'Suppress progress output')
  .action(async (file: string, opts: { inputs?: string; output?: string; silent?: boolean }) => {
    await runRender(file, opts);
  });

// ── zyka generate ───────────────────────────

const generate = program.command('generate').description('Generate media (image, video, or TTS) directly from the CLI');

generate
  .command('video')
  .description('Generate a video from a text prompt')
  .requiredOption('-m, --model <model>', 'Video model (sora, veo, kling, bytedance, wan, infinite_talk, grok)')
  .requiredOption('-p, --prompt <prompt>', 'Text prompt')
  .option('-s, --sub-model <sub_model>', 'Model variant (e.g. sora-2, veo-3.1-generate-001)')
  .option('-d, --duration <duration>', 'Duration in seconds')
  .option('-a, --aspect-ratio <ratio>', 'Aspect ratio (16:9, 9:16, 1:1)')
  .option('--image <path>', 'Image URL or local path (for image-to-video)')
  .option('--audio <path>', 'Audio URL or local path (for infinite_talk, wan)')
  .option('--video <path>', 'Video URL or local path (for V2V)')
  .option('--negative-prompt <text>', 'Negative prompt (what to avoid)')
  .option('--mode <mode>', 'Generation mode: std or pro (Kling)')
  .option('--resolution <res>', 'Resolution: 480p, 720p, 1080p')
  .option('--first-frame <path>', 'First frame image path or URL')
  .option('--last-frame <path>', 'Last frame image path or URL')
  .option('--size <size>', 'Output size (e.g. 1280x720, 720p)')
  .option('--title <title>', 'Title for the generation job')
  .option('-o, --output <path>', 'Download result to this file path')
  .option('--no-wait', 'Return immediately without waiting for completion')
  .action(async (opts: Record<string, string | boolean>) => {
    const { ZykaClient } = await import('zyka-sdk');
    const client = new ZykaClient();

    const params: Record<string, unknown> = {
      model: opts.model,
      prompt: opts.prompt,
    };
    if (opts.subModel) params.sub_model = opts.subModel;
    if (opts.duration) params.duration = opts.duration;
    if (opts.aspectRatio) params.aspect_ratio = opts.aspectRatio;
    if (opts.image) params.image_url = opts.image;
    if (opts.audio) params.audio_url = opts.audio;
    if (opts.video) params.video_url = opts.video;
    if (opts.negativePrompt) params.negative_prompt = opts.negativePrompt;
    if (opts.mode) params.mode = opts.mode;
    if (opts.resolution) params.resolution = opts.resolution;
    if (opts.firstFrame) params.first_frame = opts.firstFrame;
    if (opts.lastFrame) params.last_frame = opts.lastFrame;
    if (opts.size) params.size = opts.size;
    if (opts.title) params.title = opts.title;

    console.log(`\n🎬 Generating video with model: ${params.model}...`);
    try {
      const result = await client.createVideo(
        params as any,
        {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        }
      );
      console.log(`✅ Status: ${result.status}`);
      if (result.outputUrl) console.log(`📎 URL: ${result.outputUrl}`);
      if (opts.output) console.log(`💾 Saved to: ${opts.output}`);
      console.log(`🆔 ID: ${result.id}\n`);
    } catch (err: any) {
      console.error(`\n❌ Error: ${err.message}\n`);
      process.exit(1);
    }
  });

generate
  .command('image')
  .description('Generate an image from a text prompt')
  .requiredOption('-m, --model <model>', 'Image model (nano_banana, dall_e_3, gpt_image_1, flux_1_schnell, grok_imagine, zyka_helion, etc.)')
  .requiredOption('-p, --prompt <prompt>', 'Text prompt')
  .option('-s, --sub-model <sub_model>', 'Model variant (e.g. nano-banana-pro, nano-banana-2)')
  .option('--size <size>', 'Output size (e.g. 1024x1024)')
  .option('--image <path>', 'Input image URL or local path (for img2img)')
  .option('--negative-prompt <text>', 'Negative prompt (what to avoid)')
  .option('--resolution <res>', 'Resolution: 1K, 2K, 4K (Nano Banana Pro/2)')
  .option('--quality <quality>', 'Quality: standard, hd, auto, low, medium, high')
  .option('--background <bg>', 'Background: transparent, opaque, auto (GPT Image)')
  .option('--style <style>', 'Style: vivid, natural (DALL-E 3)')
  .option('-n, --count <n>', 'Number of images to generate')
  .option('--title <title>', 'Title for the generation job')
  .option('-o, --output <path>', 'Download result to this file path')
  .option('--no-wait', 'Return immediately without waiting for completion')
  .action(async (opts: Record<string, string | boolean>) => {
    const { ZykaClient } = await import('zyka-sdk');
    const client = new ZykaClient();

    const params: Record<string, unknown> = {
      model: opts.model,
      prompt: opts.prompt,
    };
    if (opts.subModel) params.sub_model = opts.subModel;
    if (opts.size) params.size = opts.size;
    if (opts.image) params.image = opts.image;
    if (opts.negativePrompt) params.negative_prompt = opts.negativePrompt;
    if (opts.resolution) params.resolution = opts.resolution;
    if (opts.quality) params.quality = opts.quality;
    if (opts.background) params.background = opts.background;
    if (opts.style) params.style = opts.style;
    if (opts.count) params.n = parseInt(opts.count as string, 10);
    if (opts.title) params.title = opts.title;

    console.log(`\n🖼️  Generating image with model: ${params.model}...`);
    try {
      const result = await client.createImage(
        params as any,
        {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        }
      );
      console.log(`✅ Status: ${result.status}`);
      if (result.outputUrl) console.log(`📎 URL: ${result.outputUrl}`);
      if (opts.output) console.log(`💾 Saved to: ${opts.output}`);
      console.log(`🆔 ID: ${result.id}\n`);
    } catch (err: any) {
      console.error(`\n❌ Error: ${err.message}\n`);
      process.exit(1);
    }
  });

generate
  .command('tts')
  .description('Generate text-to-speech audio')
  .requiredOption('--script <text>', 'Text to convert to speech')
  .option('--provider <provider>', 'TTS provider (elevenlabs, qwen3, chatterbox, minimax, etc.)', 'elevenlabs')
  .option('--voice-id <id>', 'Voice ID')
  .option('--voice <path>', 'Voice reference audio URL or local path (for cloning)')
  .option('-o, --output <path>', 'Download result to this file path')
  .option('--no-wait', 'Return immediately without waiting for completion')
  .action(async (opts: Record<string, string | boolean>) => {
    const { ZykaClient } = await import('zyka-sdk');
    const client = new ZykaClient();

    const params: Record<string, unknown> = {
      script: opts.script,
      provider: opts.provider || 'elevenlabs',
    };
    if (opts.voiceId) params.voice_id = opts.voiceId;
    if (opts.voice) params.actual_voice_url = opts.voice;

    console.log(`\n🔊 Generating TTS with ${params.provider}...`);
    try {
      const result = await client.createTTS(
        params as any,
        {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        }
      );
      console.log(`✅ Status: ${result.status}`);
      if (result.outputUrl) console.log(`📎 URL: ${result.outputUrl}`);
      if (opts.output) console.log(`💾 Saved to: ${opts.output}`);
      console.log(`🆔 ID: ${result.id}\n`);
    } catch (err: any) {
      console.error(`\n❌ Error: ${err.message}\n`);
      process.exit(1);
    }
  });

program.parse(process.argv);
