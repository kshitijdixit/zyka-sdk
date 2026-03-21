import { ZykaClient } from './client';
import type {
  ZykaConfig,
  VideoGenerationParams,
  ImageGenerationParams,
  TTSParams,
  UpscaleParams,
  FaceSwapParams,
  VirtualTryOnParams,
  OutfitSwapParams,
  SkinEnhancerParams,
  BehindTheSceneParams,
  GenerationResult,
  WaitOptions,
} from './types';

/**
 * Generate a video using Zyka's AI models.
 *
 * @example
 * // Simple text-to-video (wan model)
 * const result = await renderVideo({
 *   model: 'wan',
 *   prompt: 'A dog running on the beach',
 *   duration: 5,
 *   aspect_ratio: '16:9'
 * });
 *
 * @example
 * // Text-to-video with Grok (use string duration)
 * const result = await renderVideo({
 *   model: 'grok',
 *   prompt: 'A cat playing piano',
 *   duration: '5s',
 *   aspect_ratio: '16:9'
 * });
 *
 * @example
 * // Image-to-video (kling — requires image_url)
 * const result = await renderVideo({
 *   model: 'kling',
 *   prompt: 'Animate this image with camera motion',
 *   image_url: 'https://example.com/photo.jpg',
 *   duration: 5
 * });
 */
export async function renderVideo(
  params: VideoGenerationParams,
  config?: ZykaConfig,
  options?: WaitOptions
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createVideo(params, options);
}

/**
 * Generate an image using Zyka's AI models.
 *
 * @example
 * const result = await renderImage({
 *   model: 'flux-1',
 *   prompt: 'A neon city at night, cyberpunk style',
 *   width: 1080,
 *   height: 1080
 * });
 */
export async function renderImage(
  params: ImageGenerationParams,
  config?: ZykaConfig,
  options?: WaitOptions
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createImage(params, options);
}

/**
 * Generate text-to-speech audio.
 *
 * @example
 * const result = await renderTTS({
 *   voice_id: 'your-elevenlabs-voice-id',
 *   text: 'Hello, welcome to Zyka AI'
 * });
 */
export async function renderTTS(
  params: TTSParams,
  config?: ZykaConfig,
  options?: WaitOptions
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createTTS(params, options);
}

/** Upscale an image (2x or 4x). */
export async function renderUpscale(
  params: UpscaleParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createUpscale(params);
}

/** Face swap between two images. */
export async function renderFaceSwap(
  params: FaceSwapParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createFaceSwap(params);
}

/** Virtual try-on: place a garment on a model image. */
export async function renderVirtualTryOn(
  params: VirtualTryOnParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createVirtualTryOn(params);
}

/** Outfit swap between two images. */
export async function renderOutfitSwap(
  params: OutfitSwapParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createOutfitSwap(params);
}

/** Enhance skin in a portrait image. */
export async function renderSkinEnhancer(
  params: SkinEnhancerParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createSkinEnhancer(params);
}

/** Apply behind-the-scene effect to a video. */
export async function renderBehindTheScene(
  params: BehindTheSceneParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createBehindTheScene(params);
}

/**
 * Refine a prompt using Zyka's AI to make it more detailed and effective.
 * @example
 * const better = await refinePrompt('a sunset');
 * // Returns: "A cinematic golden hour sunset over snow-capped mountains..."
 */
export async function refinePrompt(
  prompt: string,
  type: 'video' | 'image' = 'video',
  config?: ZykaConfig
): Promise<string> {
  const client = new ZykaClient(config);
  return client.refinePrompt({ prompt, type });
}
