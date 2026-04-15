// ─────────────────────────────────────────────
// SDK Config
// ─────────────────────────────────────────────

export interface ZykaConfig {
  /** Zyka API base URL. Defaults to ZYKA_API_URL env var or https://zyka.ai/api-v2 */
  apiUrl?: string;
  /**
   * Zyka API key (starts with `zk_live_`).
   * Generate one at: https://zyka.ai/settings/api-keys (or via `POST /api/api-keys`)
   * Defaults to ZYKA_API_KEY env var.
   */
  apiKey?: string;
  /** JWT Bearer token (legacy — prefer apiKey). Defaults to ZYKA_API_TOKEN env var or ~/.zyka/config.json */
  token?: string;
  /** Max ms to wait for a generation to complete. Default: 5 minutes */
  timeoutMs?: number;
  /** Polling interval in ms. Default: 3000 */
  pollIntervalMs?: number;
}

// ═══════════════════════════════════════════════
// VIDEO GENERATION
// ═══════════════════════════════════════════════

/**
 * Video generation model. Sent as the `model` field.
 *
 * | Model           | Type              | Notes                                       |
 * |-----------------|-------------------|---------------------------------------------|
 * | `sora`          | text-to-video     | OpenAI Sora                                 |
 * | `veo`           | text-to-video     | Google Veo (2.0, 3.0, 3.1)                  |
 * | `kling`         | image/text-to-video | Kling AI (many sub-models)               |
 * | `bytedance`     | text-to-video     | Seedance, OmniHuman                         |
 * | `wan`           | text/image-to-video | Alibaba WAN                               |
 * | `infinite_talk` | image-to-video    | Talking-head animation, requires audio      |
 * | `aurora`        | video/image+audio | AI lip-sync (Sync Labs Aurora)              |
 */
export type VideoModel = 'sora' | 'veo' | 'kling' | 'bytedance' | 'wan' | 'infinite_talk' | 'grok' | 'ltx' | 'aurora';

// Sub-model types for video
export type SoraSubModel = 'sora-2' | 'sora-2-pro';
export type VeoSubModel =
  | 'veo-2.0-generate-001' | 'veo-2.0-generate-exp' | 'veo-2.0-generate-preview'
  | 'veo-3.0-generate-001' | 'veo-3.0-fast-generate-001' | 'veo-3.0-generate-preview' | 'veo-3.0-fast-generate-preview'
  | 'veo-3.1-generate-001' | 'veo-3.1-fast-generate-001' | 'veo-3.1-generate-preview' | 'veo-3.1-fast-generate-preview';
export type KlingVideoSubModel =
  | 'motion-control'
  | 'kling-v1' | 'kling-v1-5' | 'kling-v1-6'
  | 'kling-v2-master' | 'kling-v2-1' | 'kling-v2-1-master' | 'kling-v2-5-turbo' | 'kling-v2-6'
  | 'kling-v3' | 'kling-v3-pro'
  | 'kling-o3' | 'kling-o3-pro'
  | 'kling-o3-pro-v2v-edit' | 'kling-v3-pro-motion-control'
  | 'multi-image-to-video' | 'kling-video-o1';
export type BytedanceSubModel = 'Seedance V1.5 Pro' | 'OmniHuman' | 'OmniHuman v1.5' | 'Seedance 2.0' | 'Seedance 2.0 Fast';
export type WanSubModel = 'wan-2-6-t2v' | 'wan-2-6-i2v' | 'wan-2-5-i2v' | 'wan-v2-2-animate-replace' | 'wan-v2-2-animate-move' | 'wan-2-7';
export type GrokVideoSubModel = 'grok-imagine-video';
export type LtxSubModel = 'ltx-2.3-text-to-video' | 'ltx-2.3-image-to-video';
export type VideoSubModel = SoraSubModel | VeoSubModel | KlingVideoSubModel | BytedanceSubModel | WanSubModel | GrokVideoSubModel | LtxSubModel | string;

/**
 * Video generation parameters.
 *
 * @example
 * // Text-to-video (wan — simplest)
 * { model: 'wan', prompt: 'A sunset over mountains', duration: 5, aspect_ratio: '16:9' }
 *
 * @example
 * // Text-to-video (sora)
 * { model: 'sora', sub_model: 'sora-2', prompt: 'A cat playing piano', seconds: '4', size: '1280x720' }
 *
 * @example
 * // Image-to-video (kling — requires image via firstFrame/file upload)
 * { model: 'kling', sub_model: 'kling-v2-master', prompt: 'Animate this person', duration: '5', mode: 'std' }
 *
 * @example
 * // Bytedance Seedance
 * { model: 'bytedance', sub_model: 'Seedance V1.5 Pro', prompt: 'A dancer performing', duration: '5', resolution: '1080p' }
 *
 * @example
 * // Infinite Talk (talking head)
 * { model: 'infinite_talk', image_url: 'https://...', audio_url: 'https://...' }
 */
