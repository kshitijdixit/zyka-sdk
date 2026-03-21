import type {
  Composition,
  CompositionConfig,
  Scene,
  SceneFn,
} from './types';

/**
 * Define a named pipeline composition.
 *
 * @example
 * const MyVideo = composition({
 *   id: 'my-video',
 *   scenes: [
 *     scene('bg', async ({ inputs }) => renderVideo({ model: 'kling-v2', prompt: inputs.prompt })),
 *   ]
 * });
 */
export function composition<TInputs extends Record<string, unknown> = Record<string, unknown>>(
  config: CompositionConfig<TInputs>
): Composition<TInputs> {
  if (!config.id) throw new Error('Composition must have an `id`');
  if (!config.scenes || config.scenes.length === 0) {
    throw new Error(`Composition "${config.id}" must have at least one scene`);
  }
  return { ...config };
}

/**
 * Define a single pipeline step (scene).
 *
 * @param id         Unique ID for this scene within the composition
 * @param fn         Async function that calls Zyka API helpers and returns a GenerationResult
 * @param dependsOn  (optional) list of scene IDs that must complete before this one starts
 */
export function scene<TInputs extends Record<string, unknown> = Record<string, unknown>>(
  id: string,
  fn: SceneFn<TInputs>,
  dependsOn?: string[]
): Scene<TInputs> {
  if (!id) throw new Error('Scene must have an `id`');
  return { id, fn, dependsOn };
}
