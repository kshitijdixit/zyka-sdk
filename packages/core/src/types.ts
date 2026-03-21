import { z } from 'zod';

// ─────────────────────────────────────────────
// SDK Config
// ─────────────────────────────────────────────

export interface ZykaConfig {
  /** Zyka API base URL. Defaults to ZYKA_API_URL env var or https://api.zyka.ai */
  apiUrl?: string;
  /** JWT Bearer token. Defaults to ZYKA_API_TOKEN env var */
  token?: string;
  /** Max ms to wait for a generation to complete. Default: 5 minutes */
  timeoutMs?: number;
  /** Polling interval in ms. Default: 3000 */
  pollIntervalMs?: number;
}

// ─────────────────────────────────────────────
// Generation Parameters
// ─────────────────────────────────────────────

export interface VideoGenerationParams {
  /** AI model to use e.g. 'kling-v2', 'wan-t2v', 'veo-3.1', 'seedance-v1.5-pro' */
  model: string;
  prompt: string;
  duration?: number;
  aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  /** For image-to-video: URL of first frame */
  image_url?: string;
  /** For image-to-video: URL of first frame (Kling/Seedance) */
  first_frame?: string;
  /** For image-to-video: URL of last frame (Kling/Seedance) */
  last_frame?: string;
  /** Ingredients array for Veo 3.1 (up to 20 image URLs) */
  ingredients?: string[];
  /** Any extra model-specific params */
  [key: string]: unknown;
}

export interface ImageGenerationParams {
  /** AI model to use e.g. 'stable-diffusion-xl', 'flux-1', 'nano-banana-pro' */
  model: string;
  prompt: string;
  /** For img2img: input image URL */
  image?: string;
  /** For batch img2img (Nano Banana Pro): up to 14 image URLs */
  image_list?: string[];
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface TTSParams {
  /** ElevenLabs voice ID */
  voice_id: string;
  text: string;
  /** MOSS-TTS or elevenlabs */
  provider?: string;
  [key: string]: unknown;
}

export interface UpscaleParams {
  image_url: string;
  scale?: 2 | 4;
  [key: string]: unknown;
}

export interface FaceSwapParams {
  source_image_url: string;
  target_image_url: string;
  [key: string]: unknown;
}

export interface VirtualTryOnParams {
  model_image_url: string;
  garment_image_url: string;
  [key: string]: unknown;
}

export interface OutfitSwapParams {
  model_image_url: string;
  garment_image_url: string;
  [key: string]: unknown;
}

export interface SkinEnhancerParams {
  image_url: string;
  [key: string]: unknown;
}

export interface BehindTheSceneParams {
  video_url: string;
  prompt: string;
  [key: string]: unknown;
}

export interface PromptRefinementParams {
  prompt: string;
  type?: 'video' | 'image';
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
// Generation Results
// ─────────────────────────────────────────────

export type GenerationType = 'video' | 'image' | 'tts' | 'voice' | 'upscale' | 'face-swap' | 'virtual-try-on' | 'outfit-swap' | 'skin-enhancer' | 'behind-the-scene';

export type GenerationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface GenerationResult {
  id: string;
  type: GenerationType;
  status: GenerationStatus;
  /** Output URL (video, image, audio) — available when status = COMPLETED */
  outputUrl?: string;
  /** Output URLs for batch results */
  outputUrls?: string[];
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Composition / Scene
// ─────────────────────────────────────────────

export type SceneContext<TInputs extends Record<string, unknown> = Record<string, unknown>> = {
  inputs: TInputs;
  /** Get the output of another scene (must have run before this one) */
  useAsset: (sceneId: string) => GenerationResult;
  /** SDK config */
  config: Required<ZykaConfig>;
};

export type SceneFn<TInputs extends Record<string, unknown> = Record<string, unknown>> = (
  ctx: SceneContext<TInputs>
) => Promise<GenerationResult>;

export interface Scene<TInputs extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  fn: SceneFn<TInputs>;
  /** IDs of scenes this scene depends on */
  dependsOn?: string[];
}

export interface CompositionConfig<TInputs extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  description?: string;
  /** Zod schema for input validation */
  inputSchema?: z.ZodType<TInputs>;
  scenes: Scene<TInputs>[];
}

export interface Composition<TInputs extends Record<string, unknown> = Record<string, unknown>> extends CompositionConfig<TInputs> {}

// ─────────────────────────────────────────────
// Render Result
// ─────────────────────────────────────────────

export type SceneResultMap = Record<string, GenerationResult>;

export interface ZykaRenderResult {
  compositionId: string;
  inputs: Record<string, unknown>;
  scenes: SceneResultMap;
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

// ─────────────────────────────────────────────
// Job (for Studio dashboard)
// ─────────────────────────────────────────────

export type JobStatus = 'running' | 'completed' | 'failed';

export interface ZykaJob {
  id: string;
  compositionId: string;
  status: JobStatus;
  inputs: Record<string, unknown>;
  sceneResults: Partial<SceneResultMap>;
  startedAt: string;
  completedAt?: string;
  error?: string;
}
