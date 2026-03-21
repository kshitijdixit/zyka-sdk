import * as path from 'path';

/**
 * Resolve a file from the project's `public/` directory.
 * Like Remotion's `staticFile()` — just place assets in `public/` and reference them by name.
 *
 * The resolved path is a local file path. When passed to SDK methods like `createImage({ image: asset('photo.png') })`,
 * the SDK will automatically detect it as a local file and upload it before sending to the API.
 *
 * @example
 * import { asset } from 'zyka-sdk';
 *
 * // File at: ./public/photo.png
 * const result = await client.createImage({
 *   model: 'nano_banana',
 *   image: asset('photo.png'),
 *   prompt: 'make hair straight',
 * });
 *
 * @example
 * // Nested paths work too
 * asset('images/hero.jpg')  // resolves to ./public/images/hero.jpg
 */
export function asset(filename: string): string {
  return path.resolve(process.cwd(), 'public', filename);
}
