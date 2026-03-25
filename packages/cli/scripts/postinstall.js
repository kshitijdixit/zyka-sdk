#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function main() {
  try {
    const claudeCommandsDir = path.join(os.homedir(), '.claude', 'commands');
    const targetFile = path.join(claudeCommandsDir, 'zyka-ai.md');

    // Locate the skill source file relative to this script
    // scripts/postinstall.js -> skills/zyka-ai.md
    const sourceFile = path.join(__dirname, '..', 'skills', 'zyka-ai.md');

    if (!fs.existsSync(sourceFile)) {
      return;
    }

    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');

    // Check if target already exists
    if (fs.existsSync(targetFile)) {
      const existingContent = fs.readFileSync(targetFile, 'utf-8');

      // If file has our version marker, it's auto-managed — safe to overwrite
      if (existingContent.includes('zyka-skill-version:')) {
        const existingVersion = existingContent.match(/zyka-skill-version:\s*([\d.]+)/);
        const sourceVersion = sourceContent.match(/zyka-skill-version:\s*([\d.]+)/);

        if (existingVersion && sourceVersion && existingVersion[1] === sourceVersion[1]) {
          // Same version, skip
          return;
        }

        fs.writeFileSync(targetFile, sourceContent, 'utf-8');
        console.log('[zyka] Updated Claude Code skill /zyka-ai to latest version.');
        return;
      }

      // No version marker — user-customized file, don't touch it
      console.log('[zyka] Skipped skill install: ~/.claude/commands/zyka-ai.md exists (custom).');
      return;
    }

    // Create directory tree if needed
    fs.mkdirSync(claudeCommandsDir, { recursive: true });

    // Write the skill file
    fs.writeFileSync(targetFile, sourceContent, 'utf-8');
    console.log('[zyka] Installed Claude Code skill: /zyka-ai (available in all projects!)');
  } catch (err) {
    // Never crash the install — postinstall failures block npm install
  }
}

main();
