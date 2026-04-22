#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// Install the skill file into both ~/.claude/skills/ AND ~/.claude/commands/
// so it's available as a discoverable skill AND as a /zyka-ai slash command.
function installTo(targetFile, sourceContent, label) {
  try {
    const dir = path.dirname(targetFile);

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
        console.log(`[zyka] Updated Claude Code ${label} zyka-ai to latest version.`);
        return;
      }

      // No version marker — user-customized file, don't touch it
      console.log(`[zyka] Skipped ${label} install: ${targetFile} exists (custom).`);
      return;
    }

    // Create directory tree if needed
    fs.mkdirSync(dir, { recursive: true });

    // Write the file
    fs.writeFileSync(targetFile, sourceContent, 'utf-8');
    console.log(`[zyka] Installed Claude Code ${label}: /zyka-ai`);
  } catch (err) {
    // Never crash the install — postinstall failures block npm install
  }
}

function main() {
  try {
    const claudeDir = path.join(os.homedir(), '.claude');
    const skillsTarget = path.join(claudeDir, 'skills', 'zyka-ai.md');
    const commandsTarget = path.join(claudeDir, 'commands', 'zyka-ai.md');

    // Locate the skill source file relative to this script
    // scripts/postinstall.js -> skills/zyka-ai.md
    const sourceFile = path.join(__dirname, '..', 'skills', 'zyka-ai.md');

    if (!fs.existsSync(sourceFile)) {
      return;
    }

    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');

    installTo(skillsTarget, sourceContent, 'skill');
    installTo(commandsTarget, sourceContent, 'command');
  } catch (err) {
    // Never crash the install
  }
}

main();
