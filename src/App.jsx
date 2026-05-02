import { lazy, Suspense, useEffect, useState } from 'react';
import Hero3D from './Hero3D.jsx';
import { useInView, useMediaQuery } from './hooks.js';
import {
  CustomCursor,
  ScrollProgress,
  MagneticButton,
  useRipples,
} from './HeroFX.jsx';

const NAV_ITEMS = [
  { id: 'home',     label: 'Home' },
  { id: 'journey',  label: 'Journey' },
  { id: 'skills',   label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'about',    label: 'About' },
  { id: 'contact',  label: 'Contact' },
];

const NAV_ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9.5" />
    </svg>
  ),
  journey: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m9.5 14.5 1.6-4.2 4.2-1.6-1.6 4.2z" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  skills: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.5 9.5 9 3 12l6.5 3 2.5 6.5L14.5 15 21 12l-6.5-3z" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 5.5L20 7" />
    </svg>
  ),
};

function PrimaryNav() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function update() {
      // Use the trigger line at 38% of viewport height — reads naturally as
      // "this section is the one currently being read".
      const triggerY = window.innerHeight * 0.38;
      let current = NAV_ITEMS[0].id;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= triggerY) current = item.id;
      }
      setActive(current);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <nav className="nav-links" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          data-magnetic
          aria-label={item.label}
          aria-current={active === item.id ? 'true' : undefined}
          className={active === item.id ? 'is-active' : ''}
        >
          <span className="nav-icon">{NAV_ICONS[item.id]}</span>
          <span className="nav-label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

const Journey = lazy(() => import('./Journey.jsx'));
const Skills = lazy(() => import('./Skills.jsx'));
const Projects = lazy(() => import('./Projects.jsx'));
const About = lazy(() => import('./About.jsx'));
const Contact = lazy(() => import('./Contact.jsx'));

function AnimatedLetters({ text, baseDelay = 0, step = 0.035 }) {
  return [...text].map((ch, i) => {
    if (ch === ' ') return <span key={i}>{' '}</span>;
    return (
      <span
        key={i}
        className="letter"
        style={{ '--delay': `${baseDelay + i * step}s` }}
      >
        {ch}
      </span>
    );
  });
}

function HeroSection() {
  const [ref, inView] = useInView({ rootMargin: '100px' });
  const [rippleLayer, spawnRipple] = useRipples();
  const isMobile = useMediaQuery('(max-width: 768px)');

  function handlePointer(e) {
    // Skip ripple on actual interactive children — let them handle their own clicks.
    if (e.target.closest('a, button')) return;
    spawnRipple(e);
  }

  function handleMove(e) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    target.style.setProperty('--spot-x', `${x}%`);
    target.style.setProperty('--spot-y', `${y}%`);
  }

  return (
    <section
      id="home"
      className="hero-section"
      ref={ref}
      onMouseDown={handlePointer}
      onTouchStart={handlePointer}
      onMouseMove={handleMove}
    >
      <div className="canvas-wrap">
        <Hero3D inView={inView} isMobile={isMobile} />
      </div>

      <div className="hero-spotlight" aria-hidden="true" />

      <div className="hero">
        <div className="hero-eyebrow">
          <span className="hero-dot" /> Available for new projects
        </div>

        <h1 aria-label="Hi, I'm Rafey. I engineer the web.">
          <span className="line">
            <AnimatedLetters text="Hi, I'm Rafey," baseDelay={0.15} />
          </span>
          <br />
          <span className="line">
            <AnimatedLetters text="I engineer the web." baseDelay={0.6} />
          </span>
        </h1>

        <p className="hero-sub">
          Frontend developer with 2.5+ years building high-performance web
          apps in <strong>Angular</strong>, <strong>React</strong>, and{' '}
          <strong>TypeScript</strong>. Specialized in NgRx, performance, and
          component-driven architecture.
        </p>

        <div className="hero-ctas">
          <MagneticButton href="#projects" className="primary">
            View work →
          </MagneticButton>
          <MagneticButton href="#contact" className="ghost">
            Get in touch
          </MagneticButton>
        </div>

        <div className="scroll-hint">Scroll to begin the journey ↓</div>
      </div>

      {rippleLayer}
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <ScrollProgress />
      <CustomCursor />

      <a href="#home" className="brand" data-magnetic>
        Rafey<span>.dev</span>
      </a>

      <PrimaryNav />

      <HeroSection />

      <Suspense fallback={<div className="section-loader" />}>
        <Journey />
        <Skills />
        <Projects />
        <About />
        <Contact />
      </Suspense>
    </div>
  );
}
