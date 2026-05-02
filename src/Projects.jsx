import { useRef, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useInView, useMediaQuery } from './hooks.js';

const PROJECTS = [
  {
    name: 'Apple iPhone 15 Pro',
    description:
      'Interactive 3D landing for the iPhone 15 Pro — React Three Fiber for the titanium hero model, GSAP for cinematic transitions, and Sentry instrumented for performance.',
    tags: ['React', 'GSAP', 'React Three Fiber'],
    color: '#bdb2ff',
    position: [-3.6, 1.3, 0.5],
    size: 0.58,
    link: 'https://1phone15.netlify.app/',
  },
  {
    name: 'Imaginify',
    description:
      'Next.js + TypeScript image studio powered by Cloudinary AI — restore, generative fill, object remove/recolor, and background removal, with a community feed.',
    tags: ['Next.js', 'Cloudinary AI', 'TypeScript'],
    color: '#4ecdc4',
    position: [3.2, 0.6, -1.6],
    size: 0.52,
    link: 'https://imaginify-kappa-two.vercel.app/',
  },
  {
    name: 'NooriAI — Image Generator',
    description:
      'MERN-stack AI image generator with text/voice prompts, Cloudinary pipelines, and post-processing filters (grayscale, sepia, blur). Includes a community share board.',
    tags: ['MERN', 'OpenAI', 'Cloudinary'],
    color: '#ffe66d',
    position: [0.4, -1.5, 1.8],
    size: 0.6,
    link: 'https://nooriai.netlify.app/',
  },
  {
    name: 'TshirtJS',
    description:
      'Responsive 3D SaaS for customizing T-shirts in real time — React + Three.js for the model, Express + OpenAI for AI-generated logos and patterns, with downloadable output.',
    tags: ['React', 'Three.js', 'OpenAI'],
    color: '#ff6b6b',
    position: [-2.4, -1.1, -2.2],
    size: 0.5,
    link: 'https://tshirtjs.netlify.app/',
  },
  {
    name: 'Real Estate Management',
    description:
      'Full MERN real-estate platform with user verification, transactional email flows, and admin tools for listings — backed by MongoDB + Express + React.',
    tags: ['React', 'Node.js', 'MongoDB'],
    color: '#a8dadc',
    position: [2.1, 1.7, 1.3],
    size: 0.46,
    link: 'https://uyorooms.netlify.app/',
  },
  {
    name: 'Face Recognition Attendance',
    description:
      'ML-driven attendance system using OpenCV + Python. Captures faces, builds embeddings, and matches in real time — built as a Machine Learning capstone.',
    tags: ['Python', 'OpenCV', 'Machine Learning'],
    color: '#9bd1ff',
    position: [-1.4, 0.4, 2.6],
    size: 0.44,
    link: 'https://github.com/rafeldo36/face-recognition-based-attendancy-system',
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
        <p>Tap a planet to read about the build — then visit it live.</p>
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
          <div className="project-card-footer">
            <a
              className="project-link"
              href={active.link}
              target="_blank"
              rel="noreferrer"
            >
              Visit project →
            </a>
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
      </div>
    </section>
  );
}
