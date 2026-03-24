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
} from './types';

/**
 * These helpers are designed to be called inside a scene() function body.
 * They accept a config object (resolved from SceneContext.config) and return
 * a GenerationResult. The runner then polls until the result is COMPLETED.
 *
 * Usage inside a composition scene:
 *   scene('bg', async ({ inputs, config }) => renderVideo({ model: 'kling-v2', prompt: inputs.prompt }, config))
 */

export async function renderVideo(
  params: VideoGenerationParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createVideo(params);
}

export async function renderImage(
  params: ImageGenerationParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createImage(params);
}

export async function renderTTS(
  params: TTSParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createTTS(params);
}

export async function renderUpscale(
  params: UpscaleParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createUpscale(params);
}

export async function renderFaceSwap(
  params: FaceSwapParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createFaceSwap(params);
}

export async function renderVirtualTryOn(
  params: VirtualTryOnParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createVirtualTryOn(params);
}

export async function renderOutfitSwap(
  params: OutfitSwapParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createOutfitSwap(params);
}

export async function renderSkinEnhancer(
  params: SkinEnhancerParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createSkinEnhancer(params);
}

export async function renderBehindTheScene(
  params: BehindTheSceneParams,
  config?: ZykaConfig
): Promise<GenerationResult> {
  const client = new ZykaClient(config);
  return client.createBehindTheScene(params);
}

export async function refinePrompt(
  prompt: string,
  type: 'video' | 'image' = 'video',
  config?: ZykaConfig
): Promise<string> {
  const client = new ZykaClient(config);
  return client.refinePrompt({ user_input: prompt, generate_type: type });
}
