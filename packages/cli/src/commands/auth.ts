import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';

const ZYKA_CONFIG_DIR = path.join(os.homedir(), '.zyka');
const ZYKA_CONFIG_PATH = path.join(ZYKA_CONFIG_DIR, 'config.json');

function question(prompt: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function authLogin(): Promise<void> {
  console.log('\n🔑 Zyka Auth Login\n');
  console.log('Get your API token from: https://app.zyka.ai/settings/api-keys\n');

  const token = await question('Paste your ZYKA_API_TOKEN: ');
  if (!token) {
    console.error('❌ No token provided. Aborting.');
    process.exit(1);
  }

  const apiUrl = await question('API URL [https://api.zyka.ai]: ');

  if (!fs.existsSync(ZYKA_CONFIG_DIR)) {
    fs.mkdirSync(ZYKA_CONFIG_DIR, { recursive: true });
  }

  const config = {
    token,
    apiUrl: apiUrl || 'https://api.zyka.ai',
    savedAt: new Date().toISOString(),
  };

  fs.writeFileSync(ZYKA_CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log(`\n✅ Token saved to ${ZYKA_CONFIG_PATH}`);
  console.log('   You can now run: npx zyka render <file>\n');
}

export function authWhoami(): void {
  if (!fs.existsSync(ZYKA_CONFIG_PATH)) {
    console.log('❌ Not logged in. Run: zyka auth login');
    return;
  }
  const cfg = JSON.parse(fs.readFileSync(ZYKA_CONFIG_PATH, 'utf-8'));
  console.log('\n🔑 Zyka Auth Status:');
  console.log(`   API URL: ${cfg.apiUrl}`);
  console.log(`   Token:   ${cfg.token.slice(0, 8)}...`);
  console.log(`   Saved:   ${cfg.savedAt}\n`);
}

export function authLogout(): void {
  if (fs.existsSync(ZYKA_CONFIG_PATH)) {
    fs.unlinkSync(ZYKA_CONFIG_PATH);
    console.log('✅ Logged out. Token removed.\n');
  } else {
    console.log('ℹ️  Not logged in.\n');
  }
}
