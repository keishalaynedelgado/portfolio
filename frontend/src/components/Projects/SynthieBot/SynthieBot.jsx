import { useEffect, useRef } from "react";
import "./SynthieBot.css";

const SPEED = 62; // px/s

/**
 * Synthie's robot logo, walking, for the Synthie card. It strolls along the top
 * edge of the screenshot frame, stops to look around, sometimes waves, and when
 * clicked it hops and reminds you it won't share passwords (Synthie's guardrails).
 * The walk runs on requestAnimationFrame only while the frame is on screen.
 * With reduced motion it stands still (the click bubble still works).
 */
export default function SynthieBot() {
  const rootRef = useRef(null);
  const walkerRef = useRef(null);
  const timers = useRef([]);
  const hopRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const walker = walkerRef.current;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("is-calm");
      return () => timers.current.forEach(clearTimeout);
    }

    const s = { x: 0, target: 0, dir: 1, mode: "idle", until: 0, started: false };
    let frame = 0;
    let last = 0;
    let onScreen = false;

    const span = () => Math.max(0, root.clientWidth - walker.offsetWidth);

    const setMode = (mode, now, ms) => {
      s.mode = mode;
      s.until = now + ms;
      root.classList.toggle("is-walking", mode === "walk");
      root.classList.toggle("is-waving", mode === "wave");
    };

    const startWalk = (now) => {
      const max = span();
      let t = s.x;
      for (let i = 0; i < 8 && Math.abs(t - s.x) < max * 0.3; i++) t = Math.random() * max;
      s.target = t;
      s.dir = t >= s.x ? 1 : -1;
      root.classList.toggle("is-left", s.dir < 0);
      setMode("walk", now, Infinity);
    };

    const tick = (now) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      if (!s.started) {
        s.started = true;
        s.x = span() * 0.12;
        setMode("idle", now, 700);
      }
      if (s.mode === "walk") {
        const step = SPEED * dt * s.dir;
        if (Math.abs(s.target - s.x) <= Math.abs(step)) {
          s.x = s.target;
          // Arrived: look around for a moment, or wave now and then.
          if (Math.random() < 0.35) setMode("wave", now, 1600);
          else setMode("idle", now, 900 + Math.random() * 1600);
        } else {
          s.x += step;
        }
      } else if (now > s.until) {
        startWalk(now);
      }
      s.x = Math.min(s.x, span());
      walker.style.transform = `translate3d(${s.x.toFixed(1)}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || !onScreen || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(root);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    hopRef.current = () => {
      // Pause the stroll while it hops and talks.
      s.mode = "talk";
      s.until = performance.now() + 2200;
      root.classList.remove("is-walking", "is-waving");
    };

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const boop = () => {
    const root = rootRef.current;
    hopRef.current?.();
    // Speak towards the side with more room.
    const w = walkerRef.current.getBoundingClientRect();
    const r = root.getBoundingClientRect();
    root.classList.toggle("bubble-left", w.left + w.width / 2 > r.left + r.width * 0.55);
    root.classList.remove("is-hopping", "is-talking");
    void root.offsetWidth; // restart the hop on repeated clicks
    root.classList.add("is-hopping", "is-talking");
    timers.current.push(setTimeout(() => root.classList.remove("is-hopping"), 650));
    timers.current.push(setTimeout(() => root.classList.remove("is-talking"), 2200));
  };

  return (
    <div ref={rootRef} className="synthie-bot">
      <div ref={walkerRef} className="synthie-bot__walker">
        <span className="synthie-bot__bubble" aria-hidden="true">
          No passwords here! 🔒
        </span>
        <button
          type="button"
          className="synthie-bot__body"
          onClick={boop}
          aria-label="Boop the Synthie robot"
          data-cursor="Boop"
        >
          <span className="synthie-bot__orient">
            <svg viewBox="0 0 120 142" aria-hidden="true">
              <defs>
                <linearGradient id="sb-tile" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#547792" />
                  <stop offset="1" stopColor="#213448" />
                </linearGradient>
              </defs>

              {/* legs + sneakers */}
              <g className="sb-leg sb-leg--l">
                <path d="M44 108 L44 128" stroke="#94B4C1" strokeWidth="6" strokeLinecap="round" />
                <ellipse cx="42" cy="132" rx="10" ry="5.5" fill="#182736" />
                <path d="M33 134 H51" stroke="#EAE0CF" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
              </g>
              <g className="sb-leg sb-leg--r">
                <path d="M76 108 L76 128" stroke="#94B4C1" strokeWidth="6" strokeLinecap="round" />
                <ellipse cx="78" cy="132" rx="10" ry="5.5" fill="#182736" />
                <path d="M69 134 H87" stroke="#EAE0CF" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
              </g>

              <g className="sb-bob">
                {/* arms */}
                <g className="sb-arm sb-arm--l">
                  <path d="M17 72 Q7 82 6 94" stroke="#94B4C1" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <circle cx="6" cy="96" r="4.5" fill="#EAE0CF" stroke="#213448" strokeWidth="2" />
                </g>
                <g className="sb-arm sb-arm--r">
                  <path d="M103 72 Q113 82 114 94" stroke="#94B4C1" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <circle cx="114" cy="96" r="4.5" fill="#EAE0CF" stroke="#213448" strokeWidth="2" />
                </g>

                {/* the Synthie logo tile, with a soft gloss */}
                <rect x="14" y="22" width="92" height="90" rx="22" fill="url(#sb-tile)" stroke="#16263a" strokeWidth="3" />
                <rect x="20" y="27" width="80" height="30" rx="15" fill="#fff" opacity="0.1" />
                <path d="M30 104 Q60 110 90 104" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.15" />

                {/* the robot from the logo (Material "smart_toy"), face drawn on top so it can blink and talk */}
                <path
                  transform="translate(28 34) scale(2.667)"
                  fill="#EAE0CF"
                  d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3z"
                />
                <g className="sb-eyes">
                  <circle cx="52" cy="64.7" r="4" fill="#213448" />
                  <circle cx="68" cy="64.7" r="4" fill="#213448" />
                  <circle cx="53.3" cy="63.3" r="1.3" fill="#fff" opacity="0.85" />
                  <circle cx="69.3" cy="63.3" r="1.3" fill="#fff" opacity="0.85" />
                </g>
                <path
                  className="sb-mouth"
                  d="M49 74 H71 Q71 74 71 76.5 Q71 79.5 68.5 79.5 H51.5 Q49 79.5 49 76.5 Q49 74 49 74 Z"
                  fill="#213448"
                />
              </g>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