export interface VideoGenerationParams {
  /**
   * Video model. Must be one of: `'sora'`, `'veo'`, `'kling'`, `'bytedance'`, `'wan'`, `'infinite_talk'`
   */
  model: VideoModel;

  /**
   * Sub-model variant. Each model has specific sub-models:
   *
   * - **sora**: `'sora-2'` (default), `'sora-2-pro'`
   * - **veo**: `'veo-2.0-generate-001'`, `'veo-3.0-generate-001'`, `'veo-3.1-generate-001'`, etc.
   * - **kling**: `'motion-control'` (default), `'kling-v1'` thru `'kling-v3-pro'`, `'kling-o3'`, `'kling-o3-pro'`, `'multi-image-to-video'`, `'kling-video-o1'`
   * - **bytedance**: `'Seedance V1.5 Pro'` (default), `'Seedance 2.0'`, `'Seedance 2.0 Fast'`, `'OmniHuman'`, `'OmniHuman v1.5'`
   * - **wan**: `'wan-2-6-t2v'` (default, text-to-video), `'wan-2-7'`, `'wan-2-6-i2v'` (image-to-video), `'wan-2-5-i2v'`, `'wan-v2-2-animate-replace'`, `'wan-v2-2-animate-move'`
   * - **ltx**: `'ltx-2.3-text-to-video'` (default), `'ltx-2.3-image-to-video'`
   */
  sub_model?: VideoSubModel;

  /** Text prompt describing the video */
  prompt?: string;

  /** Negative prompt (what to avoid). Supported by: kling, wan */
  negative_prompt?: string;

  /**
   * Duration in seconds.
   * - **sora**: `'4'`, `'8'`, `'12'` (string, default `'4'`)
   * - **veo**: 4-8 seconds (string, default `'8'`)
   * - **kling**: `'5'` or `'10'` for most; `'3'-'10'` for kling-video-o1; `'3'-'15'` for v3/o3
   * - **bytedance**: `'4'` to `'12'` (string, default `'5'`)
   * - **wan**: `5`, `10`, or `15` (number, default `5`)
   */
  duration?: number | string;

  /**
   * Video duration in seconds (alternative to duration, used by sora/veo/wan).
   * - **sora**: `'4'`, `'8'`, `'12'`
   * - **veo**: `'4'`-`'8'`
   * - **wan**: `'5'`, `'10'`, `'15'`
   */
  seconds?: number | string;

  /**
   * Output size.
   * - **sora**: `'720x1280'`, `'1280x720'`, `'1024x1792'`, `'1792x1024'`
   * - **veo**: `'720p'`, `'1080p'`, `'4k'`
   * - **wan**: `'1280*720'`, `'1920*1080'`, `'720*1280'`, `'1080*1920'`
   */
  size?: string;

  /**
   * Aspect ratio.
   * - **veo**: `'16:9'`, `'9:16'` (required)
   * - **kling**: `'16:9'`, `'9:16'`, `'1:1'`
   * - **bytedance**: `'21:9'`, `'16:9'`, `'4:3'`, `'1:1'`, `'3:4'`, `'9:16'`
   */
  aspect_ratio?: string;

  // ── Image/Audio inputs ──

  /** Image URL for image-to-video (kling, wan i2v, infinite_talk) */
  image_url?: string;
  /** Audio URL for audio-driven video (infinite_talk, wan) */
  audio_url?: string;
  /** Second audio URL for multi-person infinite_talk */
  audio_url_2?: string;
  /** First frame URL (kling) */
  first_frame?: string;
  /** Last frame URL (kling) */
  last_frame?: string;
  /** Input reference URL (veo 3.1) */
  inputReference?: string;
  /** Ingredients array for Veo 3.1 (up to 20 image URLs) */
  ingredients?: string[];

  // ── Kling-specific ──

