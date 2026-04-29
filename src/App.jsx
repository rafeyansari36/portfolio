import Globe from './Globe.jsx';
import Journey from './Journey.jsx';

export default function App() {
  return (
    <div className="app">
      <div className="brand">
        Port<span>folio</span>
      </div>

      <nav className="nav-links" aria-label="Primary">
        <a href="#home">Home</a>
        <a href="#journey">Journey</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>

      <section id="home" className="hero-section">
        <div className="canvas-wrap">
          <Globe />
        </div>

        <div className="hero">
          <h1>Exploring new<br />worlds in code.</h1>
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

      <Journey />
    </div>
  );
}
