/**
 * Hook that fetches Vimeo thumbnails for ALL content items with Vimeo URLs.
 * Returns a map of contentId → thumbnail URL.
 */
import { useState, useEffect, useRef } from 'react';
import { fetchVimeoThumbnail } from '../utils/resolveVimeoUrl';
import { StudyContentItem } from '../types/study';

/**
 * Given a list of content items, resolves Vimeo thumbnails for ALL items
 * that have a Vimeo contentLink.
 *
 * Returns a Record<contentId, thumbnailUrl>.
 */
export function useVimeoThumbnails(
  items: StudyContentItem[],
): Record<string, string> {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const fetchedIds = useRef(new Set<string>());

  useEffect(() => {
    if (!items || items.length === 0) return;

    const itemsNeedingThumbnails = items.filter(item => {
      // Skip if already fetched
      if (fetchedIds.current.has(item._id)) return false;
      // Fetch for any Vimeo URL
      return item.contentLink?.includes('vimeo');
    });

    if (itemsNeedingThumbnails.length === 0) return;

    // Mark as fetching to avoid duplicate requests
    itemsNeedingThumbnails.forEach(item => fetchedIds.current.add(item._id));

    // Fetch in parallel (max 5 at a time to avoid overload)
    const fetchBatch = async () => {
      const results: Record<string, string> = {};

      for (let i = 0; i < itemsNeedingThumbnails.length; i += 5) {
        const batch = itemsNeedingThumbnails.slice(i, i + 5);
        const promises = batch.map(async item => {
          const thumb = await fetchVimeoThumbnail(item.contentLink);
          if (thumb) {
            results[item._id] = thumb;
          }
        });
        await Promise.all(promises);
      }

      if (Object.keys(results).length > 0) {
        setThumbnails(prev => ({ ...prev, ...results }));
      }
    };

    fetchBatch();
  }, [items]);

  return thumbnails;
}
