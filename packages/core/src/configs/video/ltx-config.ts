import type { ModelConfig } from '../types';

export const LTX_VIDEO_CONFIG: Record<string, ModelConfig> = {
  'ltx-2.3-text-to-video': {
    quality: 'high',
    supports_text_to_video: true,
    supports_sound_generation: true,
    resolutions: ['1080p', '1440p', '2160p'],
    aspect_ratios: ['16:9', '9:16'],
    duration: [6, 8, 10],
    fps: [24, 25, 48, 50],
    default_duration: '6s',
    default_aspect_ratio: '16:9',
    default_resolution: '1080p',
    default_fps: 25,
  },

  'ltx-2.3-image-to-video': {
    quality: 'high',
    supports_image_to_video: true,
    supports_first_last_frames: true,
    supports_sound_generation: true,
    resolutions: ['1080p', '1440p', '2160p'],
    aspect_ratios: ['auto', '16:9', '9:16'],
    duration: [6, 8, 10],
    fps: [24, 25, 48, 50],
    default_duration: '6s',
    default_aspect_ratio: 'auto',
    default_resolution: '1080p',
    default_fps: 25,
  },
};

export const LTX_FALLBACK_CONFIG: ModelConfig = LTX_VIDEO_CONFIG['ltx-2.3-text-to-video'];
