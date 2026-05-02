import { lazy, Suspense } from 'react';
import Hero3D from './Hero3D.jsx';
import { useInView } from './hooks.js';
import {
  CustomCursor,
  ScrollProgress,
  MagneticButton,
  useRipples,
} from './HeroFX.jsx';

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
        <Hero3D inView={inView} />
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

      <nav className="nav-links" aria-label="Primary">
        <a href="#home" data-magnetic>Home</a>
        <a href="#journey" data-magnetic>Journey</a>
        <a href="#skills" data-magnetic>Skills</a>
        <a href="#projects" data-magnetic>Projects</a>
        <a href="#about" data-magnetic>About</a>
        <a href="#contact" data-magnetic>Contact</a>
      </nav>

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
