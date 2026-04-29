import { useRef, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useInView, useMediaQuery } from './hooks.js';

const PROJECTS = [
  {
    name: 'Aurora Editor',
    description:
      'Real-time collaborative Markdown editor with end-to-end CRDT sync. Used by 50K+ writers across 80 countries.',
    tags: ['React', 'WebRTC', 'Yjs', 'PostgreSQL'],
    color: '#ff6b6b',
    position: [-3.6, 1.3, 0.5],
    size: 0.55,
    link: 'https://example.com',
  },
  {
    name: 'Chronicle AI',
    description:
      'AI-assisted code review tool. Integrates with GitHub Actions, flags security and performance regressions automatically.',
    tags: ['Node.js', 'OpenAI', 'TypeScript', 'Redis'],
    color: '#4ecdc4',
    position: [3.2, 0.6, -1.6],
    size: 0.5,
    link: 'https://example.com',
  },
  {
    name: 'Helio Charts',
    description:
      'WebGL-based data visualization layer for enterprise analytics. Renders 1M+ points at 60 FPS with smart LOD.',
    tags: ['Three.js', 'D3', 'WebGL', 'Rust/WASM'],
    color: '#ffe66d',
    position: [0.4, -1.5, 1.8],
    size: 0.6,
    link: 'https://example.com',
  },
  {
    name: 'Tempo CLI',
    description:
      'Open-source CLI for orchestrating local dev environments. 5K+ stars on GitHub, used by teams at three YC startups.',
    tags: ['Rust', 'CLI', 'OSS'],
    color: '#a8dadc',
    position: [-2.4, -1.1, -2.2],
    size: 0.42,
    link: 'https://example.com',
  },
  {
    name: 'Nova Auth',
    description:
      'Drop-in passwordless auth service with WebAuthn. Self-hostable, SOC 2 friendly, zero npm deps in the runtime.',
    tags: ['Go', 'WebAuthn', 'Self-host'],
    color: '#bdb2ff',
    position: [2.1, 1.7, 1.3],
    size: 0.45,
    link: 'https://example.com',
  },
];

function ProjectPlanet({ project, isActive, onClick }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
      meshRef.current.rotation.x += delta * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
    }
  });

  return (
    <group position={project.position}>
      <Float speed={1.2} floatIntensity={0.3} rotationIntensity={0.2}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          <icosahedronGeometry args={[project.size, 1]} />
          <meshStandardMaterial
            color={project.color}
            emissive={project.color}
            emissiveIntensity={isActive ? 0.7 : 0.32}
            roughness={0.45}
            metalness={0.2}
            flatShading
          />
        </mesh>
        <mesh ref={ringRef} rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[project.size * 1.45, project.size * 1.65, 48]} />
          <meshBasicMaterial
            color={project.color}
            transparent
            opacity={isActive ? 0.55 : 0.18}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>
    </group>
  );
}

function GalaxyStars() {
  const positions = useMemo(() => {
    const COUNT = 2200;
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 14 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.65}
      />
    </points>
  );
}

function CameraOrbit({ amount = 1 }) {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.06;
    camera.position.x = Math.sin(t) * 2.4 * amount;
    camera.position.y = 1.2 + Math.sin(t * 0.7) * 0.3 * amount;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Projects() {
  const [ref, inView] = useInView();
  const [activeIdx, setActiveIdx] = useState(0);
  const active = PROJECTS[activeIdx];
  const isMobile = useMediaQuery('(max-width: 768px)');
  const sceneScale = isMobile ? 0.55 : 1;
  const cameraPos = isMobile ? [0, 1.2, 8.5] : [0, 1.2, 8];
  const cameraFov = isMobile ? 60 : 55;
  const orbitAmount = isMobile ? 0.45 : 1;

  return (
    <section id="projects" className="content-section projects-section" ref={ref}>
      <div className="section-header">
        <div className="section-tag">03 — Work</div>
        <h2>Selected projects</h2>
        <p>Tap a planet to read about the build.</p>
      </div>

      <div className="section-canvas projects-canvas">
        <Canvas
          camera={{ position: cameraPos, fov: cameraFov }}
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#05060a']} />
          <fog attach="fog" args={['#05060a', 14, 32]} />
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 0, 0]} intensity={1.4} color="#ffffff" distance={20} />
          <directionalLight position={[6, 5, 4]} intensity={0.4} color="#aac6ff" />

          <Suspense fallback={null}>
            <GalaxyStars />
            <CameraOrbit amount={orbitAmount} />
            <group scale={sceneScale}>
              {PROJECTS.map((p, i) => (
                <ProjectPlanet
                  key={p.name}
                  project={p}
                  isActive={activeIdx === i}
                  onClick={() => setActiveIdx(i)}
                />
              ))}
            </group>
          </Suspense>
        </Canvas>

        <div className="project-card" key={active.name}>
          <div className="project-color-dot" style={{ background: active.color }} />
          <div className="project-name">{active.name}</div>
          <p>{active.description}</p>
          <div className="project-tags">
            {active.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="project-pager">
            {PROJECTS.map((_, i) => (
              <button
                key={i}
                className={`project-pager-dot ${i === activeIdx ? 'active' : ''}`}
                onClick={() => setActiveIdx(i)}
                aria-label={`View project ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
