import { lazy, Suspense } from 'react';
import Hero3D from './Hero3D.jsx';
import { useInView } from './hooks.js';

const Journey = lazy(() => import('./Journey.jsx'));
const Skills = lazy(() => import('./Skills.jsx'));
const Projects = lazy(() => import('./Projects.jsx'));
const About = lazy(() => import('./About.jsx'));
const Contact = lazy(() => import('./Contact.jsx'));

function AnimatedLetters({ text, baseDelay = 0, step = 0.035 }) {
  return [...text].map((ch, i) => {
    if (ch === ' ') return <span key={i}>{' '}</span>;
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
  return (
    <section id="home" className="hero-section" ref={ref}>
      <div className="canvas-wrap">
        <Hero3D inView={inView} />
      </div>

      <div className="hero">
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
          Full-stack developer specializing in Angular, React, and the
          MEAN/MERN ecosystem. Scroll down to walk through the journey.
        </p>
        <div className="scroll-hint">Scroll to begin the journey ↓</div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <div className="brand">
        Rafey<span>.dev</span>
      </div>

      <nav className="nav-links" aria-label="Primary">
        <a href="#home">Home</a>
        <a href="#journey">Journey</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
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
