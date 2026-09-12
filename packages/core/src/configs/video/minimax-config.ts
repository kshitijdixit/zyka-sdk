import type { ModelConfig } from '../types';

// MiniMax H3 / H3 Max (Hailuo) — T2V / I2V auto-routed by `image_url`;
// H3 Max additionally routes to reference-to-video when any `reference_*_urls` is present.
// Duration is a free integer range (5–15s), so we use min/max rather than a fixed list.
export const MINIMAX_VIDEO_CONFIG: Record<string, ModelConfig> = {
  'minimax-h3': {
    quality: 'high',
    supports_text_to_video: true,
    supports_image_to_video: true,
    supports_first_last_frames: true,
    supports_prompt_expansion: true,
    supports_seed: true,
    min_duration: 5,
    max_duration: 15,
    resolutions: ['480P', '768P', '2K', '4K'],
    aspect_ratios: ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'],
    default_duration: '5s',
    default_resolution: '2K',
    default_aspect_ratio: '16:9',
    max_prompt_length: 5000,
    supports_negative_prompt: false,
    supports_cfg_scale: false,
    supported_mime_types: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    output_format: 'mp4',
  },

  'minimax-h3-max': {
    quality: 'high',
    supports_text_to_video: true,
    supports_image_to_video: true,
    supports_first_last_frames: true,
    supports_reference_to_video: true,
    supports_prompt_expansion: true,
    supports_seed: true,
    min_duration: 5,
    max_duration: 15,
    resolutions: ['480P', '768P'],
    aspect_ratios: ['adaptive', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16'],
    default_duration: '5s',
    default_resolution: '768P',
    default_aspect_ratio: '16:9',
    max_prompt_length: 5000,
    max_multi_images: 9,
    max_reference_videos: 3,
    max_reference_audio: 3,
    supports_negative_prompt: false,
    supports_cfg_scale: false,
    supported_mime_types: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    output_format: 'mp4',
  },
};

export const MINIMAX_FALLBACK_CONFIG: ModelConfig = MINIMAX_VIDEO_CONFIG['minimax-h3'];
