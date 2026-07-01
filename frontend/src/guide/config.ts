export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/$/, '') ||
  'https://sdelka-web.online';

export function guideUrl(slug?: string): string {
  return slug ? `${SITE_URL}/guide/${slug}` : `${SITE_URL}/guide`;
}
