import * as fs from 'fs';
import * as path from 'path';
import type { ModelConfig } from './configs/types';
import { getVideoModelConfig, listVideoSubModels, VIDEO_CONFIGS_BY_MODEL } from './configs/video';
import { isLocalPath } from './file-utils';
import type { VideoGenerationParams } from './types';

// MIME map mirrors file-utils.ts so we resolve a local path's MIME the same way
// the upload pipeline does.
const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

function mimeFromPath(p: string): string | undefined {
  const ext = path.extname(p).toLowerCase();
  return MIME_BY_EXT[ext];
}

function fileSizeMb(p: string): number | undefined {
  try {
    const stat = fs.statSync(path.resolve(p));
    return stat.size / (1024 * 1024);
  } catch {
    return undefined;
  }
}

/**
 * Case-insensitive array membership. Configs sometimes mix casing
 * (e.g. `'image/WebP'` vs `'image/webp'`) so we normalise both sides.
 */
function includesCi(list: string[], val: string): boolean {
  const lower = val.toLowerCase();
  return list.some((item) => item.toLowerCase() === lower);
}

function normaliseDuration(value: number | string | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(num) ? num : undefined;
}

function fmtList(items: Array<string | number>): string {
  return items.map((i) => `'${i}'`).join(', ');
}

// ─────────────────────────────────────────────
// Per-field validators
// ─────────────────────────────────────────────

function checkSubModel(model: string, sub_model: string | undefined, warnings: string[]): ModelConfig | undefined {
  const entry = VIDEO_CONFIGS_BY_MODEL[model];
  if (!entry) return undefined; // unknown provider — silent (server may know it)

  if (sub_model && !entry.configs[sub_model]) {
    const known = listVideoSubModels(model) || [];
    warnings.push(
      `[zyka-sdk] Unknown sub_model '${sub_model}' for model '${model}'. ` +
      `Known: ${fmtList(known)}. Falling back to provider defaults — server may reject if unsupported.`
    );
    return entry.fallback;
  }
  return getVideoModelConfig(model, sub_model);
}

function checkDuration(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  const raw = params.duration ?? params.seconds;
  const dur = normaliseDuration(raw as number | string | undefined);
  if (dur === undefined) return;

  if (cfg.duration && cfg.duration.length > 0 && !cfg.duration.includes(dur)) {
    warnings.push(
      `[zyka-sdk] duration=${dur}s is not in the supported list for ` +
      `'${params.sub_model || params.model}'. Supported: ${fmtList(cfg.duration)}.`
    );
  }
  if (cfg.min_duration !== undefined && dur < cfg.min_duration) {
    warnings.push(`[zyka-sdk] duration=${dur}s is below the minimum (${cfg.min_duration}s).`);
  }
  if (cfg.max_duration !== undefined && dur > cfg.max_duration) {
    warnings.push(`[zyka-sdk] duration=${dur}s exceeds the maximum (${cfg.max_duration}s).`);
  }
}

function checkResolution(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  // Some models use `size` for resolution (sora, wan), others use `resolution` (bytedance, ltx).
  const value = (params.resolution as string | undefined) || (params.size as string | undefined);
  if (!value) return;
  if (cfg.resolutions && cfg.resolutions.length > 0 && !cfg.resolutions.includes(value)) {
    warnings.push(
      `[zyka-sdk] resolution/size='${value}' is not supported by ` +
      `'${params.sub_model || params.model}'. Supported: ${fmtList(cfg.resolutions)}.`
    );
  }
}

function checkAspectRatio(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (!params.aspect_ratio) return;
  if (cfg.aspect_ratios && cfg.aspect_ratios.length > 0 && !cfg.aspect_ratios.includes(params.aspect_ratio)) {
    warnings.push(
      `[zyka-sdk] aspect_ratio='${params.aspect_ratio}' is not supported by ` +
      `'${params.sub_model || params.model}'. Supported: ${fmtList(cfg.aspect_ratios)}.`
    );
  }
}

function checkMode(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (!params.mode) return;
  if (cfg.modes && cfg.modes.length > 0 && !cfg.modes.includes(params.mode)) {
    warnings.push(
      `[zyka-sdk] mode='${params.mode}' is not supported by ` +
      `'${params.sub_model || params.model}'. Supported: ${fmtList(cfg.modes)}.`
    );
  }
}

function checkVideoQuality(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (!params.video_quality) return;
  if (cfg.video_qualities && cfg.video_qualities.length > 0 && !cfg.video_qualities.includes(params.video_quality)) {
    warnings.push(
      `[zyka-sdk] video_quality='${params.video_quality}' is not supported by ` +
      `'${params.sub_model || params.model}'. Supported: ${fmtList(cfg.video_qualities)}.`
    );
  }
}

