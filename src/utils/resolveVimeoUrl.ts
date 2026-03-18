/**
 * Shared Vimeo URL utilities.
 *
 * - resolveVimeoUrl()      → resolves a Vimeo page URL to an HLS .m3u8 stream URL
 * - fetchVimeoThumbnail()  → fetches thumbnail URL via Vimeo OEmbed API
 *
 * Both functions use in-memory caches so the same URL is never fetched twice.
 */

// ── In-memory caches ──────────────────────────────────────────────────────────

const hlsCache: Record<string, string> = {};
const thumbnailCache: Record<string, string> = {};

// ── Player Page Parsing ───────────────────────────────────────────────────────

/**
 * Parse the Vimeo player embed page HTML and extract playerConfig JSON.
 * Returns the parsed config object or null.
 */
function parsePlayerConfig(html: string): Record<string, unknown> | null {
  const marker = 'window.playerConfig = ';
  const idx = html.indexOf(marker);
  if (idx === -1) return null;

  const jsonStart = idx + marker.length;
  const scriptEnd = html.indexOf('</script>', jsonStart);
  if (scriptEnd === -1) return null;

  try {
    return JSON.parse(html.substring(jsonStart, scriptEnd));
  } catch {
    console.warn('[resolveVimeoUrl] JSON parse error');
    return null;
  }
}

/**
 * Extract HLS .m3u8 URL from a parsed playerConfig.
 */
function extractHLSUrl(config: Record<string, unknown>): string | null {
  const request = config?.request as Record<string, unknown> | undefined;
  const files = request?.files as Record<string, unknown> | undefined;
  const hls = files?.hls as Record<string, unknown> | undefined;
  if (!hls) return null;

  const defaultCdn = hls.default_cdn as string;
  const cdns = hls.cdns as Record<string, Record<string, string>> | undefined;
  const cdnData = cdns?.[defaultCdn];
  if (!cdnData) return null;

  const url = cdnData.avc_url || cdnData.url || '';
  return url.replace(/\\u0026/g, '&');
}

/**
 * Extract thumbnail URL from a parsed playerConfig.
 * The player page always has thumbnails even for private videos.
 */
function extractThumbnailFromConfig(
  config: Record<string, unknown>,
): string | null {
  const video = config?.video as Record<string, unknown> | undefined;
  const thumbs = video?.thumbs as Record<string, string> | undefined;
  if (!thumbs) return null;

  // Pick the largest available thumbnail
  return (
    thumbs['1280'] || thumbs['960'] || thumbs['640'] || thumbs.base || null
  );
}

/**
 * Extract a Vimeo video ID from various URL formats.
 */
function extractVimeoId(url: string): string | null {
  const match = url.match(/(?:vimeo\.com\/|video\/)(\d+)/);
  return match?.[1] ?? null;
}

// ── Shared page fetch cache ──────────────────────────────────────────────────
// Cache the raw HTML to avoid fetching the same player page twice
// (once for HLS, once for thumbnail)
const playerPageCache: Record<string, string> = {};

async function fetchPlayerPage(vimeoId: string): Promise<string | null> {
  if (playerPageCache[vimeoId]) {
    return playerPageCache[vimeoId];
  }

  try {
    const response = await fetch(`https://player.vimeo.com/video/${vimeoId}`);
    const html = await response.text();
    playerPageCache[vimeoId] = html;
    return html;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Resolve a video URL to a playable stream URL.
 *
 * - Direct .m3u8 / .mp4 links  → returned as-is
 * - Vimeo page URLs             → scraped for HLS stream URL (cached)
 *
 * Returns null if resolution fails.
 */
export async function resolveVimeoUrl(url: string): Promise<string | null> {
  // Direct stream — return immediately
  if (url.includes('.m3u8') || url.includes('.mp4')) {
    return url;
  }

  // Check cache
  if (hlsCache[url]) {
    return hlsCache[url];
  }

  try {
    const vimeoId = extractVimeoId(url);
    if (!vimeoId) return null;

    const html = await fetchPlayerPage(vimeoId);
    if (!html) return null;

    const config = parsePlayerConfig(html);
    if (!config) return null;

    const hlsUrl = extractHLSUrl(config);
    if (hlsUrl) {
      hlsCache[url] = hlsUrl;
      return hlsUrl;
    }

    return null;
  } catch {
    console.warn('[resolveVimeoUrl] fetch error for:', url);
    return null;
  }
}

/**
 * Fetch a thumbnail URL for a Vimeo video.
 *
 * Strategy:
 * 1. Try Vimeo OEmbed API (works for public videos)
 * 2. Fall back to scraping the player embed page (works for private videos too)
 */
export async function fetchVimeoThumbnail(url: string): Promise<string | null> {
  const vimeoId = extractVimeoId(url);
  if (!vimeoId) return null;

  // Check cache
  if (thumbnailCache[vimeoId]) {
    return thumbnailCache[vimeoId];
  }

  // Strategy 1: OEmbed API (fast, works for public videos)
  try {
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.thumbnail_url) {
        const largeThumb = data.thumbnail_url.replace(/_\d+x\d+/, '_640x360');
        thumbnailCache[vimeoId] = largeThumb;
        return largeThumb;
      }
    }
  } catch {
    // OEmbed failed — try fallback
  }

  // Strategy 2: Scrape player embed page (works for private videos)
  try {
    const html = await fetchPlayerPage(vimeoId);
    if (!html) return null;

    const config = parsePlayerConfig(html);
    if (!config) return null;

    const thumb = extractThumbnailFromConfig(config);
    if (thumb) {
      thumbnailCache[vimeoId] = thumb;
      return thumb;
    }
  } catch {
    console.warn('[fetchVimeoThumbnail] fallback error for:', url);
  }

  return null;
}