  /** Kling mode: `'std'` or `'pro'` */
  mode?: 'std' | 'pro';
  /** Kling character orientation for motion-control: `'image'` or `'video'` */
  character_orientation?: 'image' | 'video';
  /** Kling cfg_scale (0-1, default 0.5). Not supported on v2.x models */
  cfg_scale?: number;
  /** Kling camera control */
  camera_control?: { type?: string; config?: Record<string, number> };
  /** Kling static mask URL (for v-models) */
  static_mask?: string;
  /** Kling dynamic masks for trajectory control */
  dynamic_masks?: Array<{ mask: string; trajectories: Array<{ x: number; y: number }> }>;
  /** Kling image list (multi-image-to-video: 1-4 images; kling-video-o1: up to 7 images) */
  image_list?: Array<string | { image_url?: string; image?: string; type?: 'first_frame' | 'end_frame' }>;
  /** Kling V3/O3 multi-prompt for multi-shot videos */
  multi_prompt?: Array<{ prompt: string; duration?: string }>;
  /** Kling V3/O3 elements for reference */
  elements?: Array<{ reference_image_urls?: string[]; frontal_image_url?: string; video_url?: string }>;
  /** Kling V3/O3 shot type (set to 'customize' when using multi_prompt) */
  shot_type?: string;
  /** Kling V2.6+ sound: `'on'` or `'off'` */
  sound?: 'on' | 'off';
  /** Kling V2.6+ voice list */
  voice_list?: Array<{ voice_id: string }>;
  /** Kling V3 voice IDs (max 2) */
  voice_ids?: string[];
  /** Kling generate_audio (V3/O3, default true) */
  generate_audio?: boolean;
  /** Kling keep original sound for motion-control: 'yes' or 'no' */
  keep_original_sound?: 'yes' | 'no';

  // ── Bytedance-specific ──

  /** Bytedance resolution: `'480p'`, `'720p'`, `'1080p'` */
  resolution?: string;
  /** Bytedance camera fixed */
  camera_fixed?: boolean;
  /** Bytedance turbo mode (OmniHuman v1.5) */
  turbo_mode?: boolean;

  // ── WAN-specific ──

  /** WAN prompt expansion */
  enable_prompt_expansion?: boolean;
  /** WAN guidance scale */
  guidance_scale?: number;
  /** WAN inference steps (1-100, default 20 for v2.2 models) */
  num_inference_steps?: number;
  /** WAN video quality: `'low'`, `'medium'`, `'high'`, `'maximum'` (v2.2 models) */
  video_quality?: 'low' | 'medium' | 'high' | 'maximum';

  // ── Infinite Talk-specific ──

  /** Infinite talk input type: `'image'` or `'video'` */
  input_type?: 'image' | 'video';
  /** Infinite talk person count: `'single'` or `'multi'` */
  person_count?: 'single' | 'multi';
  /** Infinite talk width (256-1024) */
  width?: number;
  /** Infinite talk height (256-1024) */
  height?: number;

  // ── Common ──

  /** Seed for reproducibility (-1 for random) */
  seed?: number;
  /** Enable safety checker */
  enable_safety_checker?: boolean;

  // ── Common metadata ──

  /** Title for the generation job */
  title?: string;
  /** Description for the generation job */
  description?: string;

  // ── Kling Omni-Video ──

  /** Kling Omni-Video reference videos (max 1) */
  video_list?: Array<{ video_url: string; refer_type?: 'feature' | 'base'; keep_original_sound?: 'yes' | 'no' }>;
  /** Kling Omni-Video element references */
  element_list?: Array<{ element_id: number }>;
  /** Kling O3 reference image URLs; Seedance 2.0 reference images (up to 9) */
  image_urls?: string[];
  /** Video URL for V2V (Infinite Talk, WAN animate, Kling motion-control) */
  video_url?: string;
  /** Seedance 2.0 reference-to-video: reference video URLs (up to 3) */
  video_urls?: string[];
  /** Seedance 2.0 reference-to-video: reference audio URLs (up to 3) */
  audio_urls?: string[];

  // ── Aurora (Sync Labs Lip Sync)-specific ──

  /** Aurora lip-sync audio guidance scale (0-10, default 2) */
  audio_guidance_scale?: number;

  // ── Callbacks ──

  /** Callback URL for status change notifications */
  callback_url?: string;
  /** Custom task ID (max 255 chars, unique per user) */
  external_task_id?: string;
  /** Watermark settings */
  watermark_info?: { enabled: boolean };

