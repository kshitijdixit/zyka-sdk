import type { ModelConfig } from '../types';

export const VEO_VIDEO_CONFIG: Record<string, ModelConfig> = {
  'veo-3.1-generate-001': {
    quality: 'high',
    supports_text_to_video: true,
    supports_image_to_video: true,
    supports_first_last_frames: true,
    supports_negative_prompt: true,
    aspect_ratios: ['16:9', '9:16'],
    duration: [4, 6, 8],
    resolutions: ['720p', '1080p'],
    default_duration: '4s',
    default_aspect_ratio: '16:9',
    default_resolution: '1080p',
    max_image_size_mb: 20,
    compress_images_before_upload: true,
    supported_mime_types: ['image/png', 'image/jpeg'],
  },

  'veo-3.1-fast-generate-001': {
    quality: 'high',
    speed: 'fast',
    supports_text_to_video: true,
    supports_image_to_video: true,
    supports_first_last_frames: true,
    supports_negative_prompt: true,
    aspect_ratios: ['16:9', '9:16'],
    duration: [4, 6, 8],
    resolutions: ['1080p', '720p'],
    default_duration: '4s',
    default_aspect_ratio: '16:9',
    default_resolution: '1080p',
    max_image_size_mb: 20,
    compress_images_before_upload: true,
    supported_mime_types: ['image/png', 'image/jpeg'],
  },
};

export const VEO_FALLBACK_CONFIG: ModelConfig = VEO_VIDEO_CONFIG['veo-3.1-generate-001'];