function checkPrompt(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (params.prompt && cfg.max_prompt_length && params.prompt.length > cfg.max_prompt_length) {
    warnings.push(
      `[zyka-sdk] prompt is ${params.prompt.length} chars but the limit for ` +
      `'${params.sub_model || params.model}' is ${cfg.max_prompt_length}. The server may truncate or reject.`
    );
  }
  if (params.negative_prompt) {
    if (cfg.supports_negative_prompt === false) {
      warnings.push(
        `[zyka-sdk] '${params.sub_model || params.model}' does not support negative_prompt — it will be ignored.`
      );
    }
    if (cfg.max_negative_prompt_length && params.negative_prompt.length > cfg.max_negative_prompt_length) {
      warnings.push(
        `[zyka-sdk] negative_prompt is ${params.negative_prompt.length} chars but the limit is ${cfg.max_negative_prompt_length}.`
      );
    }
  }
}

function checkCfgScale(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (params.cfg_scale === undefined) return;
  if (cfg.supports_cfg_scale === false) {
    warnings.push(
      `[zyka-sdk] '${params.sub_model || params.model}' does not support cfg_scale — it will be ignored.`
    );
    return;
  }
  if (cfg.cfg_scale_range) {
    const [min, max] = cfg.cfg_scale_range;
    if (params.cfg_scale < min || params.cfg_scale > max) {
      warnings.push(
        `[zyka-sdk] cfg_scale=${params.cfg_scale} is outside the supported range [${min}, ${max}].`
      );
    }
  }
}

function checkAudioGuidanceScale(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (params.audio_guidance_scale === undefined) return;
  if (cfg.cfg_scale_range) {
    const [min, max] = cfg.cfg_scale_range;
    if (params.audio_guidance_scale < min || params.audio_guidance_scale > max) {
      warnings.push(
        `[zyka-sdk] audio_guidance_scale=${params.audio_guidance_scale} is outside the supported range [${min}, ${max}].`
      );
    }
  }
}

function checkTurboMode(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (params.turbo_mode && cfg.supports_turbo_mode !== true) {
    warnings.push(
      `[zyka-sdk] '${params.sub_model || params.model}' does not support turbo_mode — it will be ignored.`
    );
  }
}

function checkInputType(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (!params.input_type) return;
  if (cfg.input_types && cfg.input_types.length > 0 && !cfg.input_types.includes(params.input_type)) {
    warnings.push(
      `[zyka-sdk] input_type='${params.input_type}' is not supported. Supported: ${fmtList(cfg.input_types)}.`
    );
  }
}

function checkPersonCount(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (!params.person_count) return;
  if (cfg.person_count && cfg.person_count.length > 0 && !cfg.person_count.includes(params.person_count)) {
    warnings.push(
      `[zyka-sdk] person_count='${params.person_count}' is not supported. Supported: ${fmtList(cfg.person_count)}.`
    );
  }
}

function checkShotType(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  if (!params.shot_type) return;
  if (cfg.shot_type && cfg.shot_type.length > 0 && !cfg.shot_type.includes(params.shot_type)) {
    warnings.push(
      `[zyka-sdk] shot_type='${params.shot_type}' is not supported. Supported: ${fmtList(cfg.shot_type)}.`
    );
  }
}

function checkLocalFile(
  filePath: string,
  fieldName: string,
  modelLabel: string,
  cfg: ModelConfig,
  kind: 'image' | 'audio' | 'video',
  warnings: string[]
): void {
  if (!isLocalPath(filePath)) return; // remote URL — no probing

  const sizeMb = fileSizeMb(filePath);
  const mime = mimeFromPath(filePath);

  // Size check
  let limit: number | undefined;
  if (kind === 'image') limit = cfg.max_image_size_mb;
  else if (kind === 'audio') limit = cfg.max_audio_size_mb;
  else if (kind === 'video') limit = cfg.max_video_size_mb;

  if (sizeMb !== undefined && limit !== undefined && sizeMb > limit) {
    warnings.push(
      `[zyka-sdk] ${fieldName} ('${filePath}') is ${sizeMb.toFixed(1)}MB which exceeds the ` +
      `${kind} size limit (${limit}MB) for '${modelLabel}'.`
    );
  }

  // MIME check
  if (mime) {
    if (kind === 'image' && cfg.supported_mime_types && cfg.supported_mime_types.length > 0) {
      if (!includesCi(cfg.supported_mime_types, mime)) {
        warnings.push(
          `[zyka-sdk] ${fieldName} ('${filePath}') has MIME type '${mime}' which isn't in the ` +
          `supported list for '${modelLabel}': ${fmtList(cfg.supported_mime_types)}.`
        );
      }
    } else if (kind === 'audio' && cfg.audio_formats && cfg.audio_formats.length > 0) {
      if (!includesCi(cfg.audio_formats, mime)) {
        warnings.push(
          `[zyka-sdk] ${fieldName} ('${filePath}') has MIME type '${mime}' which isn't in the ` +
          `supported audio formats for '${modelLabel}': ${fmtList(cfg.audio_formats)}.`
        );
      }
    } else if (kind === 'video' && cfg.video_formats && cfg.video_formats.length > 0) {
      if (!includesCi(cfg.video_formats, mime)) {
        warnings.push(
          `[zyka-sdk] ${fieldName} ('${filePath}') has MIME type '${mime}' which isn't in the ` +
          `supported video formats for '${modelLabel}': ${fmtList(cfg.video_formats)}.`
        );
      }
    }
  }
}

