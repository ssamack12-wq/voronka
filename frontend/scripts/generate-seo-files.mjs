/**
 * Генерирует robots.txt и sitemap.xml в public/ перед vite build.
 * Railway: VITE_SITE_URL=https://sdelka-web.online
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://sdelka-web.online')
  .trim()
  .replace(/\/$/, '');

const guideSlugs = [
  'kak-kupit-kvartiru-bez-oshibok',
  'kak-proverit-prodavca-kvartiry',
  'chto-proveryat-pered-pokupkoy-kvartiry',
  'dokumenty-dlya-pokupki-kvartiry',
  'pokupka-kvartiry-poshagovo',
  'proverka-kvartiry-pered-pokupkoy',
  'kak-proverit-kvartiru-pered-pokupkoy',
  'kak-oformit-dogovor-kupli-prodazhi',
  'bezopasnye-raschety-pri-pokupke-kvartiry',
  'pokupka-kvartiry-v-ipoteku-poshagovo',
  'kak-bezopasno-kupit-kvartiru',
  'chto-delat-posle-pokupki-kvartiry',
  'registraciya-prava-sobstvennosti',
  'elektronnaya-registraciya-sdelki',
  'zadatok-ili-avans',
  'pokupka-kvartiry-s-materinskim-kapitalom',
  'alternativnaya-sdelka-s-nedvizhimostyu',
  'pokupka-kvartiry-po-doverennosti',
  'kak-proverit-obremeneniya-na-kvartiru',
  'kak-proverit-bankrotstvo-prodavca',
  'prodazha-kvartiry-poshagovo',
  'kak-kupit-kvartiru-bez-rieltora'
];

const pages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/quiz', changefreq: 'monthly', priority: '0.8' },
  { path: '/guide', changefreq: 'weekly', priority: '0.9' },
  ...guideSlugs.map((slug, i) => ({
    path: `/guide/${slug}`,
    changefreq: 'monthly',
    priority: slug === 'kak-kupit-kvartiru-bez-oshibok' ? '0.95' : i < 5 ? '0.9' : '0.85'
  }))
];

const lastmod = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.path === '/' ? '/' : page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Allow: /quiz
Allow: /guide
Disallow: /app/
Disallow: /auth/

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');

console.info(`[seo] ${siteUrl} → ${pages.length} URLs in sitemap`);
