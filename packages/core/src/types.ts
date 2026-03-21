// ─────────────────────────────────────────────
// SDK Config
// ─────────────────────────────────────────────

export interface ZykaConfig {
  /** Zyka API base URL. Defaults to ZYKA_API_URL env var or https://zyka.ai/api-v2 */
  apiUrl?: string;
  /** JWT Bearer token. Defaults to ZYKA_API_TOKEN env var or ~/.zyka/config.json */
  token?: string;
  /** Max ms to wait for a generation to complete. Default: 5 minutes */
  timeoutMs?: number;
  /** Polling interval in ms. Default: 3000 */
  pollIntervalMs?: number;
}

// ─────────────────────────────────────────────
// Model types (must match backend /api/video-generation model validation)
// ─────────────────────────────────────────────

/**
 * Supported video generation models.
 *
 * | Model         | Type            | Duration       | Notes                              |
 * |---------------|-----------------|----------------|------------------------------------|
 * | `grok`        | text-to-video   | 1-15s (string) | Use `"5s"` format for duration     |
 * | `wan`         | text-to-video   | 5s             | Also supports image-to-video       |
 * | `veo`         | text-to-video   | up to 8s       | Google Veo                         |
 * | `sora`        | text-to-video   | variable       | OpenAI Sora                        |
 * | `kling`       | image-to-video  | 5 or 10s       | Requires `image_url` or `first_frame` |
 * | `bytedance`   | text-to-video   | variable       | ByteDance Seedance                 |
 * | `infinite_talk`| image-to-video | variable       | Talking-head animation             |
 */
export type VideoModel = 'sora' | 'veo' | 'kling' | 'grok' | 'wan' | 'bytedance' | 'infinite_talk';

/**
 * Supported image generation models.
 *
 * | Model                  | Notes                                    |
 * |------------------------|------------------------------------------|
 * | `flux-1`               | Flux 1 Schnell / Dev (text-to-image)     |
 * | `stable-diffusion-xl`  | Stable Diffusion XL                      |
 * | `nano-banana-pro`      | Batch image generation (up to 14 images) |
 */
export type ImageModel = 'flux-1' | 'stable-diffusion-xl' | 'nano-banana-pro' | string;

// ─────────────────────────────────────────────
// Generation Parameters
// ─────────────────────────────────────────────

export interface VideoGenerationParams {
  /**
   * AI model to use.
   * Must be one of: `'sora'`, `'veo'`, `'kling'`, `'grok'`, `'wan'`, `'bytedance'`, `'infinite_talk'`
   *
   * @example
   * // Text-to-video (grok)
   * { model: 'grok', prompt: 'A dog running', duration: '5s' }
   *
   * @example
   * // Text-to-video (wan)
   * { model: 'wan', prompt: 'A sunrise over mountains', duration: 5 }
   *
   * @example
   * // Image-to-video (kling — requires image_url)
   * { model: 'kling', prompt: 'Animate this', image_url: 'https://...' }
   */
  model: VideoModel;
  prompt: string;
  /**
   * Duration of the generated video.
   * - `number`: seconds (e.g. `5`)
   * - `string`: with suffix (e.g. `"5s"`, `"10s"`) — required by Grok
   *
   * Model-specific ranges:
   * - Grok: 1-15 seconds (use string format: `"5s"`)
   * - Kling: 5 or 10 seconds
   * - Veo: up to 8 seconds
   * - Wan: 5 seconds
   */
  duration?: number | string;
  aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  /** For image-to-video: URL of the input image (required for kling, optional for wan) */
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
  /**
   * AI model to use.
   * @example { model: 'flux-1', prompt: 'A neon city at night' }
   */
  model: ImageModel;
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
// Wait options (for built-in polling)
// ─────────────────────────────────────────────

export interface WaitOptions {
  /** If true, polls until COMPLETED or FAILED. Default: false */
  waitForCompletion?: boolean;
  /** Timeout in ms. Default: 5 minutes */
  timeoutMs?: number;
  /** Poll interval in ms. Default: 3000 */
  pollIntervalMs?: number;
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
// Composition / Scene (optional — for pipeline use)
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
  /**
   * Optional Zod schema for input validation.
   * If provided, inputs are validated before running.
   * If omitted, any inputs object is accepted.
   */
  inputSchema?: { safeParse: (data: unknown) => { success: boolean; error?: { message: string }; data?: TInputs } };
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
