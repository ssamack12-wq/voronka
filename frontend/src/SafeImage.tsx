import React, { useEffect, useState } from 'react';

/** Абсолютный путь к файлу в `public/images/` с учётом `import.meta.env.BASE_URL`. */
export function publicImageUrl(fileName: string): string {
  let base = import.meta.env.BASE_URL;
  if (!base || base === '.') base = '/';
  if (!base.endsWith('/')) base = `${base}/`;
  return `${base}images/${fileName}`;
}

export interface SafeImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function SafeImage({ src, alt = '', className, width, height }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const fallbackSrc = publicImageUrl('fallback.svg');
  const displaySrc = failed ? fallbackSrc : src;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Image src:', displaySrc);
    }
  }, [displaySrc]);

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      draggable={false}
      onError={() => {
        console.error('Image failed:', src);
        setFailed((prev) => {
          if (prev) return prev;
          return true;
        });
      }}
    />
  );
}