  /** Any extra model-specific params */
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════
// IMAGE GENERATION
// ═══════════════════════════════════════════════

/**
 * Image generation model. Sent as the `model` field.
 *
 * | Model                              | Sub-model(s)                     | Notes                                 |
 * |------------------------------------|----------------------------------|---------------------------------------|
 * | `nano_banana`                      | `nano-banana-1`, `nano-banana-pro` | Gemini-based, batch support (Pro)   |
 * | `flux_2_dev`                       | `flux-2-dev`                     | Flux 2 Dev                            |
 * | `flux_1_schnell`                   | `flux-1-schnell`                 | Flux 1 Schnell (fast)                 |
 * | `lucid_origin`                     | `lucid-origin`                   | Lucid Origin                          |
 * | `phoenix_1_0`                      | `phoenix-1.0`                    | Phoenix 1.0                           |
 * | `stable_diffusion_v1_5_img2img`    | `stable-diffusion-v1-5-img2img`  | SD 1.5 img2img                        |
 * | `stable_diffusion_xl_base_1_0`     | `stable-diffusion-xl-base-1.0`   | SD XL Base 1.0                        |
 * | `dall_e_2`                         | `dall-e-2`                       | OpenAI DALL-E 2                       |
 * | `dall_e_3`                         | `dall-e-3`                       | OpenAI DALL-E 3                       |
 * | `gpt_image_1`                      | `gpt-image-1`                    | OpenAI GPT Image 1                    |
 * | `gpt_image_1_mini`                 | `gpt-image-1-mini`               | OpenAI GPT Image 1 Mini               |
 * | `gpt_image_1_5`                    | `gpt-image-1.5`                  | OpenAI GPT Image 1.5                  |
 * | `kling`                            | `kling-v1` thru `kling-image-v3` | Kling AI Image                        |
 * | `z_image_turbo`                    | `z-image-turbo`                  | Z Image Turbo (fast)                  |
 */
export type ImageModel =
  | 'nano_banana' | 'flux_2_dev' | 'flux_1_schnell' | 'flux_2_klein_9b'
  | 'lucid_origin' | 'phoenix_1_0'
  | 'stable_diffusion_v1_5_img2img' | 'stable_diffusion_xl_base_1_0'
  | 'dall_e_2' | 'dall_e_3'
  | 'gpt_image_1' | 'gpt_image_1_mini' | 'gpt_image_1_5'
  | 'gpt-image-1' | 'gpt-image-1-mini' | 'gpt-image-1.5'
  | 'kling' | 'z_image_turbo'
  | 'zyka_helion' | 'grok_imagine' | 'qwen_image_2_pro'
  | string;

export type ImageSubModel =
  | 'nano-banana-1' | 'nano-banana-pro'
  | 'flux-2-dev' | 'flux-1-schnell' | 'flux-2-klein-9b'
  | 'lucid-origin' | 'phoenix-1.0'
  | 'stable-diffusion-v1-5-img2img' | 'stable-diffusion-xl-base-1.0'
  | 'dall-e-2' | 'dall-e-3'
  | 'gpt-image-1' | 'gpt-image-1-mini' | 'gpt-image-1.5'
  | 'kling-v1' | 'kling-v1-5' | 'kling-v2' | 'kling-v2-new' | 'kling-v2-1'
  | 'omni-image' | 'kling-image-o1' | 'multi-image-to-image'
  | 'kling-image-v3' | 'kling-image-v3-text-to-image'
  | 'z-image-turbo'
  | 'nano-banana-2' | 'zyka-helion' | 'grok-imagine-image' | 'qwen-image-2-pro'
  | string;

/**
 * Image generation parameters.
 *
 * @example
 * // Nano Banana 1 (simplest — Gemini-based)
 * { model: 'nano_banana', prompt: 'A neon city at night', size: '1024x1024' }
 *
 * @example
 * // Nano Banana Pro (higher res, batch support)
 * { model: 'nano_banana', sub_model: 'nano-banana-pro', prompt: 'A neon city', resolution: '4K' }
 *
 * @example
 * // DALL-E 3
 * { model: 'dall_e_3', prompt: 'A watercolor painting of a sunset', size: '1024x1024', quality: 'hd' }
 *
 * @example
 * // GPT Image 1
 * { model: 'gpt_image_1', prompt: 'A product photo of sneakers', size: '1024x1024', quality: 'high', background: 'transparent' }
 *
 * @example
 * // Flux 1 Schnell (fast)
 * { model: 'flux_1_schnell', prompt: 'A dog running on the beach', size: '1024x1024' }
 */
export interface ImageGenerationParams {
  /**
   * Image model. See ImageModel type for all options.
   * Most common: `'nano_banana'`, `'flux_1_schnell'`, `'dall_e_3'`, `'gpt_image_1'`
   */
  model: ImageModel;

