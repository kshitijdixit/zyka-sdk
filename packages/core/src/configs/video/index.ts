import type { ModelConfig } from '../types';
import { SORA_VIDEO_CONFIG, SORA_FALLBACK_CONFIG } from './sora-config';
import { VEO_VIDEO_CONFIG, VEO_FALLBACK_CONFIG } from './veo-config';
import { KLING_VIDEO_CONFIG, KLING_FALLBACK_CONFIG } from './kling-config';
import { BYTEDANCE_VIDEO_CONFIG, BYTEDANCE_FALLBACK_CONFIG } from './bytedance-config';
import { WAN_VIDEO_CONFIG, WAN_FALLBACK_CONFIG } from './wan-config';
import { GROK_VIDEO_CONFIG, GROK_FALLBACK_CONFIG } from './grok-config';
import { AURORA_VIDEO_CONFIG, AURORA_FALLBACK_CONFIG } from './aurora-config';
import { INFINITETALK_VIDEO_CONFIG, INFINITETALK_FALLBACK_CONFIG } from './infinitetalk-config';
import { LTX_VIDEO_CONFIG, LTX_FALLBACK_CONFIG } from './ltx-config';

export {
  SORA_VIDEO_CONFIG,
  SORA_FALLBACK_CONFIG,
  VEO_VIDEO_CONFIG,
  VEO_FALLBACK_CONFIG,
  KLING_VIDEO_CONFIG,
  KLING_FALLBACK_CONFIG,
  BYTEDANCE_VIDEO_CONFIG,
  BYTEDANCE_FALLBACK_CONFIG,
  WAN_VIDEO_CONFIG,
  WAN_FALLBACK_CONFIG,
  GROK_VIDEO_CONFIG,
  GROK_FALLBACK_CONFIG,
  AURORA_VIDEO_CONFIG,
  AURORA_FALLBACK_CONFIG,
  INFINITETALK_VIDEO_CONFIG,
  INFINITETALK_FALLBACK_CONFIG,
  LTX_VIDEO_CONFIG,
  LTX_FALLBACK_CONFIG,
};

interface ProviderEntry {
  configs: Record<string, ModelConfig>;
  fallback: ModelConfig;
}

export const VIDEO_CONFIGS_BY_MODEL: Record<string, ProviderEntry> = {
  sora: { configs: SORA_VIDEO_CONFIG, fallback: SORA_FALLBACK_CONFIG },
  veo: { configs: VEO_VIDEO_CONFIG, fallback: VEO_FALLBACK_CONFIG },
  kling: { configs: KLING_VIDEO_CONFIG, fallback: KLING_FALLBACK_CONFIG },
  bytedance: { configs: BYTEDANCE_VIDEO_CONFIG, fallback: BYTEDANCE_FALLBACK_CONFIG },
  wan: { configs: WAN_VIDEO_CONFIG, fallback: WAN_FALLBACK_CONFIG },
  grok: { configs: GROK_VIDEO_CONFIG, fallback: GROK_FALLBACK_CONFIG },
  aurora: { configs: AURORA_VIDEO_CONFIG, fallback: AURORA_FALLBACK_CONFIG },
  infinite_talk: { configs: INFINITETALK_VIDEO_CONFIG, fallback: INFINITETALK_FALLBACK_CONFIG },
  ltx: { configs: LTX_VIDEO_CONFIG, fallback: LTX_FALLBACK_CONFIG },
};

/**
 * Look up a video model's config.
 *
 * - If `sub_model` is provided and matches, returns that exact config.
 * - If `sub_model` is omitted or unknown, returns the provider's fallback config.
 * - If `model` itself is unknown, returns `undefined`.
 */
export function getVideoModelConfig(model: string, sub_model?: string): ModelConfig | undefined {
  const entry = VIDEO_CONFIGS_BY_MODEL[model];
  if (!entry) return undefined;
  if (sub_model && entry.configs[sub_model]) return entry.configs[sub_model];
  return entry.fallback;
}

/**
 * List all known sub_models for a given video provider.
 * Returns `undefined` if the provider isn't known.
 */
export function listVideoSubModels(model: string): string[] | undefined {
  const entry = VIDEO_CONFIGS_BY_MODEL[model];
  if (!entry) return undefined;
  return Object.keys(entry.configs);
}
