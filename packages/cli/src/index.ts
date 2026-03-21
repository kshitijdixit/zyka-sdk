#!/usr/bin/env node
import { Command } from 'commander';
import { authLogin, authWhoami, authLogout } from './commands/auth';
import { init } from './commands/init';
import { runRender } from './commands/render';

const program = new Command();

program
  .name('zyka')
  .description('Zyka SDK CLI — programmatic AI media generation')
  .version('0.1.0');

// ── zyka auth ────────────────────────────────

const auth = program.command('auth').description('Manage Zyka API authentication');

auth
  .command('login')
  .description('Save your Zyka API token')
  .action(async () => {
    await authLogin();
  });

auth
  .command('whoami')
  .description('Show currently saved token info')
  .action(() => {
    authWhoami();
  });

auth
  .command('logout')
  .description('Remove saved token')
  .action(() => {
    authLogout();
  });

// ── zyka init ────────────────────────────────

program
  .command('init <project-name>')
  .description('Scaffold a new Zyka project')
  .action(async (projectName: string) => {
    await init(projectName);
  });

// ── zyka render ──────────────────────────────

program
  .command('render <file>')
  .description('Run a Zyka composition file')
  .option('-i, --inputs <json>', 'JSON string of input parameters', '{}')
  .option('-o, --output <path>', 'Write result JSON to this file path')
  .option('--silent', 'Suppress progress output')
  .action(async (file: string, opts: { inputs?: string; output?: string; silent?: boolean }) => {
    await runRender(file, opts);
  });

// ── zyka studio ─────────────────────────────

program
  .command('studio')
  .description('Open the Zyka Studio dashboard (coming soon)')
  .action(() => {
    console.log('\n🚧 Zyka Studio is coming in Phase 2!\n');
    console.log('   It will provide a browser-based pipeline dashboard.');
    console.log('   For now, use: npx zyka render <file>\n');
  });

program.parse(process.argv);