  /**
   * Sub-model variant (auto-detected from model if omitted).
   * - **nano_banana**: `'nano-banana-1'` (default), `'nano-banana-pro'`
   * - **kling**: `'kling-v1'` (default), `'kling-v2'`, `'omni-image'`, `'kling-image-v3'`, etc.
   */
  sub_model?: ImageSubModel;

  /** Text prompt describing the image */
  prompt: string;

  /**
   * Output size (model-specific):
   * - **Flux/Nano Banana 1**: `'1024x1024'`, `'848x1264'`, `'1264x848'`, `'1152x928'`, etc.
   * - **Nano Banana Pro**: Same as above + 2K sizes (e.g. `'2048x2048'`) + 4K sizes (e.g. `'4096x4096'`)
   * - **DALL-E 2**: `'256x256'`, `'512x512'`, `'1024x1024'`
   * - **DALL-E 3**: `'1024x1024'`, `'1792x1024'`, `'1024x1792'`
   * - **GPT Image**: `'1024x1024'`, `'1536x1024'`, `'1024x1536'`, `'auto'`
   */
  size?: string;

  /** Resolution for Nano Banana Pro: `'1K'`, `'2K'`, `'4K'` */
  resolution?: string;

  /**
   * Aspect ratio (Kling images):
   * `'16:9'`, `'9:16'`, `'1:1'`, `'4:3'`, `'3:4'`, `'3:2'`, `'2:3'`, `'21:9'`, `'auto'`
   */
  aspect_ratio?: string;

  /** For img2img: input image URL */
  image?: string;

  /** For batch img2img (Nano Banana Pro): up to 14 image URLs */
  image_list?: string[];

  /** DALL-E 3 quality: `'standard'`, `'hd'`, `'auto'` */
  quality?: string;

  /** GPT Image background: `'transparent'`, `'opaque'`, `'auto'` */
  background?: string;

  /** GPT Image output format: `'png'`, `'jpeg'`, `'webp'` */
  output_format?: string;

  // ── Additional fields ──

  /** Title for the generation job */
  title?: string;
  /** Description for the generation job */
  description?: string;
  /** Negative prompt (what to avoid) */
  negative_prompt?: string;
  /** Guidance scale (Lucid Origin 0-10, Phoenix 2-10, SD) */
  guidance?: number;
  /** Number of diffusion steps */
  steps?: number;
  /** img2img transformation strength (0-1) */
  strength?: number;
  /** DALL-E 3 style: `'vivid'`, `'natural'` */
  style?: string;
  /** GPT Image moderation */
  moderation?: string;
  /** GPT Image output compression (0-100) */
  output_compression?: number;
  /** Number of images to generate (Kling: 1-9) */
  n?: number;
  /** Kling v1.5 image reference type */
  image_reference?: 'subject' | 'face';
  /** Kling v1.5 image fidelity (0-1) */
  image_fidelity?: number;
  /** Kling v1.5 human fidelity (0-1) */
  human_fidelity?: number;
  /** Kling multi-image-to-image subject images (1-4) */
  subject_image_list?: string[];
  /** Kling multi-image-to-image scene image */
  scene_image?: string;
  /** Kling multi-image-to-image style image */
  style_image?: string;
  /** Kling Omni-Image element references */
  element_list?: Array<{ element_id: number }>;
  /** Kling Image V3 face control elements */
  elements?: Array<{ frontal_image_url?: string; reference_image_urls?: string[] }>;

  /** Any extra model-specific params */
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════
// TTS / VOICE
// ═══════════════════════════════════════════════

/**
 * TTS provider.
 *
 * | Provider      | Features                                    |
 * |---------------|---------------------------------------------|
 * | `elevenlabs`  | Default. Requires voice_id from ElevenLabs   |
 * | `qwen3`       | Voice design, voice clone, custom voice      |
 * | `chatterbox`  | Voice cloning with emotion/speed control     |
 * | `voxcpm`      | Voice cloning                                |
 * | `minimax`     | Preset voices, speech 2.8 turbo              |
 * | `moss-tts`    | RunPod-based TTS                             |
 */
export type TTSProvider = 'elevenlabs' | 'qwen3' | 'chatterbox' | 'voxcpm' | 'minimax' | 'moss-tts' | 'fish-audio';

export interface TTSParams {
  /** TTS provider. Default: `'elevenlabs'` */
  provider?: TTSProvider;

