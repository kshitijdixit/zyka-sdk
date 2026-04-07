import type { Command } from 'commander';

interface AppResult {
  id: string;
  status: string;
  outputUrl?: string;
  outputUrls?: string[];
}

function printResult(result: AppResult, opts: { output?: string | boolean }): void {
  console.log(`✅ Status: ${result.status}`);
  if (result.outputUrl) console.log(`📎 URL: ${result.outputUrl}`);
  if (result.outputUrls?.length) console.log(`📎 URLs: ${result.outputUrls.join(', ')}`);
  if (opts.output) console.log(`💾 Saved to: ${opts.output}`);
  console.log(`🆔 ID: ${result.id}\n`);
}

export function registerGenerateApps(generate: Command): void {

  // ── Image Apps ──────────────────────────────────────────────────

  generate
    .command('upscale')
    .description('Upscale an image to higher resolution')
    .requiredOption('--image <path>', 'Image URL or local path')
    .option('--resolution <res>', 'Output resolution: 1k, 2k, 4k (default: 2k)', '2k')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n🔍 Upscaling image...');
      try {
        const result = await client.createUpscale({ image: opts.image as string, resolution: opts.resolution as any });
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('face-swap')
    .description('Swap a face in an image or video')
    .requiredOption('--type <image|video>', 'Output type: image or video')
    .requiredOption('--url <path>', 'Source media URL or local path')
    .requiredOption('--face <path>', 'Face image URL or local path')
    .option('--prompt <text>', 'Additional prompt')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n😶 Swapping face...');
      try {
        const params: any = { type: opts.type, url: opts.url, face_image: opts.face };
        if (opts.prompt) params.prompt = opts.prompt;
        const result = await client.createFaceSwap(params);
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('skin-enhancer')
    .description('Enhance skin in an image')
    .requiredOption('--image <path>', 'Image URL or local path')
    .option('--type <type>', 'Skin type: perfect_skin, realistic_skin, imperfect_skin')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n✨ Enhancing skin...');
      try {
        const params: any = { image: opts.image };
        if (opts.type) params.type = opts.type;
        const result = await client.createSkinEnhancer(params);
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('behind-the-scene')
    .description('Generate a behind-the-scene film effect')
    .requiredOption('--image <path>', 'Image URL or local path')
    .requiredOption('--type <image|video>', 'Output type: image or video')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n🎬 Generating behind-the-scene...');
      try {
        const result = await client.createBehindTheScene({ image: opts.image as string, type: opts.type as any });
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('angles')
    .description('Generate an image from a new camera angle')
    .requiredOption('--image <path>', 'Image URL or local path')
    .requiredOption('--angle <value>', 'Camera angle (e.g. front, left, right, or JSON {azimuth,elevation})')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n📐 Generating camera angle...');
      try {
        let angle: any = opts.angle;
        try { angle = JSON.parse(opts.angle as string); } catch {}
        const result = await client.createAngles({ image: opts.image as string, angle });
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('nine-shorts')
    .description('Generate 9 unique shots from different angles')
    .requiredOption('--image <path>', 'Image URL or local path')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n9️⃣  Generating nine shorts...');
      try {
        const result = await client.createNineShorts({ image: opts.image as string });
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('zooms')
    .description('Generate 9 progressive zoom levels')
    .requiredOption('--image <path>', 'Image URL or local path')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n🔭 Generating zooms...');
      try {
        const result = await client.createZooms({ image: opts.image as string });
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('outfit-swap')
    .description('Swap outfit from a character onto a user image')
    .requiredOption('--user-image <path>', 'User image URL or local path')
    .requiredOption('--character-image <path>', 'Character image URL or local path (outfit source)')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n👗 Swapping outfit...');
      try {
        const result = await client.createOutfitSwap({ user_image: opts.userImage as string, character_image: opts.characterImage as string });
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('virtual-try-on')
    .description('Virtual clothing try-on')
    .requiredOption('--human <path>', 'Human image URL or local path')
    .requiredOption('--cloth <path>', 'Clothing image URL or local path')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n👔 Processing virtual try-on...');
      try {
        const result = await client.createVirtualTryOn({ human_image: opts.human as string, cloth_image: opts.cloth as string });
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('holi-special')
    .description('Generate a Holi special effect on an image')
    .requiredOption('--image <path>', 'Image URL or local path')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n🎨 Generating Holi special...');
      try {
        const result = await client.createHoliSpecial({ image: opts.image as string });
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('simple-app')
    .description('Run a simple AI app tool on an image')
    .requiredOption('--image <path>', 'Image URL or local path')
    .option('--app-id <id>', 'App ID for the specific tool')
    .option('--prompt <text>', 'Additional prompt')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n🛠️  Running simple app...');
      try {
        const params: any = { image: opts.image };
        if (opts.appId) params.app_id = opts.appId;
        if (opts.prompt) params.prompt = opts.prompt;
        const result = await client.createSimpleApp(params);
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  // ── Video Processing Apps ───────────────────────────────────────

  generate
    .command('caption')
    .description('Auto-caption a video')
    .requiredOption('--url <path>', 'Video URL or local path')
    .option('--language <code>', 'Language code (e.g. en, hi, es)')
    .option('--title <title>', 'Title for the job')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n📝 Generating captions...');
      try {
        const params: any = { url: opts.url };
        if (opts.language) params.language = opts.language;
        if (opts.title) params.title = opts.title;
        const result = await client.createCaptionGenerator(params, {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        });
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('video-to-script')
    .description('Extract a script from a video')
    .requiredOption('--url <path>', 'Video URL or local path')
    .option('--language <code>', 'Language code')
    .option('--script-style <style>', 'Script style: general, screenplay, blog_post, social_media, documentary')
    .option('--title <title>', 'Title for the job')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n📄 Extracting script from video...');
      try {
        const params: any = { url: opts.url };
        if (opts.language) params.language = opts.language;
        if (opts.scriptStyle) params.script_style = opts.scriptStyle;
        if (opts.title) params.title = opts.title;
        const result = await client.createVideoToScript(params, {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        });
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('video-cleaner')
    .description('Remove filler words and clean up a video')
    .requiredOption('--url <path>', 'Video URL or local path')
    .option('--language <code>', 'Language code')
    .option('--title <title>', 'Title for the job')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n🧹 Cleaning video...');
      try {
        const params: any = { url: opts.url };
        if (opts.language) params.language = opts.language;
        if (opts.title) params.title = opts.title;
        const result = await client.createVideoCleaner(params, {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        });
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('video-upscaler')
    .description('Upscale a video to higher resolution')
    .requiredOption('--url <path>', 'Video URL or local path')
    .option('--resolution <res>', 'Target resolution: 1080p, 2k, 4k')
    .option('--fps <fps>', 'Target frame rate: 30fps, 60fps')
    .option('--title <title>', 'Title for the job')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n📺 Upscaling video...');
      try {
        const params: any = { video_url: opts.url };
        if (opts.resolution) params.target_resolution = opts.resolution;
        if (opts.fps) params.target_fps = opts.fps;
        if (opts.title) params.title = opts.title;
        const result = await client.createVideoUpscaler(params, {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        });
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('video-dubbing')
    .description('Dub a video to another language')
    .requiredOption('--url <path>', 'Video URL or local path')
    .requiredOption('--language <code>', 'Output language (e.g. Hindi (India), Spanish, French)')
    .option('--mode <speed|precision>', 'Processing mode: speed or precision')
    .option('--enable-caption', 'Add caption overlay to dubbed video')
    .option('--audio-only', 'Translate audio only (no lip sync)')
    .option('--title <title>', 'Title for the job')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n🌍 Dubbing video...');
      try {
        const params: any = { video_url: opts.url, output_language: opts.language };
        if (opts.mode) params.mode = opts.mode;
        if (opts.enableCaption) params.enable_caption = true;
        if (opts.audioOnly) params.translate_audio_only = true;
        if (opts.title) params.title = opts.title;
        const result = await client.createVideoDubbing(params, {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        });
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('short-video')
    .description('Extract viral short clips from a video')
    .requiredOption('--url <path>', 'Video URL or local path (min 60s)')
    .requiredOption('--duration <n|auto>', 'Clip duration in seconds or "auto" (e.g. 15, 30, 45, auto)')
    .option('--language <code>', 'Language code')
    .option('--aspect-ratio <ratio>', 'Aspect ratio: auto, 9:16, 1:1, 16:9')
    .option('--max-clips <n|auto>', 'Max number of clips: 1-20 or auto')
    .option('--title <title>', 'Title for the job')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n✂️  Creating short video clips...');
      try {
        const durStr = opts.duration as string;
        const clipDuration: any = durStr === 'auto' ? 'auto' : parseInt(durStr, 10);
        const params: any = { url: opts.url, clip_duration_sec: clipDuration };
        if (opts.language) params.language = opts.language;
        if (opts.aspectRatio) params.aspect_ratio = opts.aspectRatio;
        if (opts.maxClips) params.max_clips = opts.maxClips === 'auto' ? 'auto' : parseInt(opts.maxClips as string, 10);
        if (opts.title) params.title = opts.title;
        const result = await client.createShortVideoCreator(params, {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        });
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('broll')
    .description('Insert B-roll stock footage into a video')
    .requiredOption('--url <path>', 'Video URL or local path (min 10s)')
    .option('--duration <n|auto>', 'B-roll duration per insertion (2-10 or auto)')
    .option('--max-insertions <n|auto>', 'Max number of insertions (1-20 or auto)')
    .option('--aspect-ratio <ratio>', 'Aspect ratio: auto, 9:16, 1:1, 16:9')
    .option('--language <code>', 'Language code')
    .option('--title <title>', 'Title for the job')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n🎥 Inserting B-roll...');
      try {
        const params: any = { url: opts.url };
        if (opts.duration) params.broll_duration_sec = opts.duration === 'auto' ? 'auto' : parseInt(opts.duration as string, 10);
        if (opts.maxInsertions) params.max_insertions = opts.maxInsertions === 'auto' ? 'auto' : parseInt(opts.maxInsertions as string, 10);
        if (opts.aspectRatio) params.aspect_ratio = opts.aspectRatio;
        if (opts.language) params.language = opts.language;
        if (opts.title) params.title = opts.title;
        const result = await client.createBroll(params, {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        });
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('story-generator')
    .description('Generate a 3x3 cinematic story grid from an image')
    .requiredOption('--image <path>', 'Character image URL or local path')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n📖 Generating story...');
      try {
        const result = await client.createStoryGenerator({ image: opts.image as string });
        if (opts.output) {
          const { downloadFile } = await import('zyka-sdk');
          if (result.outputUrl) await downloadFile(result.outputUrl, opts.output as string);
        }
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  // ── Utility Apps ────────────────────────────────────────────────

  generate
    .command('youtube-download')
    .description('Download a YouTube video')
    .requiredOption('--url <url>', 'YouTube video URL')
    .option('--quality <res>', 'Quality: 360p, 480p, 720p, 1080p')
    .option('--format <fmt>', 'Format: mp4, mp3')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n⬇️  Downloading YouTube video...');
      try {
        const params: any = { url: opts.url };
        if (opts.quality) params.quality = opts.quality;
        if (opts.format) params.format = opts.format;
        const result = await client.createYouTubeDownloader(params, {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        });
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });

  generate
    .command('voice-changer')
    .description('Change the voice in an audio file')
    .requiredOption('--audio <path>', 'Audio URL or local path to transform')
    .option('--voice-id <id>', 'Target voice ID')
    .option('--voice <path>', 'Reference voice audio URL or local path (for cloning)')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();
      console.log('\n🎙️  Changing voice...');
      try {
        const params: any = { audio_url: opts.audio };
        if (opts.voiceId) params.voice_id = opts.voiceId;
        if (opts.voice) params.actual_voice_url = opts.voice;
        const result = await client.createVoiceChanger(params, {
          waitForCompletion: opts.wait !== false,
          output: opts.output as string | undefined,
        });
        printResult(result, opts);
      } catch (err: any) { console.error(`\n❌ Error: ${err.message}\n`); process.exit(1); }
    });
}
