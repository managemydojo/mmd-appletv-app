import type { NavigationProp } from '@react-navigation/native';
import { getMediaType } from './getMediaType';
import type { StudentStackParamList } from '../navigation';

export interface OpenableContent {
  contentLink?: string;
  title?: string;
  _id?: string;
}

/**
 * True when an item has a `contentLink` we can open today (video or image).
 * False for `unknown` types — currently YouTube URLs and any leftover `.pdf`
 * URLs during the backend rasterization transition. Use this to filter
 * content lists so unopenable cards never appear in the UI.
 */
export function isSupportedContent(item: {
  contentLink?: string | null;
}): boolean {
  return getMediaType(item.contentLink) !== 'unknown';
}

/**
 * Dispatch navigation based on the content's URL pattern.
 *
 * - video → VideoPlayer
 * - image → ImageViewer
 * - unknown → no-op (caller is free to ignore unsupported content)
 *
 * PDFs used to route to a dedicated viewer; that viewer is gone now that
 * the backend rasterizes PDFs to image sequences server-side. A `.pdf`
 * URL coming through here is now treated as `unknown` and silently
 * no-ops — content shouldn't reach the client as `.pdf` after the
 * backend cutover.
 */
export function openContent(
  navigation: NavigationProp<StudentStackParamList>,
  item: OpenableContent,
): void {
  const url = item.contentLink ?? '';
  const type = getMediaType(url);
  const title = item.title ?? '';
  const contentId = item._id ?? '';

  switch (type) {
    case 'video':
      navigation.navigate('VideoPlayer', {
        videoUrl: url,
        title,
        contentId,
      });
      return;
    case 'image':
      navigation.navigate('ImageViewer', { url, title, contentId });
      return;
    case 'unknown':
      return;
  }
}
