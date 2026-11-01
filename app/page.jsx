"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, Float, Text } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

function IDCard() {
  const group = useRef();
  const [dragging, setDragging] = useState(false);
  const [last, setLast] = useState({ x: 0, y: 0 });

  return (
    <group
      ref={group}
      position={[0, -0.65, 0]}
      onPointerDown={(e) => { e.stopPropagation(); setDragging(true); setLast({ x: e.clientX, y: e.clientY }); }}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
      onPointerMove={(e) => {
        if (!dragging || !group.current) return;
        group.current.rotation.y += (e.clientX - last.x) * 0.008;
        group.current.rotation.x += (e.clientY - last.y) * 0.008;
        setLast({ x: e.clientX, y: e.clientY });
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[1.7, 2.35, 0.09, 1, 1, 1]} />
        <meshStandardMaterial color="#f6f5f0" metalness={0.22} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.77, 0.052]}>
        <planeGeometry args={[1.52, 0.72]} />
        <meshStandardMaterial color="#152c25" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.76, 0.061]}>
        <circleGeometry args={[0.22, 48]} />
        <meshStandardMaterial color="#d8e4d9" />
      </mesh>
      <mesh position={[0, -0.1, 0.052]}>
        <planeGeometry args={[1.35, 0.055]} />
        <meshStandardMaterial color="#1b2a25" />
      </mesh>
      <mesh position={[0, -0.27, 0.052]}>
        <planeGeometry args={[0.95, 0.035]} />
        <meshStandardMaterial color="#7d9187" />
      </mesh>
      <mesh position={[0, -0.78, 0.052]}>
        <planeGeometry args={[1.25, 0.34]} />
        <meshStandardMaterial color="#dce7de" />
      </mesh>
      <mesh position={[0, 1.19, 0.01]}>
        <torusGeometry args={[0.13, 0.025, 12, 40]} />
        <meshStandardMaterial color="#b9c4bd" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function LanyardScene() {
  const points = [
    new THREE.Vector3(-0.14, 2.7, 0),
    new THREE.Vector3(-0.12, 2.05, 0),
    new THREE.Vector3(-0.05, 1.45, 0),
    new THREE.Vector3(0, 0.65, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  return (
    <>
      <color attach="background" args={["#090d0b"]} />
      <ambientLight intensity={1.5} />
      <spotLight position={[4, 5, 5]} intensity={65} angle={0.4} penumbra={1} castShadow />
      <pointLight position={[-4, 1, 3]} intensity={18} color="#b8e0c6" />
      <Float speed={1.3} rotationIntensity={0.08} floatIntensity={0.2}>
        <mesh>
          <tubeGeometry args={[curve, 64, 0.075, 12, false]} />
          <meshStandardMaterial color="#1e4537" roughness={0.38} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <torusGeometry args={[0.16, 0.045, 16, 40]} />
          <meshStandardMaterial color="#c1c9c3" metalness={0.85} roughness={0.18} />
        </mesh>
        <IDCard />
      </Float>
      <ContactShadows position={[0, -2.15, 0]} opacity={0.35} scale={5} blur={2.5} far={4} />
      <Environment preset="city" />
    </>
  );
}

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">mynk<span>.</span></a>
        <span className="status"><i /> INTERACTIVE 3D</span>
      </header>
      <section className="hero">
        <div className="copy">
          <p className="eyebrow">A LITTLE SOMETHING DIFFERENT</p>
          <h1>Carry your<br /><span>identity.</span></h1>
          <p className="description">A minimal 3D lanyard experience. Drag the ID card to explore it from different angles.</p>
          <div className="hint"><span>↔</span> DRAG TO ROTATE <b>·</b> MOVE TO EXPLORE</div>
        </div>
        <div className="stage">
          <Canvas camera={{ position: [0, 0.45, 7.5], fov: 36 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
            <Suspense fallback={null}><LanyardScene /></Suspense>
          </Canvas>
          <div className="stage-label">FIG. 001 <span>PERSONAL ID</span></div>
        </div>
      </section>
      <footer><span>BUILT FOR THE WEB</span><span>© 2026 MYNKK</span></footer>
    </main>
  );
}
