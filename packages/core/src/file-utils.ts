import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

/**
 * Check if a string looks like a local file path (vs a URL).
 */
export function isLocalPath(pathOrUrl: string): boolean {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return false;
  // URLs start with http:// or https://
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return false;
  // data: URIs
  if (pathOrUrl.startsWith('data:')) return false;
  // Everything else is treated as a local path
  return true;
}

/**
 * Upload a local file to Zyka's S3 via `/api/upload/single`.
 * Returns the S3 URL of the uploaded file.
 *
 * @example
 * const url = await uploadLocalFile('./photo.png', 'https://zyka.ai/api-v2', 'your-token');
 * // url = 'https://d22ofvg8yrf77k.cloudfront.net/v2/files/...'
 */
export async function uploadLocalFile(
  filePath: string,
  baseUrl: string,
  token: string
): Promise<string> {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Local file not found: ${resolvedPath}`);
  }

  const fileBuffer = fs.readFileSync(resolvedPath);
  const fileName = path.basename(resolvedPath);
  const ext = path.extname(resolvedPath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
  };

  const mimetype = mimeTypes[ext] || 'application/octet-stream';

  // Build multipart/form-data body
  const boundary = `----ZykaSDK${Date.now()}`;
  const parts: Buffer[] = [];

  // File field
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: ${mimetype}\r\n\r\n`
  ));
  parts.push(fileBuffer);
  parts.push(Buffer.from('\r\n'));

  // Folder field
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="folder"\r\n\r\n` +
    `sdk-uploads\r\n`
  ));

  // End boundary
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

  // Build URL
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const fullUrl = `${cleanBase}/api/upload/single`;
  const parsed = new URL(fullUrl);

  return new Promise<string>((resolve, reject) => {
    const transport = parsed.protocol === 'https:' ? https : http;

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length,
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          try {
            const json = JSON.parse(raw);
            const url = json?.data?.s3_url || json?.data?.url;
            if (!url) {
              reject(new Error(`Upload succeeded but no URL returned: ${raw}`));
            } else {
              resolve(url);
            }
          } catch {
            reject(new Error(`Upload failed: ${res.statusCode} ${raw}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * If `value` is a local file path, upload it and return the URL.
 * If `value` is already a URL, return it as-is.
 */
export async function resolveToUrl(
  value: string | undefined,
  baseUrl: string,
  token: string
): Promise<string | undefined> {
  if (!value) return undefined;
  if (!isLocalPath(value)) return value;
  return uploadLocalFile(value, baseUrl, token);
}

/**
 * Download a file from a URL to a local path.
 *
 * @example
 * await downloadFile('https://cdn.example.com/video.mp4', './output.mp4');
 */
export async function downloadFile(url: string, outputPath: string): Promise<string> {
  const resolvedOutput = path.resolve(outputPath);
  const dir = path.dirname(resolvedOutput);

  // Create output directory if needed
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise<string>((resolve, reject) => {
    const transport = url.startsWith('https:') ? https : http;

    const doRequest = (reqUrl: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      transport.get(reqUrl, (res) => {
        // Follow redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doRequest(res.headers.location, redirectCount + 1);
          return;
        }

        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Download failed: HTTP ${res.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(resolvedOutput);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(resolvedOutput);
        });
        fileStream.on('error', (err) => {
          fs.unlinkSync(resolvedOutput);
          reject(err);
        });
      }).on('error', reject);
    };

    doRequest(url);
  });
}
