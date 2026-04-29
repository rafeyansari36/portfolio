import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const EXPERIENCES = [
  {
    t: 0.08,
    year: '2020',
    title: 'Junior Developer',
    company: 'First Steps Inc.',
    detail:
      'Started my career building internal dashboards and CRUD apps. Learned the fundamentals of shipping production code under deadline.',
  },
  {
    t: 0.34,
    year: '2022',
    title: 'Frontend Engineer',
    company: 'Growth Co.',
    detail:
      'Owned the customer-facing web app — migrated to React, set up the design system, and cut Largest Contentful Paint by 60%.',
  },
  {
    t: 0.62,
    year: '2024',
    title: 'Senior Engineer',
    company: 'Scale Co.',
    detail:
      'Led a team of four, designed real-time data pipelines, and shipped the WebGL-powered visualization layer used by enterprise clients.',
  },
  {
    t: 0.92,
    year: '2026',
    title: 'Lead / Today',
    company: 'Currently Available',
    detail:
      'Open to building the next ambitious thing. Interested in interactive 3D, dev tooling, and AI-augmented developer experiences.',
  },
];

const CONTROL_POINTS = [
  new THREE.Vector3(-14, 0, -4),
  new THREE.Vector3(-9, 0, 3),
  new THREE.Vector3(-4, 0, -3),
  new THREE.Vector3(0, 0, 2),
  new THREE.Vector3(4, 0, -3),
  new THREE.Vector3(9, 0, 3),
  new THREE.Vector3(14, 0, -4),
];

const curve = new THREE.CatmullRomCurve3(CONTROL_POINTS, false, 'catmullrom', 0.5);

const ROAD_WIDTH = 2.2;
const ROAD_Y = 0.0;

function buildRibbon(curveRef, segments, halfA, halfB, yOffset = 0) {
  const positions = [];
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);
  const tmpSide = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curveRef.getPointAt(t);
    const tangent = curveRef.getTangentAt(t).normalize();
    tmpSide.crossVectors(up, tangent).normalize();
    positions.push(
      point.x + tmpSide.x * halfA, point.y + yOffset, point.z + tmpSide.z * halfA,
      point.x + tmpSide.x * halfB, point.y + yOffset, point.z + tmpSide.z * halfB
    );
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

function Road() {
  const asphalt = useMemo(
    () => buildRibbon(curve, 400, ROAD_WIDTH / 2, -ROAD_WIDTH / 2, ROAD_Y),
    []
  );
  const shoulderL = useMemo(
    () => buildRibbon(curve, 400, ROAD_WIDTH / 2 + 0.35, ROAD_WIDTH / 2, ROAD_Y - 0.002),
    []
  );
  const shoulderR = useMemo(
    () => buildRibbon(curve, 400, -ROAD_WIDTH / 2, -ROAD_WIDTH / 2 - 0.35, ROAD_Y - 0.002),
    []
  );
  const edgeL = useMemo(() => {
    const half = ROAD_WIDTH / 2;
    return buildRibbon(curve, 400, half - 0.06, half - 0.12, ROAD_Y + 0.005);
  }, []);
  const edgeR = useMemo(() => {
    const half = ROAD_WIDTH / 2;
    return buildRibbon(curve, 400, -half + 0.12, -half + 0.06, ROAD_Y + 0.005);
  }, []);

  return (
    <group>
      {/* gravel/curb shoulders */}
      <mesh geometry={shoulderL} receiveShadow>
        <meshStandardMaterial color="#3a3530" roughness={1.0} />
      </mesh>
      <mesh geometry={shoulderR} receiveShadow>
        <meshStandardMaterial color="#3a3530" roughness={1.0} />
      </mesh>
      {/* asphalt */}
      <mesh geometry={asphalt} receiveShadow>
        <meshStandardMaterial color="#1d1f24" roughness={0.78} metalness={0.0} />
      </mesh>
      {/* solid white edge lines */}
      <mesh geometry={edgeL}>
        <meshStandardMaterial color="#f4f4ec" emissive="#f4f4ec" emissiveIntensity={0.08} roughness={0.6} />
      </mesh>
      <mesh geometry={edgeR}>
        <meshStandardMaterial color="#f4f4ec" emissive="#f4f4ec" emissiveIntensity={0.08} roughness={0.6} />
      </mesh>
    </group>
  );
}

function DashedCenter() {
  const stripes = useMemo(() => {
    const arr = [];
    const totalDashes = 80;
    for (let i = 0; i < totalDashes; i++) {
      const t = (i + 0.5) / totalDashes;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const target = point.clone().add(tangent);
      arr.push({
        pos: [point.x, ROAD_Y + 0.008, point.z],
        target: [target.x, ROAD_Y + 0.008, target.z],
        key: i,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {stripes.map((s) => (
        <Stripe key={s.key} pos={s.pos} look={s.target} />
      ))}
    </group>
  );
}

function Stripe({ pos, look }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.lookAt(...look);
  }, [look]);
  return (
    <mesh ref={ref} position={pos}>
      <boxGeometry args={[0.1, 0.005, 0.45]} />
      <meshStandardMaterial color="#f4d35e" emissive="#f4d35e" emissiveIntensity={0.15} roughness={0.55} />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROAD_Y - 0.01, 0]} receiveShadow>
      <planeGeometry args={[260, 120, 1, 1]} />
      <meshStandardMaterial color="#0d1626" roughness={1.0} />
    </mesh>
  );
}

