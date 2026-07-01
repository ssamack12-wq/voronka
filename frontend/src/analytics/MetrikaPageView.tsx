import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { metrikaHit } from './yandexMetrika';

/** Sends virtual page views to Yandex Metrika on SPA route changes. */
export function MetrikaPageView() {
  const location = useLocation();
  const isInitial = useRef(true);

  useEffect(() => {
    const url = location.pathname + location.search;

    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    metrikaHit(url, { title: document.title });
  }, [location.pathname, location.search]);

  return null;
}
