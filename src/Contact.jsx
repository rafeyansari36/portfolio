import { useRef, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInView } from './hooks.js';

function Singularity() {
  return (
    <mesh>
      <sphereGeometry args={[0.55, 48, 48]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  );
}

function AccretionDisc() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.6;
  });
  const rings = useMemo(
    () => [
      { r: 0.85, w: 0.07, color: '#ff5f6d', op: 0.85 },
      { r: 0.97, w: 0.06, color: '#ff8d5b', op: 0.78 },
      { r: 1.10, w: 0.05, color: '#ffb347', op: 0.7  },
      { r: 1.24, w: 0.04, color: '#ffd166', op: 0.6  },
      { r: 1.38, w: 0.035, color: '#ffe7a3', op: 0.45 },
      { r: 1.55, w: 0.03,  color: '#fff4cf', op: 0.32 },
    ],
    []
  );
  return (
    <group ref={ref} rotation={[Math.PI / 2.4, 0, 0]}>
      {rings.map((r, i) => (
        <mesh key={i}>
          <torusGeometry args={[r.r, r.w, 12, 96]} />
          <meshBasicMaterial color={r.color} transparent opacity={r.op} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function PhotonRing() {
  return (
    <mesh rotation={[Math.PI / 2.4, 0, 0]}>
      <torusGeometry args={[0.7, 0.012, 12, 128]} />
      <meshBasicMaterial color="#fff5d6" transparent opacity={0.95} toneMapped={false} />
    </mesh>
  );
}

function OuterAura() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z -= delta * 0.18;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.4, 0, 0]}>
      <ringGeometry args={[2.0, 2.9, 96]} />
      <meshBasicMaterial color="#6ea8fe" transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  );
}

function InfallingParticles() {
  const COUNT = 1200;
  const ref = useRef();
  const data = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const meta = new Float32Array(COUNT * 3); // r, theta, speed
    const c = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      const r = 1.7 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const yJitter = (Math.random() - 0.5) * 0.18;
      positions[i * 3]     = Math.cos(theta) * r;
      positions[i * 3 + 1] = yJitter;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      meta[i * 3]     = r;
      meta[i * 3 + 1] = theta;
      meta[i * 3 + 2] = 0.4 + Math.random() * 0.8;
      const t = Math.random();
      c.setHSL(0.04 + t * 0.12, 0.95, 0.55 + Math.random() * 0.2);
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors, meta };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    const meta = data.meta;
    for (let i = 0; i < COUNT; i++) {
      meta[i * 3 + 1] += delta * meta[i * 3 + 2] * 0.6;
      meta[i * 3]     -= delta * 0.18 * (1 / Math.max(meta[i * 3], 0.6));
      if (meta[i * 3] < 0.55) {
        meta[i * 3]     = 1.7 + Math.random() * 2.4;
        meta[i * 3 + 1] = Math.random() * Math.PI * 2;
      }
      const r = meta[i * 3];
      const th = meta[i * 3 + 1];
      arr[i * 3]     = Math.cos(th) * r;
      arr[i * 3 + 2] = Math.sin(th) * r;
      // squash y as particle gets closer to disc
      arr[i * 3 + 1] *= 0.985;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function DistantStars() {
  const positions = useMemo(() => {
    const COUNT = 2000;
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 18 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.06} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

export default function Contact() {
  const [ref, inView] = useInView();
  const [sent, setSent] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fromEmail = formData.get('email') || '';
    const message = formData.get('message') || '';
    const subject = encodeURIComponent('Project enquiry — via portfolio');
    const body = encodeURIComponent(`${message}\n\n— sent from ${fromEmail}`);
    window.location.href = `mailto:rafeldo36@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <section id="contact" className="content-section contact-section" ref={ref}>
      <div className="section-canvas">
        <Canvas
          camera={{ position: [0, 1.4, 4.8], fov: 55 }}
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#03040a']} />
          <fog attach="fog" args={['#03040a', 7, 22]} />
          <ambientLight intensity={0.18} />

          <Suspense fallback={null}>
            <DistantStars />
            <OuterAura />
            <AccretionDisc />
            <PhotonRing />
            <InfallingParticles />
            <Singularity />
          </Suspense>
        </Canvas>

        <div className="contact-overlay">
          <div className="section-tag">05 — Connect</div>
          <h2>Let's build something.</h2>
          <p>
            Have a project in mind? Send a signal — it'll reach me on the other
            side.
          </p>

          <form className="contact-form" onSubmit={onSubmit}>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
            />
            <textarea
              name="message"
              placeholder="What are you building?"
              rows={4}
              required
            />
            <button type="submit">{sent ? 'Signal sent ✓' : 'Send →'}</button>
          </form>

          <div className="contact-socials">
            <a href="mailto:rafeldo36@gmail.com">Email</a>
            <span>·</span>
            <a href="https://github.com/rafeldo36" target="_blank" rel="noreferrer">GitHub</a>
            <span>·</span>
            <a href="https://www.linkedin.com/in/rafeyansari" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
    </section>
  );
}
