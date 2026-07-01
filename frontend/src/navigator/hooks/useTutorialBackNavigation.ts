import { useCallback, useEffect, useRef } from 'react';

const HISTORY_FLAG = 'tnTutorialBack';

/** Позволяет закрыть туториал кнопкой «назад» в UI, браузера или жестом на телефоне. */
export function useTutorialBackNavigation(open: boolean, onClose: () => void) {
  const pushedRef = useRef(false);
  const ignorePopRef = useRef(false);

  useEffect(() => {
    if (!open) {
      pushedRef.current = false;
      ignorePopRef.current = false;
      return;
    }

    if (!pushedRef.current) {
      window.history.pushState({ [HISTORY_FLAG]: true }, '');
      pushedRef.current = true;
    }

    const onPopState = () => {
      if (ignorePopRef.current) {
        ignorePopRef.current = false;
        return;
      }
      pushedRef.current = false;
      onClose();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [open, onClose]);

  return useCallback(() => {
    if (pushedRef.current) {
      ignorePopRef.current = false;
      window.history.back();
      return;
    }
    onClose();
  }, [onClose]);
}
