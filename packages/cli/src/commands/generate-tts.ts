import type { Command } from 'commander';

export function registerGenerateTTS(generate: Command): void {
  generate
    .command('tts')
    .description('Generate text-to-speech audio')
    .requiredOption('--script <text>', 'Text to convert to speech')
    .option('--provider <provider>', 'TTS provider (elevenlabs, qwen3, chatterbox, voxcpm, minimax, moss-tts, fish-audio)', 'elevenlabs')
    .option('--voice-id <id>', 'Voice ID')
    .option('--voice <path>', 'Voice reference audio URL or local path (for voice cloning)')
    .option('--name <name>', 'Display name for this TTS generation')
    .option('--language <code>', 'Language code (qwen3, minimax)')
    .option('--language-boost <code>', 'Language boost code (minimax)')
    // Qwen3 options
    .option('--generation-type <type>', 'Qwen3 generation type: voice_design, voice_clone, custom_voice')
    .option('--voice-description <text>', 'Qwen3 voice description (for voice_design)')
    .option('--speaker <name>', 'Qwen3 speaker preset (Aiden, Dylan, Eric, Ryan, Serena, etc.)')
    .option('--instruct <text>', 'Qwen3 style instruction (for custom_voice)')
    .option('--ref-text <text>', 'Qwen3 reference transcript (for voice_clone)')
    // Chatterbox options
    .option('--temperature <n>', 'Chatterbox temperature 0-1 (default 0.7)')
    .option('--exaggeration <n>', 'Chatterbox exaggeration 0.5-2 (default 1.0)')
    .option('--speed <n>', 'Chatterbox speed 0.5-2 (default 1.0)')
    .option('--cfg-weight <n>', 'Chatterbox cfg_weight 0-1 (default 0.5)')
    // MOSS-TTS options
    .option('--voice-strength <n>', 'MOSS-TTS voice strength 0-1 (default 1.0)')
    // VoxCPM options
    .option('--prompt-text <text>', 'VoxCPM transcript of reference audio')
    // Fish Audio options
    .option('--reference-id <id>', 'Fish Audio model/voice ID')
    .option('-o, --output <path>', 'Download result to this file path')
    .option('--no-wait', 'Return immediately without waiting for completion')
    .action(async (opts: Record<string, string | boolean>) => {
      const { ZykaClient } = await import('zyka-sdk');
      const client = new ZykaClient();

      const params: Record<string, unknown> = {
        script: opts.script,
        provider: opts.provider || 'elevenlabs',
      };
      if (opts.voiceId) params.voice_id = opts.voiceId;
      if (opts.voice) params.actual_voice_url = opts.voice;
      if (opts.name) params.name = opts.name;
      if (opts.language) params.language = opts.language;
      if (opts.languageBoost) params.language_boost = opts.languageBoost;
      if (opts.generationType) params.generation_type = opts.generationType;
      if (opts.voiceDescription) params.voice_description = opts.voiceDescription;
      if (opts.speaker) params.speaker = opts.speaker;
      if (opts.instruct) params.instruct = opts.instruct;
      if (opts.refText) params.ref_text = opts.refText;
      if (opts.temperature) params.temperature = parseFloat(opts.temperature as string);
      if (opts.exaggeration) params.exaggeration = parseFloat(opts.exaggeration as string);
      if (opts.speed) params.speed = parseFloat(opts.speed as string);
      if (opts.cfgWeight) params.cfg_weight = parseFloat(opts.cfgWeight as string);
      if (opts.voiceStrength) params.voice_strength = parseFloat(opts.voiceStrength as string);
      if (opts.promptText) params.prompt_text = opts.promptText;
      if (opts.referenceId) params.reference_id = opts.referenceId;

      console.log(`\n🔊 Generating TTS with ${params.provider}...`);
      try {
        const result = await client.createTTS(
          params as any,
          {
            waitForCompletion: opts.wait !== false,
            output: opts.output as string | undefined,
          }
        );
        console.log(`✅ Status: ${result.status}`);
        if (result.outputUrl) console.log(`📎 URL: ${result.outputUrl}`);
        if (opts.output) console.log(`💾 Saved to: ${opts.output}`);
        console.log(`🆔 ID: ${result.id}\n`);
      } catch (err: any) {
        console.error(`\n❌ Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
