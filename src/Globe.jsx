import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stars, Environment } from '@react-three/drei';

function Planet(props) {
  const ref = useRef();
  const { scene } = useGLTF('/planet/scene.gltf');

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });

  return <primitive ref={ref} object={scene} {...props} />;
}

useGLTF.preload('/planet/scene.gltf');

export default function Globe({ inView = true }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      frameloop={inView ? 'always' : 'never'}
    >
      <color attach="background" args={['#05060a']} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#6ea8fe" />

      <Suspense fallback={null}>
        <Planet scale={1.4} />
        <Stars radius={80} depth={40} count={3500} factor={3} saturation={0} fade speed={0.6} />
        <Environment preset="night" />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}
