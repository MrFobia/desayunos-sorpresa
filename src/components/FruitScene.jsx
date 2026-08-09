import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { FRUIT } from './fruit-palette.js';

/* --------------------------------------------------------------- frutas */

function Strawberry({ scale = 1, ...props }) {
  /* Perfil de revolución: hombro ancho arriba y punta abajo. Una esfera con un
     cono pegado leía como tomate; el lathe da la silueta correcta. */
  const profile = useMemo(() => {
    const points = [];
    const steps = 18;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps; // 0 = punta, 1 = corona
      const radius = Math.sin(Math.pow(t, 0.45) * Math.PI * 0.86) * 0.44 + 0.01;
      points.push(new THREE.Vector2(radius, t * 1.15 - 0.62));
    }
    return points;
  }, []);

  const seeds = useMemo(() => {
    const list = [];
    for (let i = 0; i < 30; i += 1) {
      const t = 0.14 + (i % 8) * 0.1;
      const angle = i * 2.399;
      const radius = Math.sin(Math.pow(t, 0.45) * Math.PI * 0.86) * 0.44;
      list.push([
        Math.cos(angle) * radius * 0.96,
        t * 1.15 - 0.62,
        Math.sin(angle) * radius * 0.96,
      ]);
    }
    return list;
  }, []);

  return (
    <group {...props} scale={scale}>
      <mesh castShadow>
        <latheGeometry args={[profile, 40]} />
        <meshStandardMaterial color={FRUIT.strawberry} roughness={0.72} />
      </mesh>
      {seeds.map((position, i) => (
        <mesh key={i} position={position} scale={[1, 1.7, 1]}>
          <sphereGeometry args={[0.033, 6, 6]} />
          <meshStandardMaterial color={FRUIT.strawberrySeed} roughness={0.95} />
        </mesh>
      ))}
      {/* cáliz: hojas planas y abiertas, no una corona de conos */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 0.26,
            0.53,
            Math.sin((i / 5) * Math.PI * 2) * 0.26,
          ]}
          rotation={[-Math.PI / 2.15, 0, -(i / 5) * Math.PI * 2]}
          scale={[1, 1.7, 1]}
        >
          <circleGeometry args={[0.2, 3]} />
          <meshStandardMaterial color={FRUIT.leaf} roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.2, 6]} />
        <meshStandardMaterial color={FRUIT.leaf} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Blueberry({ scale = 1, ...props }) {
  return (
    <group {...props} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.32, 24, 20]} />
        <meshStandardMaterial color={FRUIT.blueberry} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.12, 10]} />
        <meshStandardMaterial color={FRUIT.blueberryBloom} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
}

/* Rodaja de kiwi: disco fino, pulpa verde, corazón claro y cáscara en el canto.
   Se inclina un poco para que se lea la cara y no el canto. */
function KiwiSlice({ scale = 1, ...props }) {
  return (
    <group {...props} scale={scale}>
      <group rotation={[-0.35, 0.4, 0.15]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 40]} />
          <meshStandardMaterial color={FRUIT.kiwiFlesh} roughness={0.85} />
        </mesh>
        {[0.051, -0.051].map((z) => (
          <mesh key={z} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z]}>
            <cylinderGeometry args={[0.15, 0.15, 0.012, 24]} />
            <meshStandardMaterial color={FRUIT.kiwiCore} roughness={0.7} />
          </mesh>
        ))}
        {/* pepitas alrededor del corazón */}
        {Array.from({ length: 14 }, (_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.26, Math.sin(angle) * 0.26, 0.052]}
              scale={[1, 1.5, 1]}
            >
              <sphereGeometry args={[0.022, 6, 6]} />
              <meshStandardMaterial color={FRUIT.kiwiSkin} roughness={0.9} />
            </mesh>
          );
        })}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.03, 8, 40]} />
          <meshStandardMaterial color={FRUIT.kiwiSkin} roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

function OrangeWedge({ scale = 1, ...props }) {
  return (
    <mesh castShadow {...props} scale={scale} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 0.16, 32, 1, false, 0, Math.PI]} />
      <meshStandardMaterial color={FRUIT.orange} roughness={0.75} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- bowl */

function Bowl() {
  // Cuenco hondo: la curva arranca casi vertical en la base y se abre arriba.
  const profile = useMemo(() => {
    const points = [];
    const steps = 20;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      points.push(new THREE.Vector2(0.26 + Math.sin(t * Math.PI * 0.54) * 1.16, t * 0.95));
    }
    return points;
  }, []);

  return (
    <group position={[0, -1.12, 0]}>
      <mesh receiveShadow castShadow>
        <latheGeometry args={[profile, 64]} />
        <meshStandardMaterial color={FRUIT.bowl} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.05, 10, 64]} />
        <meshStandardMaterial color={FRUIT.bowlRim} roughness={0.85} />
      </mesh>
      {/* pie del cuenco */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.38, 0.46, 0.12, 40]} />
        <meshStandardMaterial color={FRUIT.bowlRim} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------ contenido */

