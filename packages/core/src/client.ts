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
  PromptRefinementParams,
  GenerationResult,
  GenerationType,
} from './types';

// ─────────────────────────────────────────────
// Token resolution
// ─────────────────────────────────────────────

const ZYKA_CONFIG_PATH = path.join(os.homedir(), '.zyka', 'config.json');

function loadSavedToken(): string | undefined {
  try {
    if (fs.existsSync(ZYKA_CONFIG_PATH)) {
      const cfg = JSON.parse(fs.readFileSync(ZYKA_CONFIG_PATH, 'utf-8'));
      return cfg.token;
    }
  } catch {
    // Ignore
  }
  return undefined;
}

function resolveToken(config?: ZykaConfig): string {
  const token =
    config?.token ||
    process.env.ZYKA_API_TOKEN ||
    loadSavedToken();
  if (!token) {
    throw new Error(
      'Zyka API token not found.\n' +
      'Set ZYKA_API_TOKEN env var, or run: npx zyka auth login'
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
    id: String(nested.id || nested._id || ''),
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

  // ── Video Generation ─────────────────────

  async createVideo(params: VideoGenerationParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/video-generation',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'video');
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

  async createImage(params: ImageGenerationParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/image-generation',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'image');
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

  async createTTS(params: TTSParams): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'POST',
      path: '/api/voice-clone/tts',
      body: params as Record<string, unknown>,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'tts');
  }

  async getTTSStatus(id: string): Promise<GenerationResult> {
    const res = await doRequest<ZykaApiResponse<Record<string, unknown>>>({
      method: 'GET',
      path: `/api/voice-clone/tts-logs/${id}`,
      token: this.token,
      baseUrl: this.baseUrl,
    });
    return normalizeResult(res.data || {}, 'tts');
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
