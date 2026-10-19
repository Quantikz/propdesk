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

    const lineMat = new THREE.LineBasicMaterial({ color: 0x161310, transparent: true, opacity: 0.55 });
    const body = new THREE.Line(new THREE.BufferGeometry(), lineMat);
    const legs = new THREE.LineSegments(new THREE.BufferGeometry(), lineMat);
    const trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0x161310, transparent: true, opacity: 0.28 }));
    const spider = new THREE.Group();
    spider.add(body, legs);
    spider.scale.set(0.32, 0.32, 0.32);
    scene.add(spider, trail);
    const from = new THREE.Vector3(0.2, -0.2, 0);
    const to = from.clone();
    const pos = from.clone();
    let lastTap = 0;
    let prey: { x: number; y: number; w: number } | null = null;
    let holdUntil = 0;

    function toNdc(x: number, y: number) {
      return new THREE.Vector3((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0);
    }

    function pickWord() {
      const hits: { x: number; y: number; w: number }[] = [];
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
      prey = hits.length ? hits[Math.floor(Math.random() * hits.length)] : null;
      from.copy(pos);
      to.copy(prey ? toNdc(prey.x + prey.w / 2, prey.y - 2) : new THREE.Vector3(Math.random() * 1.4 - 0.7, Math.random() * 1.4 - 0.7, 0));
    }

    function buildSpider(t: number) {
      const chassis: THREE.Vector3[] = [
        new THREE.Vector3(-0.03, -0.012, 0),
        new THREE.Vector3(0.02, -0.012, 0),
        new THREE.Vector3(0.028, 0, 0.004),
        new THREE.Vector3(0.02, 0.012, 0),
        new THREE.Vector3(-0.03, 0.012, 0),
        new THREE.Vector3(-0.036, 0, 0.004),
        new THREE.Vector3(-0.03, -0.012, 0),
      ];
      const head = new THREE.Vector3(0.04, 0, 0.006);
      body.geometry.dispose();
      body.geometry = new THREE.BufferGeometry().setFromPoints([...chassis, chassis[chassis.length - 1], head]);
      const legPts: THREE.Vector3[] = [];
      for (let i = 0; i < 8; i++) {
        const side = i < 4 ? 1 : -1;
        const n = i % 4;
        const step = Math.sin(t * 14 + n * 1.4) * 0.008;
        const hip = new THREE.Vector3(-0.02 + n * 0.012, side * 0.01, 0);
        const joint = new THREE.Vector3(-0.01 + n * 0.014, side * 0.028, 0.01);
        const foot = new THREE.Vector3(-0.018 + n * 0.016 + step, side * 0.046, -0.004);
        legPts.push(hip, joint, joint, foot);
      }
      legs.geometry.dispose();
      legs.geometry = new THREE.BufferGeometry().setFromPoints(legPts);
    }

    const ctx = canvas.getContext("2d");
    const ants: Ant[] = Array.from({ length: 9 }, () => ({
      x: Math.random(),
      y: Math.random(),
      a: Math.random() * Math.PI * 2,
      s: 0.012 + Math.random() * 0.018,
      w: Math.random() * Math.PI * 2,
    }));

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      canvas.width = w;
      canvas.height = h;
    }
    resize();

    function onPoint(e: PointerEvent) {
      lastTap = performance.now();
      prey = null;
      from.copy(pos);
      to.copy(toNdc(e.clientX, e.clientY));
    }
    window.addEventListener("pointerdown", onPoint);
    pickWord();

    const clock = new THREE.Clock();
    let frame = 0;
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
        if (prey && pos.distanceTo(to) < 0.012) {
          ctx.strokeStyle = "#c4473a";
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(prey.x, prey.y + 1);
          ctx.lineTo(prey.x + prey.w, prey.y + 1);
          ctx.stroke();
        }
      }
      if (performance.now() - lastTap > 1400 && pos.distanceTo(to) < 0.01) {
        if (!holdUntil) holdUntil = performance.now() + 700;
        if (performance.now() > holdUntil) {
          holdUntil = 0;
          pickWord();
        }
      }
      const tapping = lastTap && performance.now() - lastTap < 1400;
      const step = tapping ? 0.012 : 0.004;
      const gap = pos.distanceTo(to);
      if (gap <= step) pos.copy(to);
      else pos.add(to.clone().sub(pos).setLength(step));
      spider.position.copy(pos);
      spider.lookAt(to.x, to.y, 0.2);
      buildSpider(t);
      trail.geometry.dispose();
      trail.geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
      frame = requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPoint);
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
