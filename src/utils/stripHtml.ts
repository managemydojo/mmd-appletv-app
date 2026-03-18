/**
 * Strips HTML tags from a string and decodes common entities.
 */
export function stripHtml(text?: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/&nbsp;/gi, ' ') // Decode non-breaking spaces
    .replace(/&amp;/gi, '&') // Decode ampersands
    .replace(/&lt;/gi, '<') // Decode less-than
    .replace(/&gt;/gi, '>') // Decode greater-than
    .replace(/&quot;/gi, '"') // Decode quotes
    .trim();
}
