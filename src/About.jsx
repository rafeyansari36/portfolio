import { useRef, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useInView } from './hooks.js';

const LOCATIONS = [
  { lat: 19.0760,  lng: 72.8777,  label: 'Mumbai',     note: 'Home base.' },
  { lat: 28.6139,  lng: 77.2090,  label: 'Delhi',      note: 'Client engagements.' },
  { lat: 12.9716,  lng: 77.5946,  label: 'Bengaluru',  note: 'Tech meetups.' },
  { lat: 1.3521,   lng: 103.8198, label: 'Singapore',  note: 'Where products reach.' },
  { lat: 51.5074,  lng: -0.1278,  label: 'London',     note: 'Global users.' },
  { lat: 40.7128,  lng: -74.0060, label: 'New York',   note: 'Cross-timezone work.' },
];

const PIN_RADIUS = 1.18;

function latLngToVec3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function LocationPin({ position, color = '#ffd166' }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const s = 1 + Math.sin(t * 2.4) * 0.2;
    ref.current.scale.set(s, s, s);
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function GlobeWithPins() {
  const ref = useRef();
  const { scene } = useGLTF('/planet/scene.gltf');
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={ref}>
      <primitive object={cloned} scale={1.3} />
      {LOCATIONS.map((loc, i) => {
        const pos = latLngToVec3(loc.lat, loc.lng, PIN_RADIUS);
        return <LocationPin key={i} position={[pos.x, pos.y, pos.z]} />;
      })}
    </group>
  );
}

function FloatingShard({ position, color, delay = 0 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + delay;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.y = t * 0.4;
  });
  return (
    <Float speed={2} floatIntensity={0.6} rotationIntensity={0.4}>
      <mesh ref={ref} position={position}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
          flatShading
        />
      </mesh>
    </Float>
  );
}

useGLTF.preload('/planet/scene.gltf');

export default function About() {
  const [ref, inView] = useInView();
  const [hoveredLoc] = useState(null); // reserved for future hover labels
  void hoveredLoc;

  return (
    <section id="about" className="content-section about-section" ref={ref}>
      <div className="about-grid">
        <div className="about-text">
          <div className="section-tag">04 — About</div>
          <h2>Engineering with intent — design, depth, and detail.</h2>
          <p>
            I'm Rafey Ansari — a software engineer based in Mumbai with a
            unique blend of technical expertise and design acumen. I specialize
            in user-centered, robust web applications across the
            Angular/React, MEAN, and MERN ecosystems.
          </p>
          <p>
            My day-to-day is TypeScript, NgRx, and RxJS on the frontend; Node,
            Express, and MongoDB on the backend; SCSS, Tailwind, and GSAP for
            the polish. Hands-on experience shipping for Pafex.Co, TechCharm
            India, and Dealmoney Commodities.
          </p>

          <div className="about-stats">
            <div>
              <strong>3+</strong>
              <span>years shipping</span>
            </div>
            <div>
              <strong>3</strong>
              <span>companies collaborated</span>
            </div>
            <div>
              <strong>10+</strong>
              <span>products delivered</span>
            </div>
          </div>

          <div className="about-credit">
            Globe model:{' '}
            <a
              href="https://sketchfab.com/3d-models/stylized-planet-789725db86f547fc9163b00f302c3e70"
              target="_blank"
              rel="noreferrer"
            >
              "Stylized planet"
            </a>{' '}
            by cmzw — CC-BY-4.0
          </div>
        </div>

        <div className="about-canvas-wrap">
          <Canvas
            camera={{ position: [0, 0, 3.4], fov: 45 }}
            frameloop={inView ? 'always' : 'never'}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <color attach="background" args={['#05060a']} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[4, 3, 5]} intensity={1.1} />
            <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#6ea8fe" />
            <pointLight position={[0, 0, 3]} intensity={0.5} color="#ffd166" />

            <Suspense fallback={null}>
              <GlobeWithPins />
              <FloatingShard position={[2.3, 1.0, 0]} color="#6ea8fe" delay={0} />
              <FloatingShard position={[-2.2, -1.1, 0.5]} color="#ff8fa9" delay={1.2} />
              <FloatingShard position={[1.7, -1.6, -0.3]} color="#ffd166" delay={2.4} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </section>
  );
}
