import type { ModelConfig } from '../types';

export const SORA_VIDEO_CONFIG: Record<string, ModelConfig> = {
  'sora-2': {
    quality: 'high',
    supports_text_to_video: true,
    supports_image_to_video: true,
    duration: [4, 8, 12, 16, 20],
    resolutions: ['720x1280', '1280x720'],
    default_duration: '4s',
    default_resolution: '720x1280',
    max_prompt_length: 5000,
    max_image_size_mb: 20,
    max_videos_per_request: 1,
    supported_mime_types: ['image/png', 'image/jpeg', 'image/WebP'],
  },

  'sora-2-pro': {
    quality: 'premium',
    supports_text_to_video: true,
    supports_image_to_video: true,
    duration: [4, 8, 12, 16, 20],
    resolutions: ['720x1280', '1280x720', '1024x1792', '1792x1024', '1920x1080', '1080x1920'],
    default_duration: '4s',
    default_resolution: '720x1280',
    max_prompt_length: 15000,
    max_image_size_mb: 20,
    supported_mime_types: ['image/png', 'image/jpeg', 'image/WebP'],
  },
};

export const SORA_FALLBACK_CONFIG: ModelConfig = SORA_VIDEO_CONFIG['sora-2'];