function checkAudioDurationLimits(params: VideoGenerationParams, cfg: ModelConfig, warnings: string[]): void {
  // We don't probe audio duration (no ffprobe dep), but we surface the limits as a heads-up
  // so users are aware before the server rejects an over-long clip.
  if (!params.audio_url && !params.audio_url_2) return;

  const modelLabel = params.sub_model || params.model;

  // OmniHuman-style: separate limits per resolution
  if (cfg.audio_duration_limit_720p !== undefined || cfg.audio_duration_limit_1080p !== undefined) {
    const parts: string[] = [];
    if (cfg.audio_duration_limit_720p !== undefined) parts.push(`${cfg.audio_duration_limit_720p}s @ 720p`);
    if (cfg.audio_duration_limit_1080p !== undefined) parts.push(`${cfg.audio_duration_limit_1080p}s @ 1080p`);
    warnings.push(
      `[zyka-sdk] '${modelLabel}' has audio duration limits: ${parts.join(', ')}. ` +
      `Audio longer than this will be rejected by the server.`
    );
  }

  // WAN-style: [min, max] window
  if (cfg.min_max_audio_duration) {
    const [min, max] = cfg.min_max_audio_duration;
    warnings.push(
      `[zyka-sdk] '${modelLabel}' supports audio between ${min}s and ${max}s. ` +
      `Audio outside this window will be rejected.`
    );
  }

  // max_audio_files heads-up only when user passes audio_url_2
  if (params.audio_url_2 && cfg.max_audio_files !== undefined && cfg.max_audio_files < 2) {
    warnings.push(
      `[zyka-sdk] '${modelLabel}' supports at most ${cfg.max_audio_files} audio file(s) — audio_url_2 will be ignored.`
    );
  }
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export interface ValidationResult {
  warnings: string[];
  /** The ModelConfig we resolved, if any — handy for callers that want to introspect. */
  config?: ModelConfig;
}

/**
 * Validate video generation params against the SDK's known model configs.
 * Returns soft warnings — never throws. The SDK forwards the request to the
 * server regardless; warnings are advisory.
 */
export function validateVideoParams(params: VideoGenerationParams): ValidationResult {
  const warnings: string[] = [];
  const cfg = checkSubModel(params.model, params.sub_model, warnings);
  if (!cfg) return { warnings };

  const modelLabel = params.sub_model || params.model;

  checkDuration(params, cfg, warnings);
  checkResolution(params, cfg, warnings);
  checkAspectRatio(params, cfg, warnings);
  checkMode(params, cfg, warnings);
  checkVideoQuality(params, cfg, warnings);
  checkPrompt(params, cfg, warnings);
  checkCfgScale(params, cfg, warnings);
  checkAudioGuidanceScale(params, cfg, warnings);
  checkTurboMode(params, cfg, warnings);
  checkInputType(params, cfg, warnings);
  checkPersonCount(params, cfg, warnings);
  checkShotType(params, cfg, warnings);
  checkAudioDurationLimits(params, cfg, warnings);

  // Local file checks (size + MIME)
  if (params.image_url) checkLocalFile(params.image_url, 'image_url', modelLabel, cfg, 'image', warnings);
  if (params.first_frame) checkLocalFile(params.first_frame, 'first_frame', modelLabel, cfg, 'image', warnings);
  if (params.last_frame) checkLocalFile(params.last_frame, 'last_frame', modelLabel, cfg, 'image', warnings);
  if (params.inputReference) checkLocalFile(params.inputReference, 'inputReference', modelLabel, cfg, 'image', warnings);
  if (params.audio_url) checkLocalFile(params.audio_url, 'audio_url', modelLabel, cfg, 'audio', warnings);
  if (params.audio_url_2) checkLocalFile(params.audio_url_2, 'audio_url_2', modelLabel, cfg, 'audio', warnings);
  if (params.video_url) checkLocalFile(params.video_url, 'video_url', modelLabel, cfg, 'video', warnings);

  return { warnings, config: cfg };
}
