import { useEffect, useRef, useState } from 'react';

/**
 * Live media-query matcher. Re-renders when the match state changes.
 */
export function useMediaQuery(query) {
  const get = () =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Returns [ref, inView]. When `ref` is attached to a DOM element, `inView`
 * tracks whether that element is intersecting the viewport. Used to gate
 * Canvas frameloop so off-screen 3D scenes don't burn GPU cycles.
 */
export function useInView({ rootMargin = '200px', threshold = 0 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView];
}
