import { composition, scene, renderVideo, renderImage, renderTTS } from 'zyka-sdk';
import { z } from 'zod';

/**
 * Product Ad Composition
 * Creates a multi-scene AI-generated product advertisement:
 *   1. Generate a cinematic background video
 *   2. Upscale the product image
 *   3. Generate a voiceover from the tagline
 *
 * Run:
 *   npx zyka render product-ad.js --inputs '{
 *     "productImageUrl": "https://...",
 *     "tagline": "Discover the future of beauty, today.",
 *     "voiceId": "your-elevenlabs-voice-id",
 *     "productCategory": "skincare"
 *   }'
 */
const ProductAd = composition({
  id: 'product-ad',
  description: 'AI-generated product advertisement — background video + upscaled image + voiceover',

  inputSchema: z.object({
    productImageUrl: z.string().url().describe('Product photo URL'),
    tagline: z.string().describe('Marketing tagline for voiceover'),
    voiceId: z.string().describe('ElevenLabs voice ID for TTS'),
    productCategory: z.string().optional().default('product').describe('e.g. skincare, fashion, food'),
  }),

  scenes: [
    // Scene 1: Generate a cinematic background video
    scene('background-video', async ({ inputs, config }) =>
      renderVideo(
        {
          model: 'kling-v2',
          prompt: `Cinematic luxury ${inputs.productCategory} product showcase, smooth camera movement, premium aesthetic, soft bokeh lighting, 4K quality`,
          duration: 6,
          aspect_ratio: '16:9',
        },
        config
      )
    ),

    // Scene 2: Upscale the product image
    scene('upscaled-product', async ({ inputs, config }) =>
      renderImage(
        {
          model: 'real-esrgan',
          prompt: 'upscale',
          image: inputs.productImageUrl,
        },
        config
      )
    ),

    // Scene 3: Generate voiceover from tagline
    scene('voiceover', async ({ inputs, config }) =>
      renderTTS(
        {
          voice_id: inputs.voiceId,
          text: inputs.tagline,
        },
        config
      )
    ),
  ],
});

export default ProductAd;
