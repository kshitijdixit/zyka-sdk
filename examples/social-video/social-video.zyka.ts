import { composition, scene, renderImage, renderTTS } from 'zyka-sdk';
import { z } from 'zod';

/**
 * Social Media Video Composition
 * Creates a social media clip:
 *   1. Generate an AI image from a prompt
 *   2. Generate a voiceover caption
 *   3. Upscale the image (depends on step 1)
 *
 * Run:
 *   npx zyka render social-video.js --inputs '{
 *     "imagePrompt": "A glowing neon city at night, cinematic",
 *     "captionText": "The future is now. Join us.",
 *     "voiceId": "your-elevenlabs-voice-id"
 *   }'
 */
const SocialVideo = composition({
  id: 'social-video',
  description: 'Social media clip — AI image + caption voiceover + upscale',

  inputSchema: z.object({
    imagePrompt: z.string().describe('What to visualize'),
    captionText: z.string().describe('Caption to speak as voiceover'),
    voiceId: z.string().describe('ElevenLabs voice ID'),
  }),

  scenes: [
    // Scene 1: Generate image
    scene('hero-image', async ({ inputs, config }) =>
      renderImage(
        {
          model: 'flux-1-dev',
          prompt: inputs.imagePrompt,
          width: 1080,
          height: 1080,
        },
        config
      )
    ),

    // Scene 2: Generate caption voiceover (runs in parallel with Scene 1)
    scene('caption-audio', async ({ inputs, config }) =>
      renderTTS({ voice_id: inputs.voiceId, text: inputs.captionText }, config)
    ),

    // Scene 3: Upscale the hero image (depends on Scene 1)
    scene(
      'upscaled-hero',
      async ({ useAsset, config }) => {
        const heroImage = useAsset('hero-image');
        return renderImage(
          {
            model: 'real-esrgan',
            prompt: 'upscale 4x',
            image: heroImage.outputUrl!,
          },
          config
        );
      },
      ['hero-image'] // must wait for hero-image
    ),
  ],
});

export default SocialVideo;
