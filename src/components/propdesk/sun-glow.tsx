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
  g.addColorStop(0.2, "rgba(255,255,255,0.45)");
  g.addColorStop(0.5, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type Ant = { x: number; y: number; a: number; s: number; w: number };
type Mark = { x: number; y: number; w: number };

function pickWord(): Mark | null {
  const hits: Mark[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && !parent.closest("[data-no-scatter], script, style, canvas, svg")) {
      const text = node.textContent || "";
      const re = /\S{3,}/g;
      let match: RegExpExecArray | null;
      while ((match = re.exec(text))) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const rect = range.getBoundingClientRect();
        if (rect.width > 8 && rect.top > 36 && rect.bottom < window.innerHeight - 12) {
          hits.push({ x: rect.left, y: rect.bottom, w: rect.width });
        }
      }
    }
    node = walker.nextNode();
  }
  return hits.length ? hits[Math.floor(Math.random() * hits.length)] : null;
}

export function SunGlow() {
  const host = useRef<HTMLDivElement>(null);
  const bugs = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = host.current;
    const canvas = bugs.current;
    if (!root || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    root.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 2;
    const tex = glowTexture();
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0x7d9e78, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xc47a72, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 }));
    const wash = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xefe6d4, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.2 }));
    core.scale.set(0.55, 0.55, 1);
    halo.scale.set(1.1, 1.1, 1);
    wash.scale.set(1.7, 1.7, 1);
    scene.add(wash, halo, core);

    const ctx = canvas.getContext("2d");
    const ants: Ant[] = Array.from({ length: 9 }, () => ({
      x: Math.random(),
      y: Math.random(),
      a: Math.random() * Math.PI * 2,
      s: 0.012 + Math.random() * 0.018,
      w: Math.random() * Math.PI * 2,
    }));
    let mark = pickWord();

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      canvas.width = w;
      canvas.height = h;
    }
    resize();

    const clock = new THREE.Clock();
    let frame = 0;
    const wordTimer = window.setInterval(() => {
      mark = pickWord();
    }, 1000);

    function tick() {
      const t = clock.getElapsedTime();
      const mix = (Math.sin(t * 0.45) + 1) / 2;
      const gx = Math.sin(t * 0.11) * 0.55;
      const gy = Math.cos(t * 0.08) * 0.42;
      core.position.set(gx, gy, 0);
      halo.position.set(gx, gy, 0);
      wash.position.set(gx, gy, 0);
      core.material.color.setRGB(0.49 + mix * 0.28, 0.62 - mix * 0.3, 0.47 - mix * 0.15);
      halo.material.color.setRGB(0.77 - mix * 0.28, 0.48 + mix * 0.14, 0.45 - mix * 0.1);
      core.material.opacity = 0.62 + Math.sin(t * 1.2) * 0.1;
      halo.material.opacity = 0.32 + Math.sin(t * 0.8) * 0.08;
      wash.material.opacity = 0.12 + mix * 0.06;
      renderer.render(scene, camera);

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const ant of ants) {
          ant.w += 0.02;
          ant.a += Math.sin(ant.w) * 0.04;
          ant.x += Math.cos(ant.a) * ant.s * 0.004;
          ant.y += Math.sin(ant.a) * ant.s * 0.004;
          if (ant.x < 0.02 || ant.x > 0.98) ant.a = Math.PI - ant.a;
          if (ant.y < 0.04 || ant.y > 0.96) ant.a = -ant.a;
          const x = ant.x * canvas.width;
          const y = ant.y * canvas.height;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(ant.a);
          ctx.globalAlpha = 0.9;
          ctx.strokeStyle = "#050403";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-4, 0);
          ctx.lineTo(4, 0);
          ctx.stroke();
          ctx.fillStyle = "#050403";
          for (let i = -3; i <= 3; i += 2) {
            ctx.beginPath();
            ctx.arc(i, -1.4, 0.6, 0, Math.PI * 2);
            ctx.arc(i, 1.4, 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
        if (mark) {
          ctx.strokeStyle = "#c4473a";
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(mark.x, mark.y + 1);
          ctx.lineTo(mark.x + mark.w, mark.y + 1);
          ctx.stroke();
        }
      }
      frame = requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(wordTimer);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      tex.dispose();
      if (renderer.domElement.parentNode === root) root.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div aria-hidden data-no-scatter className="pointer-events-none fixed inset-0 z-30">
      <div ref={host} className="absolute inset-0" />
      <canvas ref={bugs} className="absolute inset-0" />
    </div>
  );
}
