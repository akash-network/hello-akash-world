"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";

import { useGlobeConfig, type GlobeConfig } from "@/lib/globe-config";
import type { ProviderMarker } from "@/lib/types";

const GLOBE_RADIUS = 100;
const MARKER_RADIUS = 0.9;
const MARKER_RADIUS_HOVER = 1.4;
const MARKER_ALTITUDE = 0.6;
const IDLE_RESUME_MS = 5000;
const SPIN_RAD_PER_SEC = 0.06;

const COUNTRIES_GEOJSON_URL = "https://unpkg.com/three-globe/example/country-polygons/ne_110m_admin_0_countries.geojson";

interface SceneProps {
  providers: ProviderMarker[];
  currentProviderOwner: string | null;
  onHover: (marker: ProviderMarker | null) => void;
  onPointerScreenPosition: (point: { x: number; y: number } | null) => void;
  onClick: (marker: ProviderMarker) => void;
  onReady?: () => void;
}

export function ProviderGlobeScene(props: SceneProps) {
  const cfg = useGlobeConfig();
  const { resolvedTheme } = useTheme();
  const showStars = resolvedTheme !== "light";
  const [autoRotate, setAutoRotate] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinGroupRef = useRef<THREE.Group>(null);

  function pauseAutoRotate() {
    setAutoRotate(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setAutoRotate(true), IDLE_RESUME_MS);
  }

  useEffect(function clearIdleTimerOnUnmount() {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  useEffect(function manageBodyCursor() {
    const prev = document.body.style.cursor;
    document.body.style.cursor = "grab";
    return () => {
      document.body.style.cursor = prev;
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 280], fov: 45, near: 0.1, far: 2000 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onPointerDown={pauseAutoRotate}
      onWheel={pauseAutoRotate}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={cfg.globe.ambientIntensity} />
      <directionalLight position={[200, 200, 200]} intensity={1.05} />
      <directionalLight position={[-200, -100, -150]} intensity={0.3} color={cfg.colors.atmosphere} />
      <group
        ref={spinGroupRef}
        rotation={[
          cfg.globe.initialTiltDeg * (Math.PI / 180),
          -cfg.globe.initialFacingLng * (Math.PI / 180),
          0
        ]}
      >
        <Earth cfg={cfg} onReady={props.onReady} />
        <ProviderPoints {...props} cfg={cfg} />
      </group>
      <GlobeSpinner groupRef={spinGroupRef} active={autoRotate} />
      <RotationControls setAutoRotate={setAutoRotate} idleTimer={idleTimer} />
      {showStars && <Stars />}
    </Canvas>
  );
}

function Earth({ cfg, onReady }: { cfg: GlobeConfig; onReady?: () => void }) {
  const globe = useMemo(() => {
    const g = new ThreeGlobe({ animateIn: false })
      .showAtmosphere(true)
      .atmosphereColor(cfg.colors.atmosphere)
      .atmosphereAltitude(0.18)
      .showGlobe(true)
      .hexPolygonResolution(cfg.dot.resolution)
      .hexPolygonMargin(cfg.dot.margin)
      .hexPolygonUseDots(true)
      .hexPolygonColor(() => cfg.dot.color);

    const material = g.globeMaterial() as THREE.MeshPhongMaterial;
    material.color = new THREE.Color(cfg.globe.surface);
    material.shininess = 0;
    material.emissive = new THREE.Color(cfg.globe.emissive);
    material.emissiveIntensity = cfg.globe.emissiveIntensity;
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    function applyThemeToGlobe() {
      const material = globe.globeMaterial() as THREE.MeshPhongMaterial;
      material.color.set(cfg.globe.surface);
      material.emissive.set(cfg.globe.emissive);
      material.emissiveIntensity = cfg.globe.emissiveIntensity;
      material.needsUpdate = true;
      globe.atmosphereColor(cfg.colors.atmosphere);
      globe.hexPolygonColor(() => cfg.dot.color);
      const data = globe.hexPolygonsData();
      if (data && data.length > 0) {
        // Re-set data to force three-globe to repaint dots with the new color fn
        globe.hexPolygonsData(data);
      }
    },
    [cfg, globe]
  );

  useEffect(
    function disposeGlobe() {
      return () => {
        globe.clear();
      };
    },
    [globe]
  );

  useEffect(
    function loadCountryDots() {
      let cancelled = false;
      const controller = new AbortController();
      fetch(COUNTRIES_GEOJSON_URL, { signal: controller.signal, headers: { accept: "application/json" } })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(`countries ${r.status}`))))
        .then((countries: { features: object[] }) => {
          if (cancelled) return;
          globe.hexPolygonsData(countries.features);
          onReady?.();
        })
        .catch(() => {
          if (!cancelled) onReady?.();
        });
      return () => {
        cancelled = true;
        controller.abort();
      };
    },
    [globe, onReady]
  );

  return <primitive object={globe} />;
}

interface RotationControlsProps {
  setAutoRotate: Dispatch<SetStateAction<boolean>>;
  idleTimer: { current: ReturnType<typeof setTimeout> | null };
}

function RotationControls({ setAutoRotate, idleTimer }: RotationControlsProps) {
  function onStart() {
    setAutoRotate(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    document.body.style.cursor = "grabbing";
  }

  function onEnd() {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setAutoRotate(true), IDLE_RESUME_MS);
    document.body.style.cursor = "grab";
  }

  return (
    <OrbitControls
      autoRotate={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={150}
      maxDistance={400}
      onStart={onStart}
      onEnd={onEnd}
    />
  );
}

function GlobeSpinner({ groupRef, active }: { groupRef: React.RefObject<THREE.Group | null>; active: boolean }) {
  useFrame((_, delta) => {
    if (!active || !groupRef.current) return;
    groupRef.current.rotation.y -= SPIN_RAD_PER_SEC * delta;
  });
  return null;
}

interface ProviderPointsProps extends SceneProps {
  cfg: GlobeConfig;
}

function ProviderPoints({ providers, currentProviderOwner, onHover, onPointerScreenPosition, onClick, cfg }: ProviderPointsProps) {
  const [hoveredOwner, setHoveredOwner] = useState<string | null>(null);

  return (
    <group>
      {providers.map(p => (
        <ProviderPoint
          key={p.owner}
          marker={p}
          isCurrent={p.owner === currentProviderOwner}
          isHovered={p.owner === hoveredOwner}
          cfg={cfg}
          onHover={(marker, screenXY) => {
            setHoveredOwner(marker?.owner ?? null);
            onHover(marker);
            onPointerScreenPosition(screenXY);
          }}
          onClick={onClick}
        />
      ))}
      {currentProviderOwner && <CurrentProviderHalo providers={providers} currentProviderOwner={currentProviderOwner} cfg={cfg} />}
    </group>
  );
}

interface PointProps {
  marker: ProviderMarker;
  isCurrent: boolean;
  isHovered: boolean;
  cfg: GlobeConfig;
  onHover: (marker: ProviderMarker | null, screen: { x: number; y: number } | null) => void;
  onClick: (marker: ProviderMarker) => void;
}

function ProviderPoint({ marker, isCurrent, isHovered, cfg, onHover, onClick }: PointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => latLngToVec3(marker.lat, marker.lng, GLOBE_RADIUS + MARKER_ALTITUDE), [marker.lat, marker.lng]);
  const color = isCurrent
    ? cfg.colors.current
    : isHovered
    ? cfg.colors.hover
    : marker.hasGpu
    ? cfg.colors.onlineGpu
    : cfg.colors.online;
  const size = isHovered || isCurrent ? MARKER_RADIUS_HOVER : MARKER_RADIUS;
  const phase = useMemo(() => hashOwner(marker.owner) * Math.PI * 2, [marker.owner]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (isCurrent || isHovered) {
      meshRef.current.scale.setScalar(1);
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 1;
      return;
    }
    const t = clock.getElapsedTime() * ((2 * Math.PI) / cfg.pulse.periodSec) + phase;
    const k = (Math.sin(t) + 1) / 2;
    meshRef.current.scale.setScalar(lerp(cfg.pulse.scaleMin, cfg.pulse.scaleMax, k));
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = lerp(cfg.pulse.opacityMin, cfg.pulse.opacityMax, k);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={e => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(marker, { x: e.clientX, y: e.clientY });
      }}
      onPointerMove={e => {
        e.stopPropagation();
        onHover(marker, { x: e.clientX, y: e.clientY });
      }}
      onPointerOut={e => {
        e.stopPropagation();
        document.body.style.cursor = "grab";
        onHover(null, null);
      }}
      onClick={e => {
        e.stopPropagation();
        onClick(marker);
      }}
    >
      <sphereGeometry args={[size, 12, 12]} />
      <meshBasicMaterial color={color} transparent toneMapped={false} />
    </mesh>
  );
}

interface HaloProps {
  providers: ProviderMarker[];
  currentProviderOwner: string;
  cfg: GlobeConfig;
}

function CurrentProviderHalo({ providers, currentProviderOwner, cfg }: HaloProps) {
  const haloRef = useRef<THREE.Mesh>(null);
  const current = providers.find(p => p.owner === currentProviderOwner);

  useFrame(({ clock }) => {
    if (!haloRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2.4) * 0.25;
    haloRef.current.scale.setScalar(pulse);
    const mat = haloRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.35 + Math.sin(t * 2.4) * 0.2;
  });

  if (!current) return null;
  const position = latLngToVec3(current.lat, current.lng, GLOBE_RADIUS + MARKER_ALTITUDE);

  return (
    <mesh ref={haloRef} position={position}>
      <sphereGeometry args={[2.6, 16, 16]} />
      <meshBasicMaterial color={cfg.colors.current} transparent opacity={0.45} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function Stars() {
  const positions = useMemo(() => {
    const count = 1200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 800 + Math.random() * 200;
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
      <pointsMaterial size={1.4} color="#ffffff" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function latLngToVec3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (90 - lng) * (Math.PI / 180);
  return [radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hashOwner(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}
