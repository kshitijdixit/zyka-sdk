import type { ModelConfig } from '../types';

export const AURORA_VIDEO_CONFIG: Record<string, ModelConfig> = {
  aurora: {
    supports_image_to_video: true,
    supports_audio: true,
    supports_lipsync: true,
    input_types: ['image'],
    resolutions: ['480p', '720p'],
    default_resolution: '480p',
    cfg_scale_range: [0, 10],
    audio_formats: ['audio/wav', 'audio/mpeg'],
    max_audio_files: 1,
  },
};

export const AURORA_FALLBACK_CONFIG: ModelConfig = AURORA_VIDEO_CONFIG['aurora'];