const PIECES = [
  { kind: 'strawberry', name: 'Fresa', position: [-0.72, -0.12, 0.52], scale: 0.72, speed: 1.1 },
  { kind: 'strawberry', name: 'Fresa', position: [0.78, -0.22, -0.28], scale: 0.62, speed: 1.4 },
  { kind: 'strawberry', name: 'Fresa', position: [0.12, -0.3, -0.78], scale: 0.55, speed: 1.25 },
  { kind: 'kiwi', name: 'Kiwi', position: [0.2, -0.05, 0.85], scale: 0.78, speed: 0.9 },
  { kind: 'kiwi', name: 'Kiwi', position: [-1.05, -0.28, -0.5], scale: 0.66, speed: 1.2 },
  { kind: 'orange', name: 'Naranja', position: [0.98, -0.24, 0.3], scale: 0.68, speed: 1 },
  { kind: 'blueberry', name: 'Arándano', position: [-0.24, 0.02, -0.5], scale: 0.5, speed: 1.6 },
  { kind: 'blueberry', name: 'Arándano', position: [0.46, 0.08, 0.24], scale: 0.46, speed: 1.3 },
  { kind: 'blueberry', name: 'Arándano', position: [-0.86, 0.05, 0.14], scale: 0.44, speed: 1.5 },
  { kind: 'blueberry', name: 'Arándano', position: [0.88, 0.02, -0.62], scale: 0.42, speed: 1.7 },
  { kind: 'blueberry', name: 'Arándano', position: [0.06, -0.08, 0.34], scale: 0.5, speed: 1.15 },
  { kind: 'blueberry', name: 'Arándano', position: [-0.5, -0.02, 0.86], scale: 0.4, speed: 1.45 },
  { kind: 'blueberry', name: 'Arándano', position: [0.62, -0.1, -0.15], scale: 0.44, speed: 1.35 },
];

function Piece({ kind, scale, ...props }) {
  if (kind === 'strawberry') return <Strawberry scale={scale} {...props} />;
  if (kind === 'kiwi') return <KiwiSlice scale={scale} {...props} />;
  if (kind === 'orange') return <OrangeWedge scale={scale} {...props} />;
  return <Blueberry scale={scale} {...props} />;
}

function Arrangement({ onHover }) {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;
    // deriva lentísima; el control real lo tiene el usuario al arrastrar
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
  });

  return (
    <group ref={group}>
      <Bowl />
      {PIECES.map((piece, i) => (
        <Float key={i} speed={piece.speed} rotationIntensity={0.35} floatIntensity={0.3}>
          <Piece
            {...piece}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(piece.name);
            }}
            onPointerOut={() => onHover(null)}
          />
        </Float>
      ))}
    </group>
  );
}

/**
 * Escena 3D del hero. Es manipulable a propósito: el usuario arrastra para
 * girar el bol y al pasar sobre cada fruta aparece su nombre. Un objeto 3D que
 * sólo gira solo no justifica el costo de WebGL.
 */
export default function FruitScene() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.75]}
        gl={{ alpha: true }}
        camera={{ position: [0, 1.35, 4.9], fov: 40 }}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Sin color de fondo: el canvas se funde con el papel de la sección
            en vez de dibujar un rectángulo de otro tono.
            Luz suave y lateral, como una ventana, en vez del foco duro que
            hacía brillar las frutas como plástico. */}
        <ambientLight intensity={1.15} />
        <directionalLight position={[2.5, 5, 3.5]} intensity={1.25} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 1.5, -2.5]} intensity={0.35} color={FRUIT.cream} />
        <PresentationControls
          global
          snap
          polar={[-0.15, 0.35]}
          azimuth={[-0.7, 0.7]}
          config={{ mass: 1, tension: 180, friction: 24 }}
        >
          <group scale={1.18} position={[0, -0.15, 0]}>
            <Arrangement onHover={setHovered} />
          </group>
        </PresentationControls>
        <ContactShadows position={[0, -1.42, 0]} opacity={0.3} scale={9} blur={2.8} far={4} />
      </Canvas>

      <p
        className="pointer-events-none absolute bottom-2 right-2 rounded-pill px-3 py-1 text-xs"
        style={{ background: 'var(--color-paper)', color: 'var(--color-muted)' }}
      >
        {hovered ? hovered : 'Arrastrá para girar el bol'}
      </p>
    </div>
  );
}
