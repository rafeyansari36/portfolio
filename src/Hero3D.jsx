import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function TorusKnot() {
  const solid = useRef();
  const wire = useRef();

  useFrame((_, delta) => {
    if (solid.current) {
      solid.current.rotation.x += delta * 0.18;
      solid.current.rotation.y += delta * 0.24;
    }
    if (wire.current) {
      wire.current.rotation.x += delta * 0.18;
      wire.current.rotation.y += delta * 0.24;
    }
  });

  return (
    <Float speed={1.4} floatIntensity={0.4} rotationIntensity={0.15}>
      <group>
        <mesh ref={solid}>
          <torusKnotGeometry args={[0.9, 0.28, 220, 32, 2, 3]} />
          <meshStandardMaterial
            color="#6ea8fe"
            emissive="#6ea8fe"
            emissiveIntensity={0.45}
            roughness={0.25}
            metalness={0.7}
          />
        </mesh>
        <mesh ref={wire}>
          <torusKnotGeometry args={[0.94, 0.045, 220, 12, 2, 3]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.22} />
        </mesh>
      </group>
    </Float>
  );
}

function StarField() {
  const ref = useRef();
  const positions = useMemo(() => {
    const COUNT = 1800;
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 8 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.04} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

function DriftingMotes() {
  const ref = useRef();
  const positions = useMemo(() => {
    const COUNT = 90;
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    return arr;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.05) * 0.3;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#6ea8fe"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function MouseParallax() {
  const target = useMemo(() => new THREE.Vector3(0, 0, 4), []);
  useFrame(({ camera, mouse }) => {
    target.set(mouse.x * 0.5, mouse.y * 0.35, 4);
    camera.position.lerp(target, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Hero3D({ inView = true }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      frameloop={inView ? 'always' : 'never'}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 8, 24]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 2, 4]} intensity={1.4} color="#6ea8fe" distance={12} />
      <pointLight position={[-3, -1, 2]} intensity={0.7} color="#ff8fa9" distance={10} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <Suspense fallback={null}>
        <StarField />
        <DriftingMotes />
        <TorusKnot />
      </Suspense>
      <MouseParallax />
    </Canvas>
  );
}
