import type { Command } from 'commander';

export function registerGenerateTTS(generate: Command): void {
  generate
    .command('tts')
    .description('Generate text-to-speech audio')
    .requiredOption('--script <text>', 'Text to convert to speech')
    .option('--provider <provider>', 'TTS provider (elevenlabs, qwen3, chatterbox, voxcpm, voxcpm2, minimax, moss-tts, fish-audio, sarvam, gemini-tts)', 'elevenlabs')
    .option('--voice-id <id>', 'Voice ID')
    .option('--voice <path>', 'Voice reference audio URL or local path (for voice cloning)')
    .option('--name <name>', 'Display name for this TTS generation')
    .option('--language <code>', 'Language code (qwen3, minimax)')
    .option('--language-boost <code>', 'Language boost code (minimax)')
    .option('--model <id>', 'Model ID (elevenlabs: eleven_multilingual_v2/eleven_v3; sarvam: bulbul:v2/v3; gemini-tts: gemini-2.5-flash-preview-tts/gemini-2.5-pro-preview-tts/gemini-3.1-flash-tts-preview)')
    // MiniMax voice_setting options
    .option('--emotion <emotion>', 'MiniMax emotion: neutral | happy | sad | angry | fearful | disgusted | surprised')
    .option('--english-normalization', 'MiniMax enable english normalization (boolean flag)')
    .option('--channel <n>', 'MiniMax audio channel: 1 (mono) | 2 (stereo)')
    // MiniMax normalization_setting options
    .option('--normalization-enabled', 'MiniMax normalization enabled (boolean flag)')
    .option('--normalization-target-loudness <n>', 'MiniMax normalization target loudness (e.g. -18)')
    .option('--normalization-target-range <n>', 'MiniMax normalization target range (e.g. 8)')
    .option('--normalization-target-peak <n>', 'MiniMax normalization target peak (e.g. -0.5)')
    // MiniMax voice_modify options
    .option('--voice-modify-pitch <n>', 'MiniMax voice modify pitch (-100 to 100)')
    .option('--voice-modify-intensity <n>', 'MiniMax voice modify intensity (-100 to 100)')
    .option('--voice-modify-timbre <n>', 'MiniMax voice modify timbre (-100 to 100)')
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
    // VoxCPM2 options
    .option('--output-format <fmt>', 'VoxCPM2 output format: wav (default) or flac')
    .option('--cfg-value <n>', 'VoxCPM2 classifier-free guidance (1.0-3.0, default 2.0)')
    .option('--inference-timesteps <n>', 'VoxCPM2 inference timesteps (5-30, default 10)')
    // Sarvam options
    .option('--target-language-code <code>', 'Sarvam target language code (en-IN, hi-IN, ta-IN, te-IN, bn-IN, gu-IN, etc.)')
    .option('--pitch <n>', 'Sarvam bulbul:v2 pitch (-1 to 1, default 0). Not supported on v3.')
    .option('--pace <n>', 'Sarvam pace (0.3 to 3, default 1.0)')
    .option('--loudness <n>', 'Sarvam bulbul:v2 loudness (0 to 3, default 1.0). Not supported on v3.')
    .option('--speech-sample-rate <n>', 'Sarvam sample rate: 8000, 16000, or 22050 (default 22050)')
    // Gemini TTS options
    .option('--voice-name <name>', 'Gemini single-speaker voice (Kore, Puck, Zephyr, Fenrir, etc.)')
    .option('--speakers <json>', 'Gemini multi-speaker dialogue as JSON array, e.g. [{"speaker":"Joe","voice_name":"Kore"},{"speaker":"Jane","voice_name":"Puck"}]')
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

      // MiniMax voice_setting sub-fields
      if (opts.emotion || opts.englishNormalization !== undefined) {
        const vs = (params.voice_setting as Record<string, unknown>) ?? {};
        if (opts.emotion) vs.emotion = opts.emotion;
        if (opts.englishNormalization) vs.english_normalization = true;
        params.voice_setting = vs;
      }
      // MiniMax audio_setting channel
      if (opts.channel) {
        const as_ = (params.audio_setting as Record<string, unknown>) ?? {};
        as_.channel = parseInt(opts.channel as string, 10);
        params.audio_setting = as_;
      }
      // MiniMax normalization_setting
      if (
        opts.normalizationEnabled ||
        opts.normalizationTargetLoudness ||
        opts.normalizationTargetRange ||
        opts.normalizationTargetPeak
      ) {
        params.normalization_setting = {
          ...(opts.normalizationEnabled ? { enabled: true } : {}),
          ...(opts.normalizationTargetLoudness ? { target_loudness: parseFloat(opts.normalizationTargetLoudness as string) } : {}),
          ...(opts.normalizationTargetRange ? { target_range: parseFloat(opts.normalizationTargetRange as string) } : {}),
          ...(opts.normalizationTargetPeak ? { target_peak: parseFloat(opts.normalizationTargetPeak as string) } : {}),
        };
      }
      // MiniMax voice_modify
      if (opts.voiceModifyPitch || opts.voiceModifyIntensity || opts.voiceModifyTimbre) {
        params.voice_modify = {
          ...(opts.voiceModifyPitch ? { pitch: parseFloat(opts.voiceModifyPitch as string) } : {}),
          ...(opts.voiceModifyIntensity ? { intensity: parseFloat(opts.voiceModifyIntensity as string) } : {}),
          ...(opts.voiceModifyTimbre ? { timbre: parseFloat(opts.voiceModifyTimbre as string) } : {}),
        };
      }
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
      // ElevenLabs / Sarvam / Gemini / VoxCPM2 model selector
      if (opts.model) params.model = opts.model;
      // VoxCPM2
      if (opts.outputFormat) params.output_format = opts.outputFormat;
      if (opts.cfgValue) params.cfg_value = parseFloat(opts.cfgValue as string);
      if (opts.inferenceTimesteps) params.inference_timesteps = parseInt(opts.inferenceTimesteps as string, 10);
      // Sarvam
      if (opts.targetLanguageCode) params.target_language_code = opts.targetLanguageCode;
      if (opts.pitch) params.pitch = parseFloat(opts.pitch as string);
      if (opts.pace) params.pace = parseFloat(opts.pace as string);
      if (opts.loudness) params.loudness = parseFloat(opts.loudness as string);
      if (opts.speechSampleRate) params.speech_sample_rate = parseInt(opts.speechSampleRate as string, 10);
      // Gemini TTS
      if (opts.voiceName) params.voice_name = opts.voiceName;
      if (opts.speakers) {
        try {
          params.speakers = JSON.parse(opts.speakers as string);
        } catch {
          console.error('\n❌ --speakers must be valid JSON, e.g. \'[{"speaker":"Joe","voice_name":"Kore"}]\'\n');
          process.exit(1);
        }
      }

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
