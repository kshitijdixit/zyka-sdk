import { ZykaClient } from './client';
import type {
  Composition,
  ZykaConfig,
  ZykaRenderResult,
  SceneResultMap,
  GenerationResult,
  GenerationType,
  SceneContext,
} from './types';

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_POLL_INTERVAL_MS = 3000;

// ─────────────────────────────────────────────
// Polling
// ─────────────────────────────────────────────

async function waitForCompletion(
  client: ZykaClient,
  type: GenerationType,
  id: string,
  timeoutMs: number,
  pollIntervalMs: number,
  onProgress?: (result: GenerationResult) => void
): Promise<GenerationResult> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result = await client.checkStatus(type, id);
    onProgress?.(result);

    if (result.status === 'COMPLETED') return result;
    if (result.status === 'FAILED') {
      throw new Error(`Generation ${id} (${type}) failed.`);
    }

    await sleep(pollIntervalMs);
  }

  throw new Error(
    `Timed out waiting for ${type} generation "${id}" after ${timeoutMs / 1000}s`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────
// Topological sort (dependency resolution)
// ─────────────────────────────────────────────

function topoSort<TInputs extends Record<string, unknown>>(
  scenes: Composition<TInputs>['scenes']
): Composition<TInputs>['scenes'] {
  const sceneMap = new Map(scenes.map((s) => [s.id, s]));
  const visited = new Set<string>();
  const sorted: Composition<TInputs>['scenes'] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const s = sceneMap.get(id);
    if (!s) throw new Error(`Scene "${id}" not found in composition`);
    for (const dep of s.dependsOn || []) {
      visit(dep);
    }
    sorted.push(s);
  }

  for (const s of scenes) visit(s.id);
  return sorted;
}

// ─────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────

export interface RenderOptions {
  /** Called after each scene completes (for progress reporting) */
  onSceneComplete?: (sceneId: string, result: GenerationResult) => void;
  /** Called when a scene's generation is polled */
  onSceneProgress?: (sceneId: string, result: GenerationResult) => void;
  /** Suppress console output */
  silent?: boolean;
}

export async function render<TInputs extends Record<string, unknown>>(
  comp: Composition<TInputs>,
  inputs: TInputs,
  config?: ZykaConfig,
  options?: RenderOptions
): Promise<ZykaRenderResult> {
  // Validate inputs against schema if provided
  if (comp.inputSchema) {
    const parsed = comp.inputSchema.safeParse(inputs);
    if (!parsed.success) {
      throw new Error(
        `Invalid inputs for composition "${comp.id}":\n${parsed.error?.message || 'Validation failed'}`
      );
    }
  }

  const resolvedConfig: Required<ZykaConfig> = {
    apiUrl: config?.apiUrl || process.env.ZYKA_API_URL || 'https://api.zyka.ai',
    token: config?.token || process.env.ZYKA_API_TOKEN || '',
    timeoutMs: config?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    pollIntervalMs: config?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS,
  };

  const client = new ZykaClient(resolvedConfig);
  const startedAt = new Date().toISOString();
  const sceneResults: SceneResultMap = {};

  // Topologically sort scenes respecting dependsOn
  const sortedScenes = topoSort(comp.scenes);

  if (!options?.silent) {
    console.log(`\n🚀 Rendering composition: ${comp.id}`);
    console.log(`   Scenes: ${sortedScenes.map((s) => s.id).join(' → ')}\n`);
  }

  for (const s of sortedScenes) {
    const ctx: SceneContext<TInputs> = {
      inputs,
      config: resolvedConfig,
      useAsset: (sceneId: string) => {
        const r = sceneResults[sceneId];
        if (!r) {
          throw new Error(
            `useAsset("${sceneId}"): scene "${sceneId}" has not completed yet. ` +
            `Add it to dependsOn for scene "${s.id}".`
          );
        }
        return r;
      },
    };

    if (!options?.silent) {
      process.stdout.write(`   ⏳ [${s.id}] Starting...`);
    }

    // Run the scene function — it should call one of the renderXxx helpers
    // which return a "pending" GenerationResult, then we poll to completion
    let result = await s.fn(ctx);

    // If the result is still PENDING/PROCESSING, poll until done
    if (result.status === 'PENDING' || result.status === 'PROCESSING') {
      result = await waitForCompletion(
        client,
        result.type,
        result.id,
        resolvedConfig.timeoutMs,
        resolvedConfig.pollIntervalMs,
        (polled) => options?.onSceneProgress?.(s.id, polled)
      );
    }

    sceneResults[s.id] = result;
    options?.onSceneComplete?.(s.id, result);

    if (!options?.silent) {
      process.stdout.clearLine?.(0);
      process.stdout.cursorTo?.(0);
      console.log(`   ✅ [${s.id}] Done → ${result.outputUrl || '(no URL)'}`);
    }
  }

  const completedAt = new Date().toISOString();
  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();

  if (!options?.silent) {
    console.log(`\n🎉 Composition "${comp.id}" completed in ${(durationMs / 1000).toFixed(1)}s\n`);
  }

  return {
    compositionId: comp.id,
    inputs: inputs as Record<string, unknown>,
    scenes: sceneResults,
    startedAt,
    completedAt,
    durationMs,
  };
}
