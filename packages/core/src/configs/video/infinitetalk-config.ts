import type { ModelConfig } from '../types';

export const INFINITETALK_VIDEO_CONFIG: Record<string, ModelConfig> = {
  infinite_talk: {
    quality: 'high',
    supports_text_to_video: true,
    supports_image_to_video: true,
    supports_video_to_video: true,
    supports_multi_person: true,
    supports_single_person: true,
    supports_audio: true,
    input_types: ['image', 'video'],
    person_count: ['single', 'multi'],
    resolutions: ['auto', '512x512', '960x540', '540x960', 'custom'],
    default_resolution: 'auto',
    default_input_type: 'image',
    default_person_count: 'single',
    max_audio_files: 2,
    audio_formats: ['audio/wav', 'audio/mpeg'],
    max_video_size_mb: 200,
  },
};

export const INFINITETALK_FALLBACK_CONFIG: ModelConfig = INFINITETALK_VIDEO_CONFIG['infinite_talk'];
