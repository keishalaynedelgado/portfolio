import { useEffect, useMemo, useRef, useState } from "react";
import { profile } from "../../data/profile";
// The dragon, drawn in code (pearl-white with golden wings); its wings, legs,
// tail and jaw are separate groups so CSS can animate them.
import dragonMarkup from "./dragon-white.svg?raw";
// (the real-3D dragon, ./Dragon3D.js, is loaded on demand; the drawing above is its fallback)
import "./Intro.css";

// dragon-white.svg is 1301 x 729; its mouth is at about (81%, 32.5%) of it.
const DRAGON_RATIO = 729 / 1301;
const MOUTH = { x: 0.81, y: 0.325 };

const SNIPPETS = ["</>", "{ }", "npm run", "git push", "() =>", "SELECT *", "<div>", "await", "[ ]", "200 OK", "const", "#!", "fn()", "=>", "</>", "import"];
const TILE_COLORS = ["#213448", "#2a4466", "var(--blue-deep)", "var(--blue)", "#2f4f7a"];

// Scenes, as shares of the intro's scroll.
const SCENES = {
  start: [0, 0.08],
  takeoff: [0.08, 0.28],
  ram: [0.28, 0.48], // the dragon charges and smashes the wall
  through: [0.48, 0.66],
  badge: [0.66, 0.84],
  clouds: [0.84, 1],
};

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const local = (p, [a, b]) => clamp((p - a) / (b - a));
// Small seeded random, so the wall breaks the same way every visit.
const rand = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll-story entrance before the hero: press start, a big 3D dragon takes
 * off, charges and smashes head-first through a wall of code tiles, the camera flies through
 * the hole, Keisha's name badge drops in on a lanyard, and clouds roll in and
 * hand off to the hero. Scrolling drives every frame (and scrolling back
 * rewinds it). "Scroll to start" plays it automatically; "Skip intro" jumps to
 * the hero. Not shown at all with reduced motion.
 *
 * While the intro is showing, <html> has "intro-active" so the hero's own
 * entrance animations (and ui/Scramble) wait until the clouds clear.
 */
