// Mirrors the frontend ModelConfig shape (zyka-frontend-v2/types/config-types.ts)
// so configs stay 1:1 syncable. Keep field names identical.

export interface ModelConfig {
  duration?: number[];
  aspect_ratios?: string[];
  resolutions?: string[];
  modes?: string[];
  character_orientations?: string[];
  shot_type?: string[];
  video_qualities?: string[];
  input_types?: string[];
  person_count?: string[];
  sound_options?: string[];

  quality?: string;
  framerate?: string;
  speed?: string;
  max_videos_per_request?: number;
  video_write_modes?: string[];

  fps?: number[];

  default_duration?: string;
  default_aspect_ratio?: string;
  default_resolution?: string;
  default_fps?: number;
  default_mode?: string;
  default_sound?: string;
  default_shot_type?: string;
  default_video_quality?: string;
  default_input_type?: string;
  default_person_count?: string;
  default_cfg_scale?: number;
  default_character_orientation?: string;

  supports_text_to_video?: boolean;
  supports_image_to_video?: boolean;
  supports_video_to_video?: boolean;
  supports_first_last_frames?: boolean;
  supports_multi_image_to_video?: boolean;
  supports_elements?: boolean;
  supports_ingredients?: boolean;
  supports_reference_to_video?: boolean;
  supports_negative_prompt?: boolean;
  supports_cfg_scale?: boolean;
  supports_sound?: boolean;
  supports_audio?: boolean;
  supports_native_audio?: boolean;
  supports_voice_list?: boolean;
  supports_voice_ids?: boolean;
  supports_multi_prompt?: boolean;
  supports_motion_control?: boolean;
  supports_character_animation?: boolean;
  supports_prompt_guidance?: boolean;
  supports_keep_original_sound?: boolean;
  supports_keep_audio?: boolean;
  supports_camera_fixed?: boolean;
  supports_generate_audio?: boolean;
  supports_sound_generation?: boolean;
  supports_turbo_mode?: boolean;
  supports_prompt_expansion?: boolean;
  supports_image_upload?: boolean;
  supports_lipsync?: boolean;
  supports_prompt_rewriting?: boolean;
  supports_prompt?: boolean;
  supports_multi_person?: boolean;
  supports_single_person?: boolean;
  supports_seed?: boolean;
  supports_reference_preview_in_prompt?: boolean;

  variant?: string;

  max_prompt_length?: number;
  max_negative_prompt_length?: number;
  max_image_size_mb?: number;
  compress_images_before_upload?: boolean;
  max_video_size_mb?: number;
  max_audio_size_mb?: number;
  max_audio_files?: number;
  max_multi_images?: number;
  audio_duration_limit_720p?: number;
  audio_duration_limit_1080p?: number;
  max_voice_list?: number;
  max_voice_ids?: number;
  min_max_audio_duration?: [number, number];

  max_shots?: number;
  max_elements?: number;
  max_element_images?: number;
  max_reference_videos?: number;
  max_reference_audio?: number;

  min_duration?: number;
  max_duration?: number;
  supports_max_duration?: number;

  cfg_scale_range?: [number, number];

  min_image_dimensions?: string;
  image_aspect_ratio_range?: string;

  output_format?: string;

  supported_mime_types?: string[];
  audio_formats?: string[];
  video_formats?: string[];
}
