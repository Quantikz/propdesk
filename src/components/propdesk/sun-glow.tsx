import { useEffect, useRef } from "react";
import * as THREE from "three";

function glowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.55)");
  g.addColorStop(0.45, "rgba(255,255,255,0.16)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function SunGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 2;

    const tex = glowTexture();
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0x7d9e78, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xc47a72, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 }));
    const wash = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xefe6d4, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.22 }));
    core.scale.set(0.7, 0.7, 1);
    halo.scale.set(1.35, 1.35, 1);
    wash.scale.set(1.9, 1.9, 1);
    scene.add(wash, halo, core);

    function size() {
      const w = host.clientWidth || 280;
      const h = host.clientHeight || 280;
      renderer.setSize(w, h, false);
    }
    size();

    let frame = 0;
    const clock = new THREE.Clock();
    function tick() {
      const t = clock.getElapsedTime();
      const mix = (Math.sin(t * 0.55) + 1) / 2;
      core.material.color.setRGB(0.49 + mix * 0.28, 0.62 - mix * 0.3, 0.47 - mix * 0.15);
      halo.material.color.setRGB(0.77 - mix * 0.28, 0.48 + mix * 0.14, 0.45 - mix * 0.1);
      core.material.opacity = 0.72 + Math.sin(t * 1.4) * 0.12;
      halo.material.opacity = 0.38 + Math.sin(t * 0.9) * 0.1;
      wash.material.opacity = 0.16 + mix * 0.08;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    }
    tick();

    const ro = new ResizeObserver(size);
    ro.observe(host);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      renderer.dispose();
      tex.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-no-scatter
      className="pointer-events-none fixed top-0 right-0 z-30 h-72 w-72"
    />
  );
}
