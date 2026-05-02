import { useEffect, useRef, useState } from 'react';

/**
 * Custom cursor: a small follower dot that tracks the mouse exactly,
 * paired with a larger ring that lerps toward it. Grows + fills when
 * over interactive elements ([data-magnetic], <a>, <button>).
 *
 * Disabled on touch / coarse-pointer devices.
 */
export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches) return;

    document.body.classList.add('has-custom-cursor');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    function move(e) {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
    }

    function over(e) {
      const t = e.target.closest?.('[data-magnetic], a, button, .letter, .nav-links a');
      if (t) ringRef.current?.classList.add('is-hover');
    }
    function out(e) {
      const t = e.target.closest?.('[data-magnetic], a, button, .letter, .nav-links a');
      if (t) ringRef.current?.classList.remove('is-hover');
    }

    function down() { ringRef.current?.classList.add('is-down'); }
    function up()   { ringRef.current?.classList.remove('is-down'); }

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    }

    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    document.addEventListener('mousedown', down);
    document.addEventListener('mouseup', up);
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      document.removeEventListener('mousedown', down);
      document.removeEventListener('mouseup', up);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}

/**
 * Top-of-page scroll progress bar. Smooth, fixed, no-layout-shift.
 */
export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    function update() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${pct / 100})`;
      raf = 0;
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div className="scroll-progress" ref={ref} aria-hidden="true" />;
}

/**
 * Click ripple — emits an expanding ring at the click point, scoped to
 * the element this hook is attached to.
 */
export function useRipples() {
  const [ripples, setRipples] = useState([]);

  function spawn(e) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY ?? 0) - rect.top;
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 900);
  }

  const layer = (
    <div className="ripple-layer" aria-hidden="true">
      {ripples.map((r) => (
        <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </div>
  );

  return [layer, spawn];
}

/**
 * Magnetic button — pulls slightly toward the cursor when hovered,
 * snaps back on leave. Looks great on CTAs.
 */
export function MagneticButton({ children, strength = 0.35, className = '', ...rest }) {
  const ref = useRef(null);

  function onMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = '';
  }

  return (
    <a
      ref={ref}
      className={`magnetic-btn ${className}`}
      data-magnetic
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      <span>{children}</span>
    </a>
  );
}
