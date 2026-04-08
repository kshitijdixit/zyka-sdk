import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type {
  ZykaConfig,
  VideoGenerationParams,
  ImageGenerationParams,
  TTSParams,
  UpscaleParams,
  FaceSwapParams,
  VirtualTryOnParams,
  OutfitSwapParams,
  SkinEnhancerParams,
  BehindTheSceneParams,
  AnglesParams,
  NineShortsParams,
  ZoomsParams,
  StoryGeneratorParams,
  CaptionGeneratorParams,
  VideoToScriptParams,
  VideoCleanerParams,
  VideoUpscalerParams,
  VideoDubbingParams,
  VideoDubbingModel,
  ShortVideoCreatorParams,
  BrollParams,
  YouTubeDownloaderParams,
  HoliSpecialParams,
  SimpleAppParams,
  VoiceChangerParams,
  PromptRefinementParams,
  GenerationResult,
  GenerationType,
  WaitOptions,
} from './types';
import { resolveToUrl, downloadFile } from './file-utils';

// ─────────────────────────────────────────────
// Auth resolution
// ─────────────────────────────────────────────

const ZYKA_CONFIG_PATH = path.join(os.homedir(), '.zyka', 'config.json');

function loadSavedToken(): string | undefined {
  try {
    if (fs.existsSync(ZYKA_CONFIG_PATH)) {
      const cfg = JSON.parse(fs.readFileSync(ZYKA_CONFIG_PATH, 'utf-8'));
      return cfg.apiKey || cfg.token;
    }
  } catch {
    // Ignore
  }
  return undefined;
}

/**
 * Resolve authentication credential.
 * Priority: apiKey → ZYKA_API_KEY → token → ZYKA_API_TOKEN → ~/.zyka/config.json
 */
function resolveToken(config?: ZykaConfig): string {
  const token =
    config?.apiKey ||
    process.env.ZYKA_API_KEY ||
    config?.token ||
    process.env.ZYKA_API_TOKEN ||
    loadSavedToken();
  if (!token) {
    throw new Error(
      'Zyka API key not found.\n' +
      'Set ZYKA_API_KEY env var, pass apiKey in constructor,\n' +
      'or run: npx zyka auth login'
    );
  }
  return token;
}

function resolveBaseUrl(config?: ZykaConfig): string {
  const url =
    config?.apiUrl ||
    process.env.ZYKA_API_URL ||
    'https://zyka.ai/api-v2';
  // Strip trailing slash for consistent joining
  return url.replace(/\/+$/, '');
}

// ─────────────────────────────────────────────
// HTTP helper
// ─────────────────────────────────────────────

interface RequestOptions {
  method: string;
  path: string;
  body?: Record<string, unknown>;
  token: string;
  baseUrl: string;
}

