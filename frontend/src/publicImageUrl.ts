/** Абсолютный путь к файлу в `public/images/` с учётом `import.meta.env.BASE_URL`. */
export function publicImageUrl(fileName: string): string {
  let base = import.meta.env.BASE_URL;
  if (!base || base === '.') base = '/';
  if (!base.endsWith('/')) base = `${base}/`;
  return `${base}images/${fileName}`;
}
