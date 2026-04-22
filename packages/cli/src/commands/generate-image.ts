import type { Command } from 'commander';

export function registerGenerateImage(generate: Command): void {
  generate
    .command('image')
    .description('Generate an image from a text prompt')
    .requiredOption('-m, --model <model>', 'Image model (nano_banana, dall_e_3, gpt_image_1, gpt_image_2, flux_1_schnell, flux_2_klein_9b, grok_imagine, zyka_helion, kling, etc.)')
    .requiredOption('-p, --prompt <prompt>', 'Text prompt')
    .option('-s, --sub-model <sub_model>', 'Model variant (e.g. nano-banana-pro, nano-banana-2, flux-2-klein-9b, gpt-image-2)')
    .option('--size <size>', 'Output size (e.g. 1024x1024)')
    .option('--aspect-ratio <ratio>', 'Aspect ratio (16:9, 9:16, 1:1, 4:3, 3:4, auto)')
    .option('--image <path>', 'Input image URL or local path (for img2img)')
    .option('--negative-prompt <text>', 'Negative prompt (what to avoid)')
    .option('--resolution <res>', 'Resolution: 1K, 2K, 4K (Nano Banana Pro/2)')
    .option('--quality <quality>', 'Quality: standard, hd, auto, low, medium, high')
    .option('--background <bg>', 'Background: transparent, opaque, auto (GPT Image)')
    .option('--output-format <fmt>', 'Output format: png, jpeg, webp (GPT Image)')
    .option('--output-compression <n>', 'Output compression 0-100 (GPT Image)')
    .option('--style <style>', 'Style: vivid, natural (DALL-E 3)')
    .option('--steps <n>', 'Number of diffusion steps (Flux, SD)')
    .option('--strength <n>', 'img2img transformation strength 0-1')
    .option('--guidance <n>', 'Guidance scale (Lucid Origin, Phoenix, SD)')
    .option('-n, --count <n>', 'Number of images to generate')
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
      if (opts.size) params.size = opts.size;
      if (opts.aspectRatio) params.aspect_ratio = opts.aspectRatio;
      if (opts.image) params.image = opts.image;
      if (opts.negativePrompt) params.negative_prompt = opts.negativePrompt;
      if (opts.resolution) params.resolution = opts.resolution;
      if (opts.quality) params.quality = opts.quality;
      if (opts.background) params.background = opts.background;
      if (opts.outputFormat) params.output_format = opts.outputFormat;
      if (opts.outputCompression) params.output_compression = parseInt(opts.outputCompression as string, 10);
      if (opts.style) params.style = opts.style;
      if (opts.steps) params.steps = parseInt(opts.steps as string, 10);
      if (opts.strength) params.strength = parseFloat(opts.strength as string);
      if (opts.guidance) params.guidance = parseFloat(opts.guidance as string);
      if (opts.count) params.n = parseInt(opts.count as string, 10);
      if (opts.title) params.title = opts.title;
      if (opts.description) params.description = opts.description;

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
        if (result.outputUrls?.length) console.log(`📎 URLs: ${result.outputUrls.join(', ')}`);
        if (opts.output) console.log(`💾 Saved to: ${opts.output}`);
        console.log(`🆔 ID: ${result.id}\n`);
      } catch (err: any) {
        console.error(`\n❌ Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