export default function Intro() {
  const [enabled] = useState(() => !reducedMotion());
  const [layout, setLayout] = useState({ cols: 9, rows: 8 });
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const startRef = useRef(null);
  const capRef = useRef(null);
  const dragonRef = useRef(null);
  const impactRef = useRef(null);
  const wallRef = useRef(null);
  const tilesRef = useRef([]);
  const badgeRef = useRef(null);
  const cloudsRef = useRef([]);
  const autoplay = useRef(0);
  const dragon3dHost = useRef(null);
  const dragon3d = useRef(null);

  // The tile wall: square tiles filling the right part of the screen, with a
  // ragged hole around its middle that the dragon smashes open.
  const tiles = useMemo(() => {
    const { cols, rows } = layout;
    const hc = (cols - 1) * 0.46;
    const hr = (rows - 1) * 0.46;
    const out = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const d = Math.hypot((c - hc) / (cols * 0.24), (r - hr) / (rows * 0.26)) + (rand(i) - 0.5) * 0.35;
        out.push({
          i,
          hole: d < 1,
          edge: d >= 1 && d < 1.35,
          text: SNIPPETS[(i * 7) % SNIPPETS.length],
          color: TILE_COLORS[Math.floor(rand(i + 99) * TILE_COLORS.length)],
          dx: (c - hc) * 60 + (rand(i + 7) - 0.5) * 160,
          dy: (r - hr) * 40 - 80 - rand(i + 3) * 120,
          spin: (rand(i + 5) - 0.5) * 720,
        });
      }
    }
    return out;
  }, [layout]);

  // The 3D dragon: Three.js loads in the background; once it is ready the
  // stage gets "has-3d" and the drawn fallback hides.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    import("./Dragon3D").then(({ default: Dragon3D, webglAvailable }) => {
      if (cancelled || !webglAvailable() || !dragon3dHost.current) return;
      dragon3d.current = new Dragon3D(dragon3dHost.current);
      stageRef.current?.classList.add("has-3d");
    }).catch(() => {
      /* no 3D: keep the drawing */
    });
    return () => {
      cancelled = true;
      dragon3d.current?.dispose();
      dragon3d.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const root = document.documentElement;
    let frame = 0;
    let handedOff = false;

    const fit = () => {
      const narrow = window.innerWidth < 700;
      const cols = narrow ? 5 : 9;
      const wallW = window.innerWidth * (narrow ? 0.78 : 0.6);
      const tile = wallW / cols;
      const rows = Math.ceil(window.innerHeight / tile) + 1;
      setLayout((l) => (l.cols === cols && l.rows === rows ? l : { cols, rows }));
    };

    const progress = () => {
      const r = section.getBoundingClientRect();
      const span = section.offsetHeight - window.innerHeight;
      return span > 0 ? clamp(-r.top / span) : 1;
    };

    // The story glides toward the scroll position instead of jumping with each
    // wheel step: `shown` eases after the real progress every frame.
    let shown = progress();
    let last = performance.now();

    const render = () => {
      frame = 0;
      const target = progress();
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // Big jumps (skip, nav links) snap instead of replaying the story.
      if (Math.abs(target - shown) > 0.3) shown = target;
      else shown += (target - shown) * (1 - Math.exp(-dt / 0.12));
      if (Math.abs(target - shown) < 0.0003) shown = target;
      else frame = requestAnimationFrame(render);
      const p = shown;
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const narrow = W < 700;

      // Hand off to the hero as the clouds clear (once).
      if (!handedOff && target >= 0.92) {
        handedOff = true;
        root.classList.remove("intro-active");
      }

      const sStart = local(p, [0.01, SCENES.start[1]]);
      const sTake = local(p, SCENES.takeoff);
      const sRam = local(p, SCENES.ram);
      const sThrough = local(p, SCENES.through);
      const sBadge = local(p, SCENES.badge);
      const sClouds = local(p, SCENES.clouds);

      // ---- Start button: pressed, then the camera pulls back from it
      const press = clamp(sStart * 1.4) - clamp((sTake - 0.15) * 3);
      capRef.current.style.transform = `translateY(${(clamp(press) * 14).toFixed(1)}px)`;
      const away = ease(clamp(sTake * 1.3));
      startRef.current.style.transform = `translate(-50%, ${(away * H * 0.25).toFixed(1)}px) scale(${(1 - away * 0.45).toFixed(3)})`;
      startRef.current.style.opacity = (1 - clamp((sTake - 0.15) * 3.5)).toFixed(3);

      // ---- Wall: slides in, gets blasted open, then the camera flies through the hole
      const wallLeft = W * (narrow ? 0.24 : 0.42);
      const wallW = W - wallLeft;
      const tile = (W * (narrow ? 0.78 : 0.6)) / layout.cols;
      const holeX = wallLeft + tile * ((layout.cols - 1) * 0.46 + 0.5);
      const holeY = tile * ((layout.rows - 1) * 0.46 + 0.5) - (layout.rows * tile - H) / 2;
      const slide = 1 - easeOut(clamp((sTake - 0.25) / 0.75));
      const zoom = ease(sThrough);
      const wall = wallRef.current;
      wall.style.left = `${wallLeft.toFixed(1)}px`;
      wall.style.width = `${(wallW + tile).toFixed(1)}px`;
      wall.style.top = `${((H - layout.rows * tile) / 2).toFixed(1)}px`;
      wall.style.transformOrigin = `${(holeX - wallLeft).toFixed(1)}px ${(holeY - (H - layout.rows * tile) / 2).toFixed(1)}px`;
      wall.style.transform = `translateX(${(slide * W * 0.75).toFixed(1)}px) scale(${(1 + zoom * zoom * 7).toFixed(3)})`;
      wall.style.opacity = (1 - clamp((sThrough - 0.6) * 2.5)).toFixed(3);
      wall.style.visibility = p > SCENES.through[1] + 0.02 ? "hidden" : "visible";

      // The hit lands at IMPACT: a white flash, then the tiles burst away from it.
      const IMPACT = 0.45;
      const since = sRam - IMPACT;
      const flash = p < SCENES.ram[1] + 0.02 ? Math.max(0, 1 - Math.abs(since - 0.015) / 0.07) : 0;
      const heat = flash;
      const blast = clamp(since / 0.5);
      tiles.forEach((t) => {
        const el = tilesRef.current[t.i];
        if (!el) return;
        if (t.hole) {
          const b = easeOut(blast);
          // knocked away from the dragon (to the right), then falling
          el.style.transform = `translate(${(t.dx * b + 220 * b).toFixed(1)}px, ${(t.dy * b + 900 * blast * blast).toFixed(1)}px) rotate(${(t.spin * b).toFixed(1)}deg)`;
          el.style.opacity = (1 - clamp((blast - 0.5) * 2)).toFixed(3);
          el.style.setProperty("--heat", heat.toFixed(3));
        } else if (t.edge) {
          el.style.setProperty("--heat", (heat * 0.45).toFixed(3));
        }
      });

      // ---- Dragon: waits beside the button, takes off, winds up, charges the wall
      // head-first and smashes through it, bounces back, then flies off over it
      const dw = narrow ? W * 0.92 : Math.min(780, Math.max(380, W * 0.48));
      const dh = dw * DRAGON_RATIO;
      const perch = narrow ? { x: -dw * 0.12, y: H - dh * 0.95 } : { x: -dw * 0.08, y: H - dh * 1.0 };
      const hover = narrow ? { x: -dw * 0.3, y: H * 0.34 - dh / 2 } : { x: -dw * 0.2, y: H * 0.44 - dh / 2 };
      const exit = { x: W * 0.55, y: -dh * 1.6 };
      const d3 = dragon3d.current;
      const mouth = d3 ? d3.mouth : MOUTH;
      // head lands on the middle of the hole
      const impact = { x: holeX - dw * mouth.x + dw * 0.02, y: holeY - dh * mouth.y };
      const windup = { x: hover.x - dw * 0.12, y: lerp(hover.y, impact.y, 0.5) - H * 0.05 };
      const recoil = { x: impact.x - dw * 0.16, y: impact.y - H * 0.04 };
      let x;
      let y;
      let rot = 0;
      if (p < SCENES.takeoff[1]) {
        const t = ease(clamp(sTake / 0.8));
        x = lerp(perch.x, hover.x, t);
        y = lerp(perch.y, hover.y, t) - Math.sin(t * Math.PI) * H * 0.12;
        rot = Math.sin(t * Math.PI) * -12;
      } else if (p < SCENES.ram[1] + 0.04) {
        if (sRam < 0.3) {
          // wind-up: pull back and rear
          const t = ease(sRam / 0.3);
          x = lerp(hover.x, windup.x, t);
          y = lerp(hover.y, windup.y, t);
          rot = -10 * t;
        } else if (sRam < IMPACT) {
          // charge: faster and faster, head down
          const t = ((sRam - 0.3) / (IMPACT - 0.3)) ** 3;
          x = lerp(windup.x, impact.x, t);
          y = lerp(windup.y, impact.y, t);
          rot = lerp(-10, 8, t);
        } else {
          // bounce back from the hit
          const t = easeOut(clamp(since / 0.22));
          x = lerp(impact.x, recoil.x, t);
          y = lerp(impact.y, recoil.y, t);
          rot = lerp(8, -4, t);
        }
      } else if (p < SCENES.badge[0]) {
        const t = ease(clamp((p - SCENES.ram[1] - 0.04) / 0.12));
        x = lerp(recoil.x, exit.x, t);
        y = lerp(recoil.y, exit.y, t);
        rot = -28 * t;
      }
      let scale = 1;
      if (p >= SCENES.badge[0]) {
        // Grand entrance: sweeps in from the lower left on one long smooth curve,
        // banking with the path, and glides to rest beside the name badge.
        const t = ease(clamp((p - SCENES.badge[0]) / 0.17));
        const endScale = narrow ? 0.55 : 0.72;
        const cardHalf = Math.min(135, Math.max(110, W * 0.105));
        const end = narrow
          ? { x: W * 0.5, y: H * 0.8 }
          : { x: W / 2 - cardHalf - (dw * endScale) / 2 - 12, y: H * 0.36 };
        const path = narrow
          ? [{ x: -dw * 0.6, y: H * 0.95 }, { x: W * 0.05, y: H * 0.5 }, { x: W * 0.3, y: H * 0.98 }, end]
          : [{ x: -dw * 0.6, y: H * 0.9 }, { x: W * 0.02, y: H * 0.08 }, { x: end.x - W * 0.14, y: end.y - H * 0.2 }, end];
        const [a, b, c2, d] = path;
        const u = 1 - t;
        const cx = u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c2.x + t ** 3 * d.x;
        const cy = u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c2.y + t ** 3 * d.y;
        const tx = 3 * u * u * (b.x - a.x) + 6 * u * t * (c2.x - b.x) + 3 * t * t * (d.x - c2.x);
        const ty = 3 * u * u * (b.y - a.y) + 6 * u * t * (c2.y - b.y) + 3 * t * t * (d.y - c2.y);
        const bank = clamp((Math.atan2(ty, Math.max(1, tx)) * 180) / Math.PI, -32, 32);
        rot = bank * (1 - t * t) - 3 * t;
        scale = lerp(0.6, endScale, t);
        x = cx - dw / 2;
        y = cy - dh / 2;
      }
      const dragon = dragonRef.current;
      dragon.style.width = `${dw.toFixed(1)}px`;
      dragon.style.height = `${dh.toFixed(1)}px`;
      dragon.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

      // ---- Roar while charging (jaw open), flash and shake on impact
      const roaring = sRam > 0.22 && sRam < 0.62 && p < SCENES.ram[1];
      stage.classList.toggle("is-firing", roaring);
      d3?.setFiring(roaring);
      d3?.setActive(target < 0.999);
      const imp = impactRef.current;
      imp.style.left = `${holeX.toFixed(1)}px`;
      imp.style.top = `${holeY.toFixed(1)}px`;
      imp.style.opacity = flash.toFixed(3);
      imp.style.transform = `translate(-50%, -50%) scale(${(0.4 + clamp(since / 0.12) * 1.2).toFixed(3)})`;
      const shakeAmt = since > 0 && since < 0.16 && p < SCENES.ram[1] + 0.02 ? (1 - since / 0.16) * (narrow ? 7 : 14) : 0;
      stage.style.transform = shakeAmt
        ? `translate(${(Math.sin(since * 950) * shakeAmt).toFixed(1)}px, ${(Math.cos(since * 730) * shakeAmt * 0.6).toFixed(1)}px)`
        : "";

      // ---- Name badge: drops in on its lanyard and swings to rest
      const drop = clamp(sBadge / 0.45);
      const swing = sBadge > 0 ? Math.sin(sBadge * Math.PI * 5) * 16 * (1 - sBadge) ** 1.5 : 0;
      const badge = badgeRef.current;
      badge.style.transform = `translate(-50%, ${((1 - easeOut(drop)) * -H * 1.1).toFixed(1)}px) rotate(${swing.toFixed(2)}deg)`;
      badge.style.visibility = p < SCENES.badge[0] - 0.01 ? "hidden" : "visible";

      // ---- Clouds: roll up from the bottom until they cover everything
      const c = ease(sClouds);
      cloudsRef.current.forEach((el, i) => {
        if (!el) return;
        // They stop with their tops in the lower half, so the badge still peeks over
        // them and the cloud bank flows straight into the hero below.
        const from = H * (1.02 + i * 0.08);
        const to = H * (0.3 + i * 0.1);
        el.style.transform = `translateY(${lerp(from, to, c).toFixed(1)}px)`;
      });

      // The hint fades as soon as the story starts.
      stage.style.setProperty("--hint", (1 - clamp(p / 0.03)).toFixed(3));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    // Deep links (/#work, /#contact…): the browser looked for the anchor before
    // React drew the page, so jump to it now that it exists.
    if (window.location.hash) {
      try {
        document.querySelector(decodeURIComponent(window.location.hash))?.scrollIntoView({ behavior: "instant" });
      } catch {
        /* not a valid selector: stay put */
      }
    }

    // Hold the hero's entrance until the clouds clear, unless we start past the intro.
    if (progress() < 0.92) root.classList.add("intro-active");
    else {
      handedOff = true;
      root.classList.remove("intro-active");
    }

    fit();
    render();
    window.addEventListener("scroll", schedule, { passive: true });
    const onResize = () => {
      fit();
      schedule();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(autoplay.current);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      root.classList.remove("intro-active");
    };
  }, [enabled, tiles, layout]);

  if (!enabled) return null;

  const heroTop = () => {
    const s = sectionRef.current;
    return s.offsetTop + s.offsetHeight;
  };

  // "Scroll to start": play the whole story by scrolling for the visitor.
  // Any wheel, touch or key from them takes over again.
  const play = () => {
    cancelAnimationFrame(autoplay.current);
    const from = window.scrollY;
    const to = heroTop();
    const ms = 5200 * Math.max(0.25, (to - from) / Math.max(1, to - sectionRef.current.offsetTop));
    const t0 = performance.now();
    // This click's own mousedown/keydown have already fired, so listening now is safe.
    const stopEvents = ["wheel", "touchstart", "keydown", "mousedown"];
    const stop = () => {
      cancelAnimationFrame(autoplay.current);
      stopEvents.forEach((e) => window.removeEventListener(e, stop));
    };
    stopEvents.forEach((e) => window.addEventListener(e, stop, { passive: true }));
    const step = (now) => {
      const t = clamp((now - t0) / ms);
      window.scrollTo({ top: from + (to - from) * ease(t), behavior: "instant" });
      if (t < 1) autoplay.current = requestAnimationFrame(step);
      else stop();
    };
    autoplay.current = requestAnimationFrame(step);
  };

  const skip = (e) => {
    e.preventDefault();
    cancelAnimationFrame(autoplay.current);
    window.scrollTo({ top: heroTop(), behavior: "instant" });
  };

  return (
    <section ref={sectionRef} className="intro" aria-label="Intro">
      <div ref={stageRef} className="intro__stage">
        {/* Code-tile wall */}
        <div ref={wallRef} className="intro__wall" style={{ "--cols": layout.cols }} aria-hidden="true">
          {tiles.map((t) => (
            <span
              key={t.i}
              ref={(el) => (tilesRef.current[t.i] = el)}
              className={`intro__tile${t.hole ? " is-hole" : ""}${t.edge ? " is-edge" : ""}`}
              style={{ "--tile": t.color }}
            >
              <span className="intro__tile-code">{t.text}</span>
            </span>
          ))}
        </div>

        {/* White flash where the dragon hits the wall */}
        <div ref={impactRef} className="intro__impact" aria-hidden="true" />

        {/* Start: the big button */}
        <div ref={startRef} className="intro__start">
          <p className="intro__kicker mono">
            {profile.name} · Portfolio
          </p>
          <p className="intro__title">
            Ready to <em className="serif">break in?</em>
          </p>
          <button type="button" className="intro__button" onClick={play} aria-label="Play the intro">
            <span ref={capRef} className="intro__cap" aria-hidden="true" />
            <span className="intro__base" aria-hidden="true">
              <span className="intro__base-label mono">Start</span>
            </span>
          </button>
          <p className="intro__hint mono" aria-hidden="true">
            Scroll to start <span className="intro__arrow">↓</span>
          </p>
        </div>

        {/* The dragon: big, pearl-white, drawn in code */}
        <div ref={dragonRef} className="intro__dragon" aria-hidden="true">
          <div className="intro__dragon-rig">
            <span className="intro__dragon-art" dangerouslySetInnerHTML={{ __html: dragonMarkup }} />
            <div ref={dragon3dHost} className="intro__dragon-3d" />
          </div>
        </div>

        {/* Name badge on a lanyard */}
        <div ref={badgeRef} className="intro__badge" aria-hidden="true">
          <span className="intro__lanyard" />
          <span className="intro__clip" />
          <div className="intro__card">
            <div className="intro__card-head mono">
              <span>Portfolio pass</span>
              <span>Vol. 01</span>
            </div>
            <div className="intro__photo">
              <img src="/intro/keisha.webp" alt="" width="360" height="360" decoding="async" />
            </div>
            <p className="intro__card-name">{profile.name}</p>
            <p className="intro__card-role">{profile.title}</p>
            <p className="intro__card-uni mono">{profile.universityShort}</p>
            <div className="intro__card-foot">
              <span className="intro__barcode" />
              <span className="mono">Access: all sections</span>
            </div>
          </div>
        </div>

        {/* Clouds that hand off to the hero */}
        {CLOUD_LAYERS.map((layer, i) => (
          <div key={i} ref={(el) => (cloudsRef.current[i] = el)} className={`intro__clouds intro__clouds--${i}`} aria-hidden="true">
            <svg viewBox="0 -200 1440 620" preserveAspectRatio="xMidYMax slice">
              <defs>
                {/* lit as one mass: bright tops, soft shaded undersides */}
                <linearGradient id={`cl${i}-light`} gradientUnits="userSpaceOnUse" x1="0" y1={layer.top} x2="0" y2={layer.fogY + 90}>
                  <stop offset="0" stopColor={layer.light} />
                  <stop offset="0.45" stopColor={layer.mid} />
                  <stop offset="0.8" stopColor={layer.shade} />
                  <stop offset="1" stopColor={layer.body} />
                </linearGradient>
                <filter id={`cl${i}-fx`} x="-10%" y="-60%" width="120%" height="220%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed={i + 3} result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale={layer.wisp} xChannelSelector="R" yChannelSelector="G" result="wisp" />
                  <feGaussianBlur in="wisp" stdDeviation={layer.blur} result="body" />
                  <feGaussianBlur in="wisp" stdDeviation={layer.blur * 5 + 6} result="haze" />
                  <feMerge>
                    <feMergeNode in="haze" />
                    <feMergeNode in="body" />
                  </feMerge>
                </filter>
              </defs>
              <g filter={`url(#cl${i}-fx)`} fill={`url(#cl${i}-light)`}>
                {layer.puffs.map((c, k) => (
                  <circle key={k} cx={c.x} cy={c.y} r={c.r} />
                ))}
                <rect x="-60" y={layer.fogY} width="1560" height={480 - layer.fogY} fill={layer.body} />
              </g>
            </svg>
            <div className="intro__clouds-body" style={{ background: layer.body }} />
          </div>
        ))}

        <a href="#top" className="intro__skip mono" onClick={skip}>
          Skip intro →
        </a>
      </div>
    </section>
  );
}

