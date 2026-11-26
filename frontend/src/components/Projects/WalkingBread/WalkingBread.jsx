import { useEffect, useRef } from "react";
import "./WalkingBread.css";

const SPEED = 62; // px/s

/**
 * A little walking slice of bread for the Synthie card. It strolls along the top
 * edge of the screenshot frame, stops to look around, sometimes waves, and when
 * clicked it hops and reminds you it won't share passwords (Synthie's guardrails).
 * The walk runs on requestAnimationFrame only while the frame is on screen.
 * With reduced motion it stands still (the click bubble still works).
 */
export default function WalkingBread() {
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
    <div ref={rootRef} className="walking-bread">
      <div ref={walkerRef} className="walking-bread__walker">
        <span className="walking-bread__bubble" aria-hidden="true">
          No passwords here! 🔒
        </span>
        <button
          type="button"
          className="walking-bread__body"
          onClick={boop}
          aria-label="Boop the Synthie bread"
          data-cursor="Boop"
        >
          <span className="walking-bread__orient">
            <svg viewBox="0 0 120 142" aria-hidden="true">
              {/* legs + sneakers */}
              <g className="wb-leg wb-leg--l">
                <path d="M47 118 L46 132" stroke="#7a4a1d" strokeWidth="5" strokeLinecap="round" />
                <ellipse cx="44" cy="135" rx="9" ry="5" fill="#213448" />
                <ellipse cx="41" cy="133.5" rx="3" ry="1.4" fill="#fff" opacity="0.5" />
              </g>
              <g className="wb-leg wb-leg--r">
                <path d="M73 118 L74 132" stroke="#7a4a1d" strokeWidth="5" strokeLinecap="round" />
                <ellipse cx="76" cy="135" rx="9" ry="5" fill="#213448" />
                <ellipse cx="73" cy="133.5" rx="3" ry="1.4" fill="#fff" opacity="0.5" />
              </g>

              <g className="wb-bob">
                {/* arms */}
                <g className="wb-arm wb-arm--l">
                  <path d="M25 80 Q15 88 13 98" stroke="#b9772f" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <circle cx="13" cy="99" r="4.5" fill="#f3cf8e" stroke="#7a4a1d" strokeWidth="2" />
                </g>
                <g className="wb-arm wb-arm--r">
                  <path d="M95 80 Q105 88 107 98" stroke="#b9772f" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <circle cx="107" cy="99" r="4.5" fill="#f3cf8e" stroke="#7a4a1d" strokeWidth="2" />
                </g>

                {/* the slice: crust, crumb, toasty highlight */}
                <path
                  d="M24 58 C8 54 6 28 20 18 C32 8 50 10 60 16 C70 10 88 8 100 18 C114 28 112 54 96 58 L96 110 Q96 122 84 122 L36 122 Q24 122 24 110 Z"
                  fill="#c98a3f"
                  stroke="#7a4a1d"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <path
                  d="M31 60 C18 56 17 34 27 26 C37 18 50 19 60 26 C70 19 83 18 93 26 C103 34 102 56 89 60 L89 108 Q89 115 82 115 L38 115 Q31 115 31 108 Z"
                  fill="#f6d79c"
                />
                <ellipse cx="50" cy="40" rx="14" ry="7" fill="#fff6dc" opacity="0.7" transform="rotate(-12 50 40)" />
                <circle cx="78" cy="102" r="1.6" fill="#d9a961" />
                <circle cx="44" cy="106" r="1.3" fill="#d9a961" />
                <circle cx="70" cy="48" r="1.4" fill="#d9a961" />

                {/* face */}
                <g className="wb-eyes">
                  <ellipse cx="48" cy="74" rx="4" ry="5.5" fill="#3a2412" />
                  <ellipse cx="72" cy="74" rx="4" ry="5.5" fill="#3a2412" />
                  <circle cx="49.4" cy="72" r="1.5" fill="#fff" />
                  <circle cx="73.4" cy="72" r="1.5" fill="#fff" />
                </g>
                <ellipse cx="39" cy="86" rx="6" ry="3.5" fill="#ff8fa0" opacity="0.55" />
                <ellipse cx="81" cy="86" rx="6" ry="3.5" fill="#ff8fa0" opacity="0.55" />
                <path className="wb-mouth" d="M53 85 Q60 92 67 85" stroke="#3a2412" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