function doRequest<T>(opts: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    // Join baseUrl + path correctly, preserving base path prefix (e.g. /api-v2)
    const base = new URL(opts.baseUrl);
    const joinedPath = base.pathname.replace(/\/+$/, '') + opts.path;
    const isHttps = base.protocol === 'https:';
    const lib = isHttps ? https : http;

    const bodyStr = opts.body ? JSON.stringify(opts.body) : undefined;
    const reqOpts: http.RequestOptions = {
      hostname: base.hostname,
      port: base.port || (isHttps ? 443 : 80),
      path: joinedPath,
      method: opts.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opts.token}`,
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };

    const req = lib.request(reqOpts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 400) {
            reject(
              new Error(
                `Zyka API error ${res.statusCode}: ${parsed.message || data}`
              )
            );
          } else {
            resolve(parsed as T);
          }
        } catch {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─────────────────────────────────────────────
// Response shape from Zyka backend
// ─────────────────────────────────────────────

interface ZykaApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// ─────────────────────────────────────────────
// Normalize raw API response → GenerationResult
// ─────────────────────────────────────────────

function normalizeResult(raw: Record<string, unknown>, type: GenerationType): GenerationResult {
  // Backend wraps results in nested keys like { video_generation: {...} } or { image_generation: {...} }
  const nested =
    (raw.video_generation as Record<string, unknown>) ||
    (raw.image_generation as Record<string, unknown>) ||
    (raw.voice as Record<string, unknown>) ||
    (raw.ttsLog as Record<string, unknown>) ||
    (raw.tts_log as Record<string, unknown>) ||
    (raw.element as Record<string, unknown>) ||
    raw;

  // Map backend status strings to SDK status enum
  const rawStatus = String(nested.status || 'PENDING');
  const statusMap: Record<string, GenerationResult['status']> = {
    'Pending': 'PENDING',
    'Processing': 'PROCESSING',
    'Completed': 'COMPLETED',
    'Failed': 'FAILED',
    'IN_QUEUE': 'PENDING',
    'IN_PROGRESS': 'PROCESSING',
    'COMPLETED': 'COMPLETED',
    'FAILED': 'FAILED',
  };
  const status = statusMap[rawStatus] || (rawStatus.toUpperCase() as GenerationResult['status']);

  return {
    id: String(nested.id || nested.voice_tts_log_id || nested.my_voice_id || nested._id || ''),
    type,
    status,
    outputUrl:
      (nested.s3_url as string) ||
      (nested.output_url as string) ||
      (nested.video_url as string) ||
      (nested.image_url as string) ||
      (nested.audio_url as string) ||
      undefined,
    outputUrls: nested.output_urls as string[] | undefined,
    metadata: nested as Record<string, unknown>,
    createdAt: String(nested.createdAt || nested.created_at || new Date().toISOString()),
    updatedAt: String(nested.updatedAt || nested.updated_at || new Date().toISOString()),
  };
}

// ─────────────────────────────────────────────
// ZykaClient
// ─────────────────────────────────────────────

export class ZykaClient {
  private token: string;
  private baseUrl: string;

  constructor(config?: ZykaConfig) {
    this.token = resolveToken(config);
    this.baseUrl = resolveBaseUrl(config);
  }

  // ── Internal helpers ────────────────────────

  /**
   * Resolve a field: if it's a local file path, upload it and return the URL.
   */
  private async resolveFile(value: string | undefined): Promise<string | undefined> {
    return resolveToUrl(value, this.baseUrl, this.token);
  }

  /**
   * After a completed result, download to local path if `output` option is set.
   */
  private async maybeDownload(result: GenerationResult, options?: WaitOptions): Promise<GenerationResult> {
    if (options?.output && result.outputUrl) {
      await downloadFile(result.outputUrl, options.output);
    }
    return result;
  }

  // ── Built-in polling ────────────────────────

  /**
   * Poll a generation job until it completes or fails.
   * @example
   * const pending = await client.createVideo({ model: 'wan', prompt: '...' }, { waitForCompletion: false });
   * const completed = await client.pollUntilComplete(pending.id, 'video');
   * console.log(completed.outputUrl); // video URL
   */
  async pollUntilComplete(
    id: string,
    type: GenerationType,
    opts?: { timeoutMs?: number; pollIntervalMs?: number }
  ): Promise<GenerationResult> {
    const timeout = opts?.timeoutMs ?? 5 * 60 * 1000;
    const interval = opts?.pollIntervalMs ?? 3000;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      const result = await this.checkStatus(type, id);
      if (result.status === 'COMPLETED') return result;
      if (result.status === 'FAILED') throw new Error(`Generation ${id} (${type}) failed.`);
      await new Promise(r => setTimeout(r, interval));
    }

    throw new Error(`Timed out after ${timeout / 1000}s waiting for ${type} generation "${id}"`);
  }

  // ── Video Generation ─────────────────────

  /**
   * Create a video generation job.
   * By default, waits for completion (polls automatically).
   * Local file paths for image_url, audio_url, first_frame, last_frame are auto-uploaded.
   *
   * @example
   * // Simplest (waits for completion by default)
   * const result = await client.createVideo({ model: 'wan', prompt: 'A sunset' });
   * console.log(result.outputUrl);
   *
   * @example
   * // With local image (auto-uploaded)
   * const result = await client.createVideo(
   *   { model: 'kling', prompt: 'Animate this', image_url: './photo.png' },
   *   { output: './result.mp4' }  // auto-download
   * );
   *
   * @example
   * // Fire-and-forget (returns immediately)
   * const pending = await client.createVideo(
   *   { model: 'wan', prompt: 'A sunset' },
   *   { waitForCompletion: false }
   * );
   */
  async createVideo(params: VideoGenerationParams, options?: WaitOptions): Promise<GenerationResult> {
    // Auto-upload local files
    const resolved = { ...params } as Record<string, unknown>;
    resolved.image_url = await this.resolveFile(params.image_url);
    resolved.audio_url = await this.resolveFile(params.audio_url);
    resolved.audio_url_2 = await this.resolveFile(params.audio_url_2);
    resolved.first_frame = await this.resolveFile(params.first_frame);
    resolved.last_frame = await this.resolveFile(params.last_frame);
    resolved.inputReference = await this.resolveFile(params.inputReference);
    resolved.video_url = await this.resolveFile(params.video_url);

    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/video-generation',
      body: resolved,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'video');

    // Default: waitForCompletion = true
    const shouldWait = options?.waitForCompletion !== false;
    if (shouldWait) {
      const completed = await this.pollUntilComplete(result.id, 'video', options);
      return this.maybeDownload(completed, options);
    }
    return result;
  }

  async getVideo(id: string): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'GET',
      path: `/api/video-generation/${id}`,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'video');
  }

  async getVideoStatus(id: string): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'GET',
      path: `/api/video-generation/${id}/status`,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'video');
  }

  // ── Image Generation ─────────────────────

  /**
   * Create an image generation job.
   * By default, waits for completion. Local file paths for `image` are auto-uploaded.
   *
   * @example
   * // Simplest (waits by default)
   * const result = await client.createImage({ model: 'nano_banana', prompt: 'A neon city' });
   *
   * @example
   * // Edit a local image (auto-uploaded + auto-downloaded)
   * const result = await client.createImage(
   *   { model: 'nano_banana', image: './photo.png', prompt: 'make hair straight' },
   *   { output: './result.png' }
   * );
   */
  async createImage(params: ImageGenerationParams, options?: WaitOptions): Promise<GenerationResult> {
    // Auto-upload local files
    const resolved = { ...params } as Record<string, unknown>;
    resolved.image = await this.resolveFile(params.image);

    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/image-generation',
      body: resolved,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'image');

    const shouldWait = options?.waitForCompletion !== false;
    if (shouldWait) {
      const completed = await this.pollUntilComplete(result.id, 'image', options);
      return this.maybeDownload(completed, options);
    }
    return result;
  }

  async getImage(id: string): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'GET',
      path: `/api/image-generation/${id}`,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'image');
  }

  async getImageStatus(id: string): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'GET',
      path: `/api/image-generation/${id}/status`,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'image');
  }

  // ── TTS ──────────────────────────────────

  /**
   * Create a text-to-speech job.
   * By default, waits for completion. Local file paths for `actual_voice_url` are auto-uploaded.
   *
   * For MiniMax with `actual_voice_url`: automatically runs two-step voice clone flow
   * (clone voice → TTS with cloned voice). No need to manage voice IDs manually.
   *
   * @example
   * // Simplest
   * const result = await client.createTTS({ voice_id: 'your-voice-id', script: 'Hello world' });
   *
   * @example
   * // Voice clone from local audio file (works for all providers including MiniMax)
   * const result = await client.createTTS(
   *   { provider: 'minimax', actual_voice_url: './my-voice.mp3', script: 'Hello' },
   *   { output: './speech.mp3' }
   * );
   */
  async createTTS(params: TTSParams, options?: WaitOptions): Promise<GenerationResult> {
    // Auto-upload local files
    const resolved = { ...params } as Record<string, unknown>;
    resolved.actual_voice_url = await this.resolveFile(params.actual_voice_url);

    // MiniMax voice clone: two-step flow when actual_voice_url is provided without voice_id.
    // Step 1: POST /voice-clone/voices to create a cloned voice, poll until ready.
    // Step 2: POST /voice-clone/tts with the cloned voice's my_voice_id.
    if (resolved.provider === 'minimax' && resolved.actual_voice_url && !resolved.voice_id) {
      const cloneRes = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
        method: 'POST',
        path: '/api/voice-clone/voices',
        body: {
          name: (resolved.name as string) || 'SDK Voice Clone',
          provider: 'minimax',
          actual_voice_url: resolved.actual_voice_url,
          script: resolved.script,
        },
        token: this.token,
        baseUrl: this.baseUrl,
      });

      const voice = (cloneRes.data as Record<string, unknown>)?.voice as Record<string, unknown> | undefined;
      const myVoiceId = voice?.my_voice_id as string | undefined;
      if (!myVoiceId) {
        throw new Error('MiniMax voice clone failed: no voice ID returned');
      }

      // Poll until the voice clone completes
      const cloneTimeout = options?.timeoutMs ?? 5 * 60 * 1000;
      const cloneInterval = options?.pollIntervalMs ?? 5000;
      const cloneDeadline = Date.now() + cloneTimeout;
      let clonedVoice: Record<string, unknown> | undefined;

      while (Date.now() < cloneDeadline) {
        await new Promise(r => setTimeout(r, cloneInterval));
        const statusRes = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
          method: 'GET',
          path: `/api/voice-clone/voices/${myVoiceId}?refresh=true`,
          token: this.token,
          baseUrl: this.baseUrl,
        });
        clonedVoice = (statusRes.data as Record<string, unknown>)?.voice as Record<string, unknown> | undefined;
        if (clonedVoice?.status === 'completed') break;
        if (clonedVoice?.status === 'failed') {
          const meta = clonedVoice.meta_data as Record<string, unknown> | undefined;
          const errMsg = (meta?.error as string) || 'unknown error';
          throw new Error(`MiniMax voice clone failed: ${errMsg}`);
        }
      }

      if (clonedVoice?.status !== 'completed') {
        throw new Error('MiniMax voice clone timed out');
      }

      // Use the Zyka voice UUID as voice_id for TTS
      resolved.voice_id = myVoiceId;
      delete resolved.actual_voice_url;
    }

    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/voice-clone/tts',
      body: resolved,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'tts');

    const shouldWait = options?.waitForCompletion !== false;
    if (shouldWait) {
      const completed = await this.pollUntilComplete(result.id, 'tts', options);
      return this.maybeDownload(completed, options);
    }
    return result;
  }

  async getTTSStatus(id: string): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'GET',
      path: `/api/voice-clone/tts-logs/${id}?refresh=true`,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'tts');
  }

  // ── App status poller ───────────────────

  private async pollAppStatus(
    statusPath: string,
    id: string,
    type: GenerationType,
    opts?: WaitOptions
  ): Promise<GenerationResult> {
    const timeout = opts?.timeoutMs ?? 10 * 60 * 1000;
    const interval = opts?.pollIntervalMs ?? 5000;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
        method: 'GET',
        path: `${statusPath}/${id}`,
        token: this.token,
        baseUrl: this.baseUrl,
      });
      const result = normalizeResult(res.data || {}, type);
      if (result.status === 'COMPLETED') return this.maybeDownload(result, opts);
      if (result.status === 'FAILED') throw new Error(`App job ${id} (${type}) failed.`);
      await new Promise(r => setTimeout(r, interval));
    }

    throw new Error(`Timed out waiting for ${type} job "${id}"`);
  }

  // ── Apps ─────────────────────────────────

  async createUpscale(params: UpscaleParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/apps/upscale/create',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'upscale');
  }

  async createFaceSwap(params: FaceSwapParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/apps/face-swap/create',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'face-swap');
  }

  async createVirtualTryOn(params: VirtualTryOnParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/apps/virtual-try-on/create',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'virtual-try-on');
  }

  async createOutfitSwap(params: OutfitSwapParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/apps/outfit-swap/create',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'outfit-swap');
  }

  async createSkinEnhancer(params: SkinEnhancerParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/apps/skin-enhancer/create',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'skin-enhancer');
  }

  async createBehindTheScene(params: BehindTheSceneParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/apps/behind-the-scene/create',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'behind-the-scene');
  }

  // ── New Apps ────────────────────────────

  async createAngles(params: AnglesParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/angles/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'angles');
  }

  async createNineShorts(params: NineShortsParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/nine-shorts/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'nine-shorts');
  }

  async createZooms(params: ZoomsParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/zooms/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'zooms');
  }

  async createStoryGenerator(params: StoryGeneratorParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/story-generator/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'story-generator');
  }

  async createCaptionGenerator(params: CaptionGeneratorParams, options?: WaitOptions): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/caption-generator/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'caption-generator');
    if (options?.waitForCompletion !== false) {
      return this.pollAppStatus('/api/apps/caption-generator/status', result.id, 'caption-generator', options);
    }
    return result;
  }

  async createVideoToScript(params: VideoToScriptParams, options?: WaitOptions): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/video-to-script/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'video-to-script');
    if (options?.waitForCompletion !== false) {
      return this.pollAppStatus('/api/apps/video-to-script/status', result.id, 'video-to-script', options);
    }
    return result;
  }

  async createVideoCleaner(params: VideoCleanerParams, options?: WaitOptions): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/video-cleaner/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'video-cleaner');
    if (options?.waitForCompletion !== false) {
      return this.pollAppStatus('/api/apps/video-cleaner/status', result.id, 'video-cleaner', options);
    }
    return result;
  }

  async createVideoUpscaler(params: VideoUpscalerParams, options?: WaitOptions): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/video-upscaler/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'video-upscaler');
    if (options?.waitForCompletion !== false) {
      return this.pollAppStatus('/api/apps/video-upscaler/status', result.id, 'video-upscaler', options);
    }
    return result;
  }

  async createVideoDubbing(params: VideoDubbingParams, options?: WaitOptions): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/video-dubbing',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'video-dubbing');
    if (options?.waitForCompletion !== false) {
      return this.pollAppStatus('/api/video-dubbing/status', result.id, 'video-dubbing', options);
    }
    return result;
  }

  async getVideoDubbingLanguages(model: VideoDubbingModel): Promise<unknown> {
    const res = await doRequest<ZykaApiResponse<unknown>>({
      method: 'GET', path: `/api/video-dubbing/languages?model=${model}`,
      token: this.token, baseUrl: this.baseUrl,
    });
    return res.data;
  }

  async createShortVideoCreator(params: ShortVideoCreatorParams, options?: WaitOptions): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/short-video-creator/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'short-video-creator');
    if (options?.waitForCompletion !== false) {
      return this.pollAppStatus('/api/apps/short-video-creator/status', result.id, 'short-video-creator', options);
    }
    return result;
  }

  async createBroll(params: BrollParams, options?: WaitOptions): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/broll/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'broll');
    if (options?.waitForCompletion !== false) {
      return this.pollAppStatus('/api/apps/broll/status', result.id, 'broll', options);
    }
    return result;
  }

  async createYouTubeDownloader(params: YouTubeDownloaderParams, options?: WaitOptions): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/youtube-downloader/create',
      body: params as Record<string, unknown>, token: this.token, baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'youtube-downloader');
    if (options?.waitForCompletion !== false) {
      return this.pollAppStatus('/api/apps/youtube-downloader/status', result.id, 'youtube-downloader', options);
    }
    return result;
  }

  async createHoliSpecial(params: HoliSpecialParams): Promise<GenerationResult> {
    const resolved = { ...params } as Record<string, unknown>;
    resolved.image = await resolveToUrl(params.image, this.baseUrl, this.token);
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/holi-special/create',
      body: resolved, token: this.token, baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'holi-special');
  }

  async createSimpleApp(params: SimpleAppParams): Promise<GenerationResult> {
    const resolved = { ...params } as Record<string, unknown>;
    resolved.image = await resolveToUrl(params.image, this.baseUrl, this.token);
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/simple-apps/create',
      body: resolved, token: this.token, baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'simple-app');
  }

  async createVoiceChanger(params: VoiceChangerParams, options?: WaitOptions): Promise<GenerationResult> {
    const resolved = { ...params } as Record<string, unknown>;
    resolved.audio_url = await resolveToUrl(params.audio_url, this.baseUrl, this.token);
    if (params.actual_voice_url) {
      resolved.actual_voice_url = await resolveToUrl(params.actual_voice_url, this.baseUrl, this.token);
    }
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST', path: '/api/apps/voice-changer/create',
      body: resolved, token: this.token, baseUrl: this.baseUrl,
    });
    const result = normalizeResult(res.data || {}, 'voice-changer');
    if (options?.waitForCompletion !== false) {
      return this.pollAppStatus('/api/apps/voice-changer/status', result.id, 'voice-changer', options);
    }
    return result;
  }

  // ── Prompt Refinement ────────────────────

  async refinePrompt(params: PromptRefinementParams): Promise<string> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/prompt-refinement',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return String(res.data?.refined_prompt || res.data?.prompt || '');
  }

  // ── Credits ──────────────────────────────

  async calculateVideoCredits(params: Record<string, unknown>): Promise<number> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/credits/calculate/video-generation',
      body: params,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return Number(res.data?.credits || 0);
  }

  async calculateImageCredits(params: Record<string, unknown>): Promise<number> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/credits/calculate/image-generation',
      body: params,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return Number(res.data?.credits || 0);
  }

  // ── Universal status poller ───────────────

  async checkStatus(type: GenerationType, id: string): Promise<GenerationResult> {
    switch (type) {
      case 'video':
        return this.getVideoStatus(id);
      case 'image':
        return this.getImageStatus(id);
      case 'tts':
        return this.getTTSStatus(id);
      default:
        throw new Error(`Status polling not yet supported for type: ${type}`);
    }
  }
}