  /** Voice ID (ElevenLabs voice ID, or UUID of a cloned voice) */
  voice_id?: string;

  /** Text to convert to speech */
  script: string;

  /** Display name for this TTS generation */
  name?: string;

  // ── ElevenLabs-specific ──
  // (voice_id + script is all you need)

  // ── Qwen3-specific ──
  /** Qwen3 generation type: `'voice_design'`, `'voice_clone'`, `'custom_voice'` */
  generation_type?: 'voice_design' | 'voice_clone' | 'custom_voice';
  /** Qwen3 language */
  language?: string;
  /** Qwen3 voice description (for voice_design) */
  voice_description?: string;
  /** Qwen3 speaker (for custom_voice): `'Aiden'`, `'Dylan'`, `'Eric'`, `'Ryan'`, `'Serena'`, etc. */
  speaker?: string;
  /** Qwen3 style instruction (for custom_voice) */
  instruct?: string;
  /** Qwen3 voice URL (for voice_clone, alternative to voice_id) */
  actual_voice_url?: string;
  /** Qwen3 reference text (for voice_clone) */
  ref_text?: string;

  // ── Chatterbox-specific ──
  /** Chatterbox temperature (0-1, default 0.7) */
  temperature?: number;
  /** Chatterbox exaggeration (0.5-2, default 1.0) */
  exaggeration?: number;
  /** Chatterbox speed (0.5-2, default 1.0) */
  speed?: number;
  /** Chatterbox cfg_weight (0-1, default 0.5) */
  cfg_weight?: number;

  // ── MiniMax-specific ──
  /** MiniMax voice setting (preset voices) */
  voice_setting?: {
    voice_id?: string;
    speed?: number;
    vol?: number;
    pitch?: number;
    /** Emotion: neutral | happy | sad | angry | fearful | disgusted | surprised */
    emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';
    english_normalization?: boolean;
  };
  /** MiniMax audio setting */
  audio_setting?: {
    format?: 'mp3' | 'pcm' | 'flac';
    sample_rate?: number;
    bitrate?: number;
    /** 1 = mono, 2 = stereo */
    channel?: 1 | 2;
  };
  /** MiniMax language boost */
  language_boost?: string;
  /** MiniMax loudness normalization */
  normalization_setting?: {
    enabled?: boolean;
    target_loudness?: number;
    target_range?: number;
    target_peak?: number;
  };
  /** MiniMax voice modification — pitch/intensity/timbre each -100 to 100 */
  voice_modify?: {
    pitch?: number;
    intensity?: number;
    timbre?: number;
  };

  // ── MOSS-TTS-specific ──
  /** MOSS-TTS voice strength (0-1, default 1.0) */
  voice_strength?: number;

  // ── VoxCPM-specific ──
  /** VoxCPM transcript of reference audio */
  prompt_text?: string;

  // ── Qwen3 additional ──
  /** Qwen3 faster but lower quality mode */
  use_xvector_only?: boolean;

  // ── Fish Audio-specific ──
  /** Fish Audio model/voice ID */
  reference_id?: string;

