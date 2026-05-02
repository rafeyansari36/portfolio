import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useInView, useMediaQuery } from './hooks.js';

const SKILLS = [
  { name: 'Angular',    color: '#dd0031' },
  { name: 'React',      color: '#61dafb' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'NgRx',       color: '#b7178c' },
  { name: 'RxJS',       color: '#b7178c' },
  { name: 'Next.js',    color: '#cccccc' },
  { name: 'Node.js',    color: '#83cd29' },
  { name: 'MongoDB',    color: '#4db33d' },
  { name: 'Three.js',   color: '#ffffff' },
  { name: 'Tailwind',   color: '#38bdf8' },
  { name: 'SCSS',       color: '#cd6799' },
  { name: 'Git',        color: '#f05033' },
];

function Core() {
  const ref = useRef();
  const innerRef = useRef();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4;
      ref.current.rotation.x += delta * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.6;
    }
  });
  return (
    <>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial
          color="#6ea8fe"
          emissive="#6ea8fe"
          emissiveIntensity={0.4}
          wireframe
        />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color="#0a0d14"
          emissive="#1a2540"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </>
  );
}

function SkillNode({ skill, idx, total }) {
  const groupRef = useRef();
  const offset = (idx / total) * Math.PI * 2;
  const tilt = ((idx % 4) - 1.5) * 0.5;
  const radius = 2.4 + ((idx % 3) - 1) * 0.25;
  const speed = 0.18 + (idx % 5) * 0.015;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    groupRef.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t * 0.6) * (radius * 0.35) + tilt,
      Math.sin(t) * radius
    );
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.6} floatIntensity={0.35} rotationIntensity={0.3}>
        <mesh>
          <sphereGeometry args={[0.13, 18, 18]} />
          <meshStandardMaterial
            color={skill.color}
            emissive={skill.color}
            emissiveIntensity={0.85}
            roughness={0.35}
            metalness={0.3}
          />
        </mesh>
        <Text
          position={[0, 0.32, 0]}
          fontSize={0.16}
          color="#e6e8ee"
          anchorX="center"
          anchorY="middle"
          outlineColor="#000000"
          outlineWidth={0.008}
        >
          {skill.name}
        </Text>
      </Float>
    </group>
  );
}

function OrbitRings() {
  const rings = useMemo(
    () => [
      { r: 2.4, tilt: [Math.PI / 2, 0, 0.1] },
      { r: 2.65, tilt: [Math.PI / 2, 0.3, 0] },
      { r: 2.15, tilt: [Math.PI / 2.2, 0, 0.4] },
    ],
    []
  );
  return (
    <>
      {rings.map((r, i) => (
        <mesh key={i} rotation={r.tilt}>
          <torusGeometry args={[r.r, 0.005, 8, 96]} />
          <meshBasicMaterial color="#6ea8fe" transparent opacity={0.18} />
        </mesh>
      ))}
    </>
  );
}

function StarDust() {
  const positions = useMemo(() => {
    const COUNT = 1500;
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 6 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
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
      <pointsMaterial color="#ffffff" size={0.03} sizeAttenuation transparent opacity={0.55} />
    </points>
  );
}

export default function Skills() {
  const [ref, inView] = useInView();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const sceneScale = isMobile ? 0.6 : 1;
  const cameraPos = isMobile ? [0, 0.4, 4.6] : [0, 0.8, 5.5];
  const cameraFov = isMobile ? 60 : 50;

  return (
    <section id="skills" className="content-section skills-section" ref={ref}>
      <div className="section-header">
        <div className="section-tag">02 — Stack</div>
        <h2>Tools of the trade</h2>
        <p>The MEAN/MERN core I orbit through every day — from Angular &amp; NgRx to Node, MongoDB, and Three.js.</p>
      </div>

      <div className="section-canvas">
        <Canvas
          camera={{ position: cameraPos, fov: cameraFov }}
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#05060a']} />
          <fog attach="fog" args={['#05060a', 8, 22]} />
          <ambientLight intensity={0.35} />
          <pointLight position={[0, 0, 0]} intensity={2.4} color="#6ea8fe" distance={9} />
          <directionalLight position={[5, 4, 5]} intensity={0.5} />

          <Suspense fallback={null}>
            <StarDust />
            <group scale={sceneScale}>
              <OrbitRings />
              <Core />
              {SKILLS.map((s, i) => (
                <SkillNode key={s.name} skill={s} idx={i} total={SKILLS.length} />
              ))}
            </group>
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