function Milestones() {
  return (
    <>
      {EXPERIENCES.map((exp, i) => {
        const point = curve.getPointAt(exp.t);
        const tangent = curve.getTangentAt(exp.t).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const side = new THREE.Vector3().crossVectors(up, tangent).normalize().multiplyScalar(1.4);
        const flagPos = point.clone().add(side);
        return (
          <group key={i} position={[flagPos.x, 0, flagPos.z]}>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 1.2, 8]} />
              <meshStandardMaterial color="#6ea8fe" emissive="#6ea8fe" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#6ea8fe" emissive="#6ea8fe" emissiveIntensity={1.2} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function Car({ progressRef }) {
  const ref = useRef();
  const { scene } = useGLTF('/car/race.glb');

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        // Ensure vertex colors render (Kenney models paint body parts via vertex colors).
        const mat = obj.material.clone();
        if (obj.geometry.attributes.color) {
          mat.vertexColors = true;
          // Reset base color to white so vertex colors aren't tinted/darkened.
          if (mat.color) mat.color.set('#ffffff');
        }
        mat.metalness = 0.15;
        mat.roughness = 0.55;
        mat.needsUpdate = true;
        obj.material = mat;
        obj.castShadow = true;
      }
    });
    return c;
  }, [scene]);

  useFrame(() => {
    if (!ref.current) return;
    const t = THREE.MathUtils.clamp(progressRef.current.smooth, 0, 1);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    const carY = ROAD_Y + 0.04;
    ref.current.position.set(point.x, carY, point.z);
    const lookTarget = new THREE.Vector3().copy(point).add(tangent);
    ref.current.lookAt(lookTarget.x, carY, lookTarget.z);
  });

  return <primitive ref={ref} object={cloned} scale={0.85} />;
}

useGLTF.preload('/car/race.glb');

function CameraRig({ progressRef }) {
  const { camera } = useThree();
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const lookTmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const t = THREE.MathUtils.clamp(progressRef.current.smooth, 0, 1);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    tmp.copy(point).addScaledVector(tangent, -3.2);
    tmp.y += 1.8;

    const damp = 1 - Math.pow(0.001, delta);
    camera.position.lerp(tmp, damp);

    lookTmp.copy(point).addScaledVector(tangent, 1.5);
    lookTmp.y += 0.4;
    camera.lookAt(lookTmp);
  });

  return null;
}

function Smoother({ progressRef }) {
  useFrame((_, delta) => {
    const p = progressRef.current;
    p.smooth = THREE.MathUtils.damp(p.smooth, p.target, 4, delta);
  });
  return null;
}

export default function Journey() {
  const sectionRef = useRef(null);
  const progressRef = useRef({ target: 0, smooth: 0 });
  const [activeIdx, setActiveIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    function update() {
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const t = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));
      progressRef.current.target = t;
      setProgressPct(t);

      let idx = 0;
      for (let i = 0; i < EXPERIENCES.length; i++) {
        if (t >= EXPERIENCES[i].t - 0.08) idx = i;
      }
      setActiveIdx(idx);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section id="journey" className="journey-section" ref={sectionRef}>
      <div className="journey-sticky">
        <Canvas
          camera={{ position: [0, 4, -10], fov: 55 }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#05060a']} />
          <fog attach="fog" args={['#05060a', 14, 42]} />

          <hemisphereLight args={['#6b88c4', '#0a0d14', 0.45]} />
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[6, 10, 4]}
            intensity={1.4}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-5, 4, -3]} intensity={0.55} color="#7aa6ff" />
          <directionalLight position={[0, 6, -8]} intensity={0.4} color="#ffb86b" />

          <Suspense fallback={null}>
            <Environment preset="night" />
            <Ground />
            <Road />
            <DashedCenter />
            <Milestones />
            <Car progressRef={progressRef} />
            <CameraRig progressRef={progressRef} />
            <Smoother progressRef={progressRef} />
          </Suspense>
        </Canvas>

        <div className="journey-overlay">
          <div className="journey-title">My Journey</div>
          <div className="journey-progress">
            <div className="journey-progress-bar" style={{ width: `${progressPct * 100}%` }} />
          </div>

          <div className="exp-cards">
            {EXPERIENCES.map((exp, i) => (
              <div
                key={i}
                className={`exp-card ${i === activeIdx ? 'active' : ''}`}
                aria-hidden={i !== activeIdx}
              >
                <div className="exp-year">{exp.year}</div>
                <div className="exp-title">{exp.title}</div>
                <div className="exp-company">{exp.company}</div>
                <p>{exp.detail}</p>
              </div>
            ))}
          </div>

          <div className="journey-hint">Scroll to drive →</div>
        </div>
      </div>
    </section>
  );
}
