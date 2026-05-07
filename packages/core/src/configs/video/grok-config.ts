import type { ModelConfig } from '../types';

export const GROK_VIDEO_CONFIG: Record<string, ModelConfig> = {
  'grok-imagine-video': {
    quality: 'high',
    supports_text_to_video: true,
    supports_image_to_video: true,
    aspect_ratios: ['auto', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16'],
    duration: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    resolutions: ['480p', '720p'],
    default_duration: '6s',
    default_aspect_ratio: 'auto',
    default_resolution: '720p',
  },
};

export const GROK_FALLBACK_CONFIG: ModelConfig = GROK_VIDEO_CONFIG['grok-imagine-video'];
