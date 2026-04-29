export type MediaType = 'video' | 'image' | 'unknown';

export function getMediaType(url?: string | null): MediaType {
  if (!url) return 'unknown';
  const lower = url.toLowerCase();

  // Video patterns first — Vimeo/HLS URLs may not have a file extension.
  if (
    lower.includes('vimeo') ||
    lower.includes('.mp4') ||
    lower.includes('.m3u8')
  ) {
    return 'video';
  }

  const ext = lower.split('?')[0].split('.').pop();
  if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    return 'image';
  }
  return 'unknown';
}
