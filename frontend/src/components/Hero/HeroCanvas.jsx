import { useEffect, useRef } from "react";

/**
 * Interactive "blueprint" dot grid behind the hero.
 * - Dots near the cursor are pushed away, grow, and turn blue.
 * - Clicking/tapping anywhere in the hero sends out a ripple.
 * - Only animates while something is moving; pauses when the hero is off-screen.
 * - Reduced motion: draws a static grid only.
 */
const SPACING = 28;
const RADIUS = 170; // cursor influence radius (px)
const PUSH = 16; // max displacement (px)

export default function HeroCanvas({ hostRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dots = [];
    let frame = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999, active: false };
    const ripples = [];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const cx = w * 0.68;
      const cy = h * 0.45;
      for (let y = SPACING / 2; y < h; y += SPACING) {
        for (let x = SPACING / 2; x < w; x += SPACING) {
          // Fade the grid towards the edges (like a soft radial mask)
          const nx = (x - cx) / (w * 0.62);
          const ny = (y - cy) / (h * 0.62);
          const fade = Math.max(0, 1 - Math.sqrt(nx * nx + ny * ny));
          if (fade <= 0.02) continue;
          dots.push({ x, y, ox: 0, oy: 0, glow: 0, fade });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const a = d.fade * (0.32 + d.glow * 0.6);
        const r = 1.1 + d.glow * 2.1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(74,112,169,${a})`;
        ctx.arc(d.x + d.ox, d.y + d.oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (now) => {
      frame = 0;
      let moving = false;
      // Age ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].t > 1400) ripples.splice(i, 1);
      }

      for (const d of dots) {
        let tx = 0;
        let ty = 0;
        let glow = 0;

        if (mouse.active) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS) {
            const f = 1 - dist / RADIUS;
            const ease = f * f;
            tx += (dx / (dist || 1)) * PUSH * ease;
            ty += (dy / (dist || 1)) * PUSH * ease;
            glow = Math.max(glow, f);
          }
        }

        for (const rp of ripples) {
          const age = (now - rp.t) / 1400;
          const ringR = age * 520;
          const dx = d.x - rp.x;
          const dy = d.y - rp.y;
          const dist = Math.hypot(dx, dy);
          const band = Math.exp(-((dist - ringR) ** 2) / (2 * 34 * 34)) * (1 - age);
          if (band > 0.01) {
            tx += (dx / (dist || 1)) * 22 * band;
            ty += (dy / (dist || 1)) * 22 * band;
            glow = Math.max(glow, band);
          }
        }

        d.ox += (tx - d.ox) * 0.16;
        d.oy += (ty - d.oy) * 0.16;
        d.glow += (glow - d.glow) * 0.14;
        if (Math.abs(tx - d.ox) > 0.05 || Math.abs(ty - d.oy) > 0.05 || Math.abs(glow - d.glow) > 0.01) moving = true;
      }
      draw();
      if ((moving || ripples.length) && visible) frame = requestAnimationFrame(step);
    };

    const kick = () => {
      if (!frame && visible && !calm) frame = requestAnimationFrame(step);
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = e.pointerType === "mouse";
      kick();
    };
    const onLeave = () => {
      mouse.active = false;
      kick();
    };
    const onDown = (e) => {
      if (e.target.closest("a, button")) return;
      const r = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
      kick();
    };

    build();
    draw();

    const ro = new ResizeObserver(() => {
      build();
      draw();
    });
    ro.observe(host);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(host);

    if (!calm) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointerdown", onDown);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    };
  }, [hostRef]);

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />;
}
