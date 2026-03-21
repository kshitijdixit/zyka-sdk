import * as fs from 'fs';
import * as path from 'path';

const STARTER_TEMPLATE = `import { composition, scene, renderVideo, renderImage, renderTTS } from 'zyka-sdk';
import { z } from 'zod';

/**
 * Starter Zyka Composition
 * Run: npx zyka render my-video.zyka.ts --inputs '{"prompt":"A sunrise over mountains"}'
 */
const StarterVideo = composition({
  id: 'starter-video',
  description: 'Hello World — generate a video from a text prompt',

  inputSchema: z.object({
    prompt: z.string().describe('The scene description'),
  }),

  scenes: [
    // Scene 1: Refine the prompt (optional)
    scene('refined-prompt', async ({ inputs, config }) => {
      // For now, just echo back a success result
      // In real usage: call refinePrompt(inputs.prompt, 'video', config)
      return {
        id: 'local-refined-prompt',
        type: 'image' as const,
        status: 'COMPLETED' as const,
        outputUrl: inputs.prompt,
        metadata: { refined: inputs.prompt },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),

    // Scene 2: Generate video from the prompt
    scene(
      'main-video',
      async ({ inputs, config }) =>
        renderVideo(
          {
            model: 'kling-v2',
            prompt: inputs.prompt,
            duration: 5,
            aspect_ratio: '16:9',
          },
          config
        ),
      ['refined-prompt'] // depends on scene above
    ),
  ],
});

export default StarterVideo;
`;

const STARTER_PACKAGE_JSON = `{
  "name": "my-zyka-project",
  "version": "1.0.0",
  "description": "My Zyka programmatic media project",
  "scripts": {
    "render": "npx zyka render my-video.zyka.ts"
  },
  "dependencies": {
    "zyka-sdk": "^0.1.0"
  }
}
`;

const STARTER_README = `# My Zyka Project

This project uses the [Zyka SDK](https://github.com/zyka-ai/zyka-sdk) to programmatically generate AI videos.

## Getting Started

1. **Set your API token** (get it from https://app.zyka.ai/settings/api-keys):
   \`\`\`bash
   npx zyka auth login
   # or: export ZYKA_API_TOKEN=your_token_here
   \`\`\`

2. **Run your composition:**
   \`\`\`bash
   npx zyka render my-video.zyka.ts --inputs '{"prompt":"A cinematic sunrise over mountains"}'
   \`\`\`

## Project Structure

\`\`\`
my-zyka-project/
├── my-video.zyka.ts   # Your composition definition
└── package.json
\`\`\`

## What is a Composition?

A **composition** is a pipeline of AI generation steps (called **scenes**).
Each scene calls one of Zyka's AI APIs (\`renderVideo\`, \`renderImage\`, \`renderTTS\`, etc.)
and can depend on the output of previous scenes.

Think of it like Remotion — but instead of React components rendering frames,
you're writing pipelines of AI generation calls.

## Examples

See the \`examples/\` folder in the Zyka SDK repo for more:
- \`product-ad/\` — multi-scene product advertisement
- \`social-video/\` — image + voiceover pipeline
`;

export async function init(projectName: string): Promise<void> {
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  fs.writeFileSync(path.join(targetDir, 'my-video.zyka.ts'), STARTER_TEMPLATE);
  fs.writeFileSync(path.join(targetDir, 'package.json'), STARTER_PACKAGE_JSON);
  fs.writeFileSync(path.join(targetDir, 'README.md'), STARTER_README);
  fs.writeFileSync(path.join(targetDir, '.gitignore'), 'node_modules/\n.zyka/\n.env\n');

  console.log(`\n✅ Created Zyka project: ${projectName}/\n`);
  console.log('   Next steps:');
  console.log(`   1. cd ${projectName}`);
  console.log('   2. npm install');
  console.log('   3. npx zyka auth login    # save your API token');
  console.log(`   4. npx zyka render my-video.zyka.ts --inputs '{"prompt":"A sunset over mountains"}'\n`);
}
