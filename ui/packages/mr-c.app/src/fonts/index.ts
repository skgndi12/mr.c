import { Noto_Sans_KR as NotoSansKr } from 'next/font/google';

// next/font fetches the font files on build time
// i.e. '.next/static/media/**.woff2'
// but supports preloading only for the subsets.
// Not preloaded font files are loaded on browser later
// than html.
export const notoSansKr = NotoSansKr({
  // 'korean' subset is not supported
  subsets: ['latin'],
  // While loading, we don't show the text with
  // fallback font til 3s at most (FOIT)
  // instead of showing ugly font changing (FOUT).
  display: 'block',
  adjustFontFallback: true,
});
