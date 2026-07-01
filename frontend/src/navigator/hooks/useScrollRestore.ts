import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveScrollRestore } from './navigationPersistence';

type SaveScroll = (scrollY: number) => void;
type ReadScroll = () => number | undefined;

export function useScrollRestore(
  saveScroll: SaveScroll,
  readScroll: ReadScroll,
  locationStateKey: 'restoreScrollY' | 'returnScrollY' = 'restoreScrollY'
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const saveRef = useRef(saveScroll);
  const readRef = useRef(readScroll);
  saveRef.current = saveScroll;
  readRef.current = readScroll;

  useEffect(() => {
    const stateValue = (location.state as Record<string, unknown> | null)?.[locationStateKey];
    const restore = resolveScrollRestore(stateValue, readRef.current());
    if (typeof restore !== 'number') return;

    const el = ref.current;
    if (!el) return;

    const apply = () => {
      el.scrollTop = Math.max(0, restore);
    };
    requestAnimationFrame(apply);
    window.setTimeout(apply, 0);

    if (typeof stateValue === 'number') {
      window.history.replaceState({}, '');
    }
  }, [location.pathname, location.state, locationStateKey]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: number | undefined;
    const persist = () => saveRef.current(el.scrollTop);

    const onScroll = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(persist, 120);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
      if (timer) window.clearTimeout(timer);
      persist();
    };
  }, [location.pathname]);

  return ref;
}
