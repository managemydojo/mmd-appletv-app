import { getMediaType } from '../../src/utils/getMediaType';

describe('getMediaType', () => {
  describe('video URLs', () => {
    it.each([
      ['https://vimeo.com/123456'],
      ['https://player.vimeo.com/video/123456'],
      ['https://cdn.example.com/clip.mp4'],
      ['https://stream.example.com/playlist.m3u8'],
      ['HTTPS://VIMEO.COM/123'],
      ['https://cdn.example.com/clip.MP4'],
    ])('classifies %s as video', url => {
      expect(getMediaType(url)).toBe('video');
    });
  });

  describe('image URLs', () => {
    it.each([
      ['https://example.com/x.jpg'],
      ['https://example.com/x.jpeg'],
      ['https://example.com/x.png'],
      ['https://example.com/x.gif'],
      ['https://example.com/x.webp'],
      ['https://example.com/X.PNG'],
      ['https://example.com/x.png?v=2'],
    ])('classifies %s as image', url => {
      expect(getMediaType(url)).toBe('image');
    });
  });

  describe('unknown', () => {
    it.each([
      [undefined],
      [null],
      [''],
      ['https://example.com/file.txt'],
      ['https://example.com/no-extension'],
      ['https://example.com/file.docx'],
      // PDFs are now rasterized to image sequences server-side; the
      // TV app no longer recognizes .pdf URLs as a media type.
      ['https://example.com/doc.pdf'],
      ['https://example.com/doc.PDF'],
    ])('classifies %s as unknown', url => {
      expect(getMediaType(url as string | null | undefined)).toBe('unknown');
    });
  });
});