// Cloud layers, back to front. Each is a cumulus bank: big billows along the
// bottom, then many small puffs traced along their top edge so the outline is
// lumpy like a real cloud, all lit as one mass (bright top, shaded underside)
// with noise-warped wispy edges and a soft haze. The far layers are cooler and
// softer; the front one ends in the paper colour so it flows into the hero.
const cloudLayer = (seed, { count, rMin, rMax, baseY, light, mid, shade, body, wisp, blur }) => {
  const big = [];
  const step = 1440 / count;
  for (let i = -1; i <= count; i++) {
    const r = rMin + rand(seed + i) * (rMax - rMin);
    big.push({ x: i * step + (rand(seed + i + 40) - 0.5) * step * 0.5, y: baseY - r * 0.3 + rand(seed + i + 80) * 24, r });
  }
  // top edge of the billows at x
  const topAt = (x) => Math.min(...big.map((c) => (Math.abs(x - c.x) < c.r ? c.y - Math.sqrt(c.r * c.r - (x - c.x) ** 2) : Infinity)));
  const small = [];
  for (let x = -20, k = 0; x <= 1460; k++) {
    const r = 16 + rand(seed + k + 300) * 30;
    const y = topAt(x);
    if (Number.isFinite(y)) small.push({ x, y: y + r * (0.35 + rand(seed + k + 340) * 0.3), r });
    x += r * (0.9 + rand(seed + k + 380) * 0.5);
  }
  const puffs = [...big, ...small].map((c) => ({ x: Math.round(c.x), y: Math.round(c.y), r: Math.round(c.r) }));
  const top = Math.min(...puffs.map((c) => c.y - c.r));
  // the solid base starts high enough to fill every gap under the billows
  return { puffs, top, fogY: baseY - 40, light, mid, shade, body, wisp, blur };
};
const CLOUD_LAYERS = [
  cloudLayer(11, { count: 6, rMin: 110, rMax: 175, baseY: 300, light: "#fbfaff", mid: "#e2e0f1", shade: "#bdbad9", body: "#d9d8ea", wisp: 38, blur: 3.2 }),
  cloudLayer(23, { count: 8, rMin: 95, rMax: 160, baseY: 312, light: "#ffffff", mid: "#eeecf5", shade: "#cbc7df", body: "#e6e4ef", wisp: 34, blur: 2.2 }),
  cloudLayer(37, { count: 7, rMin: 100, rMax: 165, baseY: 322, light: "#ffffff", mid: "#f7f5f0", shade: "#dcd7cc", body: "#efece3", wisp: 30, blur: 1.4 }),
];
