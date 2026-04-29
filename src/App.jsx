import { lazy, Suspense } from 'react';
import Globe from './Globe.jsx';
import { useInView } from './hooks.js';

const Journey = lazy(() => import('./Journey.jsx'));
const Skills = lazy(() => import('./Skills.jsx'));
const Projects = lazy(() => import('./Projects.jsx'));
const About = lazy(() => import('./About.jsx'));
const Contact = lazy(() => import('./Contact.jsx'));

function HeroSection() {
  const [ref, inView] = useInView({ rootMargin: '100px' });
  return (
    <section id="home" className="hero-section" ref={ref}>
      <div className="canvas-wrap">
        <Globe inView={inView} />
      </div>

      <div className="hero">
        <h1>
          Exploring new
          <br />
          worlds in code.
        </h1>
        <p>
          Full-stack engineer crafting interactive experiences at the edge of
          the web. Scroll, drag, and let the planet spin.
        </p>
        <div className="scroll-hint">Scroll to begin the journey ↓</div>
      </div>

      <footer className="footer">
        Model:{' '}
        <a
          href="https://sketchfab.com/3d-models/stylized-planet-789725db86f547fc9163b00f302c3e70"
          target="_blank"
          rel="noreferrer"
        >
          "Stylized planet"
        </a>{' '}
        by cmzw — CC-BY-4.0
      </footer>
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <div className="brand">
        Port<span>folio</span>
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