  /** Any extra provider-specific params */
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════
// APPS
// ═══════════════════════════════════════════════

export interface UpscaleParams {
  /** URL of the image to upscale */
  image: string;
  /** Output resolution: '1k', '2k', '4k' (default: '2k') */
  resolution?: '1k' | '2k' | '4k';
  [key: string]: unknown;
}

export interface FaceSwapParams {
  /** Type of output: 'image' or 'video' */
  type: 'image' | 'video';
  /** URL of the target media (image or video) */
  url: string;
  /** URL of the face image to swap in */
  face_image: string;
  /** Optional custom prompt */
  prompt?: string;
  [key: string]: unknown;
}

export interface VirtualTryOnParams {
  /** URL of the person's image */
  human_image: string;
  /** URL of the clothing image */
  cloth_image: string;
  [key: string]: unknown;
}

export interface OutfitSwapParams {
  /** URL of your own image (face/body preserved) */
  user_image: string;
  /** URL of the character image (outfit extracted from here) */
  character_image: string;
  [key: string]: unknown;
}

export interface SkinEnhancerParams {
  /** URL of the image to enhance */
  image: string;
  /** Skin type */
  type?: 'perfect_skin' | 'realistic_skin' | 'imperfect_skin';
  [key: string]: unknown;
}

export interface BehindTheSceneParams {
  /** URL of the reference image */
  image: string;
  /** Type of output: 'image' or 'video' */
  type: 'image' | 'video';
  [key: string]: unknown;
}

export interface AnglesParams {
  /** URL of the source image */
  image: string;
  /** Camera angle - preset string or {azimuth, elevation} / {rotation, tilt} */
  angle: string | { azimuth?: number; elevation?: number; rotation?: number; tilt?: number };
  [key: string]: unknown;
}

export interface NineShortsParams {
  /** URL of the source image */
  image: string;
  [key: string]: unknown;
}

export interface ZoomsParams {
  /** URL of the source image */
  image: string;
  [key: string]: unknown;
}

export interface StoryGeneratorParams {
  /** URL of the character image */
  image: string;
  [key: string]: unknown;
}

export interface CaptionGeneratorParams {
  /** URL of the video to process */
  url: string;
  /** Title for the video */
  title?: string;
  /** Language code (e.g. 'en') */
  language?: string;
  /** Caption style customization */
  caption_style?: {
    font_family?: string;
    font_size?: number;
    font_color?: string;
    bold?: boolean;
    italic?: boolean;
    background_color?: string;
    stroke_color?: string;
    stroke_width?: number;
  };
  [key: string]: unknown;
}

export interface VideoToScriptParams {
  /** URL of the video to process */
  url: string;
  /** Title for the job */
  title?: string;
  /** Language code (e.g. 'en') */
  language?: string;
  /** Script style */
  script_style?: 'general' | 'screenplay' | 'blog_post' | 'social_media' | 'documentary';
  [key: string]: unknown;
}

export interface VideoCleanerParams {
  /** URL of the video to process */
  url: string;
  /** Title for the job */
  title?: string;
  /** Language code (e.g. 'en') */
  language?: string;
  [key: string]: unknown;
}

export interface VideoUpscalerParams {
  /** URL of the video to upscale */
  video_url: string;
  /** Target resolution */
  target_resolution?: '1080p' | '2k' | '4k';
  /** Target FPS */
  target_fps?: '30fps' | '60fps';
  /** Title for the job */
  title?: string;
  [key: string]: unknown;
}

/** Dubbing provider model */
export type VideoDubbingModel = 'heygen' | 'elevenlabs' | 'sarvam';

/** Sarvam genre options for domain-specific dubbing accuracy */
export type SarvamGenre = 'general' | 'news' | 'entertainment' | 'education' | 'sports' | 'religious';

export interface VideoDubbingParams {
  /** URL of the video to dub */
  video_url: string;
  /**
   * Dubbing provider model. Default: 'heygen'
   * - 'heygen'    — full-featured dubbing with lip-sync
   * - 'elevenlabs' — high-quality voice dubbing, language as ISO code (e.g. 'hi')
   * - 'sarvam'    — Indian-language specialist, language as name (e.g. 'Hindi'), supports comma-separated multi-target
   */
  model?: VideoDubbingModel;
  /**
   * Target language. Format depends on model:
   * - heygen:     full name, e.g. 'Hindi (India)'
   * - elevenlabs: ISO code, e.g. 'hi'
   * - sarvam:     language name, e.g. 'Hindi' — comma-separate for multiple targets
   */
  output_language: string;

  // --- HeyGen-specific ---
  /** (heygen) Only translate audio, keep original video */
  translate_audio_only?: boolean;
  /** (heygen) Processing mode */
  mode?: 'speed' | 'precision';
  /** (heygen) Enable caption overlay */
  enable_caption?: boolean;
  /** (heygen) Enable speech enhancement */
  enable_speech_enhancement?: boolean;

  // --- ElevenLabs / Sarvam shared ---
  /** (elevenlabs, sarvam) Source language ISO code or name */
  source_lang?: string;
  /** (elevenlabs, sarvam) Number of speakers in the video */
  num_speakers?: number;

  // --- ElevenLabs-specific ---
  /** (elevenlabs) Output at highest available resolution */
  highest_resolution?: boolean;
  /** (elevenlabs) Remove background audio from output */
  drop_background_audio?: boolean;
  /** (elevenlabs) Filter profanity from output */
  use_profanity_filter?: boolean;

  // --- Sarvam-specific ---
  /** (sarvam) Content genre for domain-specific accuracy */
  genre?: SarvamGenre;

