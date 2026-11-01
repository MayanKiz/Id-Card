"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./Lanyard.css";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function Lanyard({
  frontImage,
  backImage,
  imageFit = "cover",
  cardColor = "#ffffff",
  orientation = "portrait",
  finish = "glossy",
  cornerRadius = 0.3,
  size = 0.6,
  anchor = "center",
  strapLength = 0.5,
  strapImage,
  strapColor = "#111111",
  strapWidth = 0.65,
  metal = "silver",
  gravity = 1,
  damping = 0.5,
  elasticity = 0.5,
  breeze = 0.5,
  interactive = true,
  intro = true,
  className = "",
  style
}) {
  const containerRef = useRef(null);
  const settingsRef = useRef({});
  settingsRef.current = { frontImage, backImage, imageFit, cardColor, orientation, finish, cornerRadius, size, anchor, strapLength, strapImage, strapColor, strapWidth, metal, gravity, damping, elasticity, breeze, interactive, intro };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch { return; }

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    const canvas = renderer.domElement;
    canvas.className = "lanyard-canvas";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    camera.position.set(0, 0, 8);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x17251e, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 3.3);
    key.position.set(-3, 5, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa5d5b4, 2);
    rim.position.set(4, 1, -3);
    scene.add(rim);

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    const strapMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.68, metalness: 0.05 });
    const cardMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.05, clearcoat: 0.8 });
    const backMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.05, clearcoat: 0.8 });
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0xd6ddd8, metalness: 0.7, roughness: 0.22 });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xd9dce2, metalness: 0.95, roughness: 0.18 });
    const strapGroup = new THREE.Group();
    scene.add(strapGroup);
    const cardBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.25, 0.055, 1, 1, 1), edgeMaterial);
    cardGroup.add(cardBody);
    const front = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 2.21), cardMaterial);
    front.position.z = 0.029;
    cardGroup.add(front);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 2.21), backMaterial);
    back.position.z = -0.029;
    back.rotation.y = Math.PI;
    cardGroup.add(back);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.016, 14, 48), metalMaterial);
    ring.position.set(0, 1.11, 0);
    cardGroup.add(ring);
    const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 12, 36), metalMaterial);
    eyelet.position.set(0, 1.19, 0);
    scene.add(eyelet);

    let strapMesh;
    let frontTexture;
    let backTexture;
    let strapTexture;
    const imageCache = new Map();
    const loadTexture = (url) => new Promise(resolve => {
      if (!url) return resolve(null);
      if (imageCache.has(url)) return resolve(imageCache.get(url));
      new THREE.TextureLoader().load(url, tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        imageCache.set(url, tex);
        resolve(tex);
      }, undefined, () => resolve(null));
    });

    let alive = true;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let dragging = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    let targetX = 0;
    let targetY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let flipped = false;

    const roundedShape = (w, h, r) => {
      const s = new THREE.Shape();
      const x = -w / 2, y = -h / 2;
      const rad = clamp(r, 0.02, Math.min(w, h) * 0.2);
      s.moveTo(x + rad, y);
      s.lineTo(x + w - rad, y);
      s.quadraticCurveTo(x + w, y, x + w, y + rad);
      s.lineTo(x + w, y + h - rad);
      s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
      s.lineTo(x + rad, y + h);
      s.quadraticCurveTo(x, y + h, x, y + h - rad);
      s.lineTo(x, y + rad);
      s.quadraticCurveTo(x, y, x + rad, y);
      return s;
    };

    const rebuild = async () => {
      const s = settingsRef.current;
      const w = s.orientation === "landscape" ? 2.25 : 1.6;
      const h = s.orientation === "landscape" ? 1.6 : 2.25;
      cardBody.geometry.dispose();
      cardBody.geometry = new THREE.ExtrudeGeometry(roundedShape(w, h, 0.08 + clamp(s.cornerRadius, 0, 1) * 0.13), { depth: 0.035, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.012, bevelThickness: 0.008 });
      cardBody.geometry.translate(0, 0, -0.0175);
      front.geometry.dispose();
      back.geometry.dispose();
      front.geometry = new THREE.PlaneGeometry(w - 0.06, h - 0.06);
      back.geometry = front.geometry.clone();
      front.position.z = 0.021;
      back.position.z = -0.021;
      ring.position.set(0, h / 2 - 0.055, 0);
      eyelet.position.set(0, h / 2 + 0.015, 0);
      const fit = s.imageFit === "contain" ? THREE.Coverage : null;
      const [f, b, st] = await Promise.all([loadTexture(s.frontImage), loadTexture(s.backImage || s.frontImage), loadTexture(s.strapImage)]);
      if (!alive) return;
      [frontTexture, backTexture, strapTexture] = [f, b, st];
      cardMaterial.map = f;
      backMaterial.map = b;
      cardMaterial.color.set(s.cardColor || "#ffffff");
      backMaterial.color.set(s.cardColor || "#ffffff");
      cardMaterial.roughness = s.finish === "matte" ? 0.86 : s.finish === "metallic" ? 0.36 : 0.24;
      cardMaterial.metalness = s.finish === "metallic" ? 0.7 : 0.02;
      backMaterial.roughness = cardMaterial.roughness;
      backMaterial.metalness = cardMaterial.metalness;
      if (f) { f.wrapS = f.wrapT = THREE.ClampToEdgeWrapping; f.needsUpdate = true; }
      if (b) { b.wrapS = b.wrapT = THREE.ClampToEdgeWrapping; b.needsUpdate = true; }
      const color = new THREE.Color(s.strapColor || "#111111");
      if (st) {
        strapMaterial.map = st;
        strapMaterial.color.set("#ffffff");
      } else {
        strapMaterial.map = null;
        strapMaterial.color.copy(color);
      }
      strapMaterial.needsUpdate = true;
      if (strapMesh) {
        strapGroup.remove(strapMesh);
        strapMesh.geometry.dispose();
      }
      const strapW = 0.22 * clamp(s.strapWidth || 0.65, 0.4, 2);
      const length = 2.35 + clamp(s.strapLength, 0, 1) * 1.1;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.12, length + 0.3, 0),
        new THREE.Vector3(-0.1, length * 0.7, 0.02),
        new THREE.Vector3(0.02, length * 0.35, 0.02),
        new THREE.Vector3(0, 1.4, 0.02)
      ]);
      strapMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, strapW / 2, 10, false), strapMaterial);
      strapGroup.add(strapMesh);
      strapGroup.scale.setScalar(clamp(s.size, 0.15, 0.9) / 0.6);
      strapGroup.position.y = -0.15;
      cardGroup.position.y = -0.85 - clamp(s.strapLength, 0, 1) * 0.18;
      eyelet.position.y = cardGroup.position.y + h / 2 + 0.19;
      cardGroup.scale.setScalar(clamp(s.size, 0.15, 0.9) / 0.6);
      const metalColors = { silver: "#d9dce2", gold: "#e4b965", graphite: "#4d4f55" };
      metalMaterial.color.set(metalColors[s.metal] || metalColors.silver);
      render();
    };

    const render = () => {
      renderer.render(scene, camera);
    };
    const tick = (now) => {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      if (!dragging) {
        velocityX *= Math.pow(0.91, dt * 60);
        velocityY *= Math.pow(0.91, dt * 60);
        targetY += velocityX * dt * 5;
        targetX += velocityY * dt * 5;
        targetX += Math.sin(time * 1.1) * clamp(settingsRef.current.breeze, 0, 1) * 0.0007;
      }
      cardGroup.rotation.x += (clamp(targetX, -1.3, 1.3) - cardGroup.rotation.x) * 0.12;
      cardGroup.rotation.y += (targetY - cardGroup.rotation.y) * 0.12;
      strapGroup.rotation.y += (targetY - strapGroup.rotation.y) * 0.025;
      eyelet.rotation.copy(cardGroup.rotation);
      render();
      raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = Math.max(6.4, 8 / clamp(settingsRef.current.size || 0.6, 0.15, 0.9));
      camera.updateProjectionMatrix();
      render();
    };
    const down = e => {
      if (!settingsRef.current.interactive) return;
      dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const move = e => {
      if (!dragging) { canvas.style.cursor = settingsRef.current.interactive ? "grab" : "default"; return; }
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      targetY += dx * 0.009;
      targetX += dy * 0.008;
      velocityX = dx * 0.018;
      velocityY = dy * 0.018;
      lastX = e.clientX; lastY = e.clientY;
    };
    const up = e => {
      if (!dragging) return;
      dragging = false;
      if (!moved) {
        flipped = !flipped;
        targetY += Math.PI;
      }
      canvas.releasePointerCapture?.(e.pointerId);
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    rebuild();
    resize();
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      [cardBody, front, back, ring, eyelet].forEach(m => { m.geometry?.dispose(); });
      [strapMesh].forEach(m => m?.geometry?.dispose());
      [strapMaterial, cardMaterial, backMaterial, edgeMaterial, metalMaterial].forEach(m => m.dispose());
      [frontTexture, backTexture, strapTexture].forEach(t => t?.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} className={`lanyard ${className}`.trim()} style={style} />;
}
