import * as path from 'path';
import * as fs from 'fs';
import { render } from 'zyka-sdk';
import type { Composition, ZykaRenderResult } from 'zyka-sdk';

export async function runRender(
  filePath: string,
  opts: { inputs?: string; output?: string; silent?: boolean }
): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${absolutePath}`);
    process.exit(1);
  }

  // Parse inputs
  let inputs: Record<string, unknown> = {};
  if (opts.inputs) {
    try {
      inputs = JSON.parse(opts.inputs);
    } catch {
      console.error('❌ --inputs must be valid JSON. Example: --inputs \'{"prompt":"A sunset"}\' ');
      process.exit(1);
    }
  }

  // Dynamic import of the composition file
  let compositionModule: { default?: Composition };
  try {
    // Support both CommonJS and ESM
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    compositionModule = require(absolutePath);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Failed to load composition file: ${msg}`);
    console.error('\nHint: Make sure you have compiled your TypeScript first:');
    console.error('  npx tsc && npx zyka render dist/my-video.js --inputs \'{}\'');
    process.exit(1);
  }

  const comp = compositionModule?.default || (compositionModule as unknown as Composition);
  if (!comp || typeof comp !== 'object' || !comp.id || !comp.scenes) {
    console.error('❌ Composition file must export a default Composition (from `composition()`)');
    process.exit(1);
  }

  let result: ZykaRenderResult;
  try {
    result = await render(comp, inputs, undefined, {
      silent: opts.silent,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Render failed: ${msg}\n`);
    process.exit(1);
  }

  // Write output JSON
  const outputJson = JSON.stringify(result, null, 2);
  if (opts.output) {
    const outputPath = path.resolve(process.cwd(), opts.output);
    fs.writeFileSync(outputPath, outputJson);
    console.log(`\n📄 Result written to: ${outputPath}\n`);
  } else {
    // Print scene outputs summary
    console.log('\n📊 Scene Results:\n');
    for (const [sceneId, sceneResult] of Object.entries(result.scenes)) {
      console.log(`   ${sceneId}:`);
      console.log(`     Status:  ${sceneResult.status}`);
      if (sceneResult.outputUrl) {
        console.log(`     Output:  ${sceneResult.outputUrl}`);
      }
    }
    console.log();
  }
}