  /** Title for the job */
  title?: string;
  [key: string]: unknown;
}

export interface ShortVideoCreatorParams {
  /** URL of the video (min 60s) */
  url: string;
  /** Clip duration: 5, 15, 30, 45, or 'auto' */
  clip_duration_sec: number | 'auto';
  /** Title for the job */
  title?: string;
  /** Language code */
  language?: string;
  /** Aspect ratio */
  aspect_ratio?: 'auto' | '9:16' | '1:1' | '16:9';
  /** Max clips: 1-20 or 'auto' */
  max_clips?: number | 'auto';
  [key: string]: unknown;
}

export interface BrollParams {
  /** URL of the video (min 10s) */
  url: string;
  /** B-roll duration per insertion: 2-10 or 'auto' */
  broll_duration_sec?: number | 'auto';
  /** Max insertions: 1-20 or 'auto' */
  max_insertions?: number | 'auto';
  /** Aspect ratio */
  aspect_ratio?: 'auto' | '9:16' | '1:1' | '16:9';
  /** Title for the job */
  title?: string;
  /** Language code */
  language?: string;
  [key: string]: unknown;
}

export interface YouTubeDownloaderParams {
  /** YouTube video URL */
  url: string;
  /** Quality */
  quality?: '360p' | '480p' | '720p' | '1080p';
  /** Format */
  format?: 'mp4' | 'mp3';
  [key: string]: unknown;
}

export interface PromptRefinementParams {
  /** The original prompt to refine */
  user_input: string;
  /** What to avoid */
  negative_prompt?: string;
  /** Generation type */
  generate_type?: 'video' | 'image';
  /** Aspect ratio */
  aspect_ratio?: string;
  /** Enhancement mode */
  enhance_mode?: 'balanced' | 'cinematic' | 'ultra_realism' | 'viral_social' | 'commercial_ad' | 'artistic';
  /** Target model name */
  model?: string;
  /** Quality level */
  quality?: string;
  /** Camera angle/movement */
  camera?: string;
  /** Lighting style */
  lighting?: string;
  /** Visual style */
  style?: string;
  /** Mood/atmosphere */
  mood?: string;
  /** Color grading */
  color_grading?: string;
  /** Target resolution */
  resolution?: string;
  [key: string]: unknown;
}

export interface HoliSpecialParams {
  /** URL or local path of the image */
  image: string;
  [key: string]: unknown;
}

export interface SimpleAppParams {
  /** URL or local path of the image */
  image: string;
  /** App ID for the simple app tool */
  app_id?: string;
  /** Optional prompt */
  prompt?: string;
  [key: string]: unknown;
}

export interface VoiceChangerParams {
  /** URL or local path of the source audio to transform */
  source_audio_url: string;
  /** Target voice ID */
  voice_id?: string;
  /** Reference voice audio URL or local path for voice cloning */
  target_voice_url?: string;
  /** Voice strength for cloning (0-1, default 1.0) */
  voice_strength?: number;
  [key: string]: unknown;
}

export interface ImageToSvgParams {
  /** URL or local path of the image to convert to SVG vector */
  image_url: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
// Wait options (for built-in polling)
// ─────────────────────────────────────────────

export interface WaitOptions {
  /** If true, polls until COMPLETED or FAILED. Default: true */
  waitForCompletion?: boolean;
  /** Timeout in ms. Default: 5 minutes */
  timeoutMs?: number;
  /** Poll interval in ms. Default: 3000 */
  pollIntervalMs?: number;
  /**
   * Local file path to download the result to.
   * If provided, the output (video/image/audio) is auto-downloaded after completion.
   * @example { output: './result.mp4' }
   */
  output?: string;
}

// ─────────────────────────────────────────────
// Generation Results
// ─────────────────────────────────────────────

export type GenerationType = 'video' | 'image' | 'tts' | 'voice' | 'upscale' | 'face-swap' | 'virtual-try-on' | 'outfit-swap' | 'skin-enhancer' | 'behind-the-scene' | 'angles' | 'nine-shorts' | 'zooms' | 'story-generator' | 'caption-generator' | 'video-to-script' | 'video-cleaner' | 'video-upscaler' | 'video-dubbing' | 'short-video-creator' | 'broll' | 'youtube-downloader' | 'holi-special' | 'simple-app' | 'voice-changer' | 'image-to-svg';

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
  /** Optional Zod schema for input validation. If omitted, any inputs object is accepted. */
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
