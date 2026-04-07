import type { Command } from 'commander';

export function registerGenerateVideo(generate: Command): void {
  generate
    .command('video')
    .description('Generate a video from a text prompt')
    .requiredOption('-m, --model <model>', 'Video model (sora, veo, kling, bytedance, wan, infinite_talk, grok, ltx)')
    .requiredOption('-p, --prompt <prompt>', 'Text prompt')
    .option('-s, --sub-model <sub_model>', 'Model variant (e.g. sora-2, veo-3.1-generate-001, Seedance 2.0, ltx-2.3-text-to-video)')
    .option('-d, --duration <duration>', 'Duration in seconds')
    .option('-a, --aspect-ratio <ratio>', 'Aspect ratio (16:9, 9:16, 1:1)')
    .option('--image <path>', 'Image URL or local path (for image-to-video)')
    .option('--audio <path>', 'Audio URL or local path (for infinite_talk, wan)')
    .option('--audio-2 <path>', 'Second audio URL or local path (for infinite_talk multi-person)')
    .option('--video <path>', 'Video URL or local path (for V2V)')
    .option('--negative-prompt <text>', 'Negative prompt (what to avoid)')
    .option('--mode <mode>', 'Generation mode: std or pro (Kling)')
    .option('--resolution <res>', 'Resolution: 480p, 720p, 1080p (Bytedance)')
    .option('--first-frame <path>', 'First frame image path or URL (Veo 3.1)')
    .option('--last-frame <path>', 'Last frame image path or URL (Veo 3.1)')
    .option('--size <size>', 'Output size (e.g. 1280x720, 720p)')
    .option('--sound <on|off>', 'Generate sound: on or off (Kling v2-6+)')
    .option('--keep-original-sound <yes|no>', 'Keep original sound from reference video (Kling motion-control)')
    .option('--character-orientation <image|video>', 'Character orientation: image or video (Kling motion-control)')
    .option('--cfg-scale <n>', 'CFG scale 0-1 (Kling v1/v1-6)')
    .option('--video-quality <level>', 'Video quality: low, medium, high, maximum (WAN)')
    .option('--enable-prompt-expansion', 'Enable prompt expansion (WAN)')
    .option('--guidance-scale <n>', 'Guidance scale (WAN)')
    .option('--num-inference-steps <n>', 'Number of inference steps (WAN)')
    .option('--camera-fixed', 'Keep camera fixed (Bytedance)')
    .option('--turbo-mode', 'Enable turbo mode (Bytedance OmniHuman v1.5)')
    .option('--input-type <image|video>', 'Input type: image or video (Infinite Talk)')
    .option('--person-count <single|multi>', 'Person count: single or multi (Infinite Talk)')
    .option('--width <n>', 'Output width in pixels (Infinite Talk)')
    .option('--height <n>', 'Output height in pixels (Infinite Talk)')
    .option('--seed <n>', 'Seed for reproducibility')
    .option('--title <title>', 'Title for the generation job')
    .option('--description <text>', 'Description for the generation job')
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
      if (opts.audio2) params.audio_url_2 = opts.audio2;
      if (opts.video) params.video_url = opts.video;
      if (opts.negativePrompt) params.negative_prompt = opts.negativePrompt;
      if (opts.mode) params.mode = opts.mode;
      if (opts.resolution) params.resolution = opts.resolution;
      if (opts.firstFrame) params.first_frame = opts.firstFrame;
      if (opts.lastFrame) params.last_frame = opts.lastFrame;
      if (opts.size) params.size = opts.size;
      if (opts.sound) params.sound = opts.sound;
      if (opts.keepOriginalSound) params.keep_original_sound = opts.keepOriginalSound;
      if (opts.characterOrientation) params.character_orientation = opts.characterOrientation;
      if (opts.cfgScale) params.cfg_scale = parseFloat(opts.cfgScale as string);
      if (opts.videoQuality) params.video_quality = opts.videoQuality;
      if (opts.enablePromptExpansion) params.enable_prompt_expansion = true;
      if (opts.guidanceScale) params.guidance_scale = parseFloat(opts.guidanceScale as string);
      if (opts.numInferenceSteps) params.num_inference_steps = parseInt(opts.numInferenceSteps as string, 10);
      if (opts.cameraFixed) params.camera_fixed = true;
      if (opts.turboMode) params.turbo_mode = true;
      if (opts.inputType) params.input_type = opts.inputType;
      if (opts.personCount) params.person_count = opts.personCount;
      if (opts.width) params.width = parseInt(opts.width as string, 10);
      if (opts.height) params.height = parseInt(opts.height as string, 10);
      if (opts.seed) params.seed = parseInt(opts.seed as string, 10);
      if (opts.title) params.title = opts.title;
      if (opts.description) params.description = opts.description;

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
}
