import { useEffect, useRef } from "react";
import dragonMarkup from "./dragon.svg?raw";
import "./FireDragon.css";

const EMBERS = [0, 1, 2, 3, 4, 5, 6, 7];

const FIRE_MS = 1300; // how long one breath of fire lasts
const CRUISE = 230; // px/s while flying
const HOVER = 45; // px/s while breathing fire

/**
 * The K Games dragon (from the K Games project's own artwork) flying around the
 * K Games card. It wanders between random points inside the part of the card
 * that is on screen, turns to face where it's going, banks as it climbs and
 * dives, and every few seconds hovers to breathe fire. Click it to make it fire.
 *
 * The flight runs on requestAnimationFrame only while the card is on screen.
 * With reduced motion the dragon stays parked with a still flame.
 */
export default function FireDragon() {
  const areaRef = useRef(null);
  const flightRef = useRef(null);
  const orientRef = useRef(null);
  const stateRef = useRef(null);
  const burstTimer = useRef(0);

  useEffect(() => {
    const area = areaRef.current;
    const flight = flightRef.current;
    const orient = orientRef.current;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      area.classList.add("is-calm");
      return;
    }

    const s = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, face: 1, faceVal: 1, started: false, away: false, fireUntil: 0, nextFire: 0, lastCheck: 0 };
    stateRef.current = s;
    let frame = 0;
    let last = 0;
    let onScreen = false;

    // Where the dragon may fly: inside the card, limited to the part that's visible
    // below the navbar. `roomy` is false when too little of the card is on screen.
    const bounds = () => {
      const r = area.getBoundingClientRect();
      const d = flight.offsetWidth;
      const H = area.clientHeight;
      const navH = document.querySelector(".nav")?.offsetHeight ?? 72;
      const top = Math.max(-d * 0.2, navH + 8 - r.top);
      const bottom = Math.min(H, window.innerHeight - r.top);
      const minY = top;
      const maxY = Math.max(minY, Math.min(H - d, bottom - d * 0.95));
      return { d, H, minX: -d * 0.15, maxX: area.clientWidth - d * 0.85, minY, maxY, roomy: bottom - top >= d * 1.15 };
    };

    // Next waypoint: somewhere visible, and far enough away that it really travels.
    const pickTarget = () => {
      const b = bounds();
      for (let i = 0; i < 10; i++) {
        const x = b.minX + Math.random() * (b.maxX - b.minX);
        const y = b.minY + Math.random() * (b.maxY - b.minY);
        if (Math.hypot(x - s.x, y - s.y) > (b.maxX - b.minX) * 0.35 || i === 9) {
          s.tx = x;
          s.ty = y;
          return;
        }
      }
    };

    // Enter from the left or right edge, at the height of the visible area.
    const enter = (now) => {
      const b = bounds();
      const fromLeft = Math.random() < 0.6;
      s.x = fromLeft ? -b.d * 1.3 : b.maxX + b.d * 1.3;
      s.y = b.minY + (b.maxY - b.minY) * (0.15 + Math.random() * 0.3);
      s.vx = fromLeft ? CRUISE : -CRUISE;
      s.vy = 0;
      s.face = s.faceVal = fromLeft ? 1 : -1;
      s.nextFire = now + 1600;
      s.started = true;
      s.away = false;
      pickTarget();
      flight.style.opacity = "1";
    };

    const tick = (now) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      frame = requestAnimationFrame(tick);

      if (now - s.lastCheck > 300 || !s.started) {
        s.lastCheck = now;
        const b = bounds();
        if (!s.started) {
          // Waiting off stage: come in once enough of the card is on screen.
          if (!b.roomy) return;
          enter(now);
        } else if (!b.roomy) {
          // Too little of the card left on screen: fly off the nearest side.
          if (!s.away) {
            s.away = true;
            s.tx = s.x < b.maxX / 2 ? -b.d * 2 : b.maxX + b.d * 2;
            s.ty = Math.min(s.y, b.H - b.d);
          }
        } else if (s.away) {
          s.away = false;
          pickTarget();
        } else if (s.ty < b.minY - 10 || s.ty > b.maxY + 10 || s.tx > b.maxX + 10) {
          // Re-aim when the page scrolls and the waypoint is no longer on screen.
          pickTarget();
        }
      }

      // Fire schedule: hover and breathe fire every few seconds (not while leaving).
      let firing = now < s.fireUntil && !s.away;
      if (!firing && !s.away && now > s.nextFire) {
        s.fireUntil = now + FIRE_MS;
        s.nextFire = now + FIRE_MS + 2600 + Math.random() * 3200;
        firing = true;
      }
      area.classList.toggle("is-firing", firing);

      // Steer smoothly towards the waypoint.
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 40) {
        if (s.away) {
          // Off stage: hide and wait to fly back in.
          flight.style.opacity = "0";
          s.started = false;
          return;
        }
        pickTarget();
      }
      const speed = firing ? HOVER : CRUISE;
      const k = Math.min(1, dt * 2.2);
      s.vx += ((dx / dist) * speed - s.vx) * k;
      s.vy += ((dy / dist) * speed - s.vy) * k;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Face the direction of travel (not mid-breath), turning through a quick flip.
      if (!firing) {
        if (s.vx > 25) s.face = 1;
        else if (s.vx < -25) s.face = -1;
      }
      s.faceVal += (s.face - s.faceVal) * Math.min(1, dt * 9);
      const bank = Math.max(-14, Math.min(14, s.vy * 0.06));

      flight.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
      orient.style.transform = `scaleX(${s.faceVal.toFixed(3)}) rotate(${bank.toFixed(2)}deg)`;
    };

    const start = () => {
      if (frame || !onScreen || document.hidden) return;
      last = 0;
      // Coming back to a card whose dragon is far off screen: fly in again.
      if (s.started) {
        const b = bounds();
        if (s.y < b.minY - b.d * 2 || s.y > b.maxY + b.d * 2) {
          s.started = false;
          flight.style.opacity = "0";
        }
      }
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(area);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(burstTimer.current);
    };
  }, []);

  const breatheFire = () => {
    const area = areaRef.current;
    if (stateRef.current) stateRef.current.fireUntil = performance.now() + 1100;
    area.classList.remove("is-burst");
    void area.offsetWidth; // restart the burst animation on repeated clicks
    area.classList.add("is-burst");
    clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => area.classList.remove("is-burst"), 1100);
  };

  return (
    <div ref={areaRef} className="fire-dragon">
      <div ref={flightRef} className="fire-dragon__flight">
        <div ref={orientRef} className="fire-dragon__orient">
          <div className="fire-dragon__rig">
            <div className="fire-dragon__fire" aria-hidden="true">
              <svg viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="fd-outer" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#ffb347" />
                    <stop offset="0.55" stopColor="#ff7a2f" />
                    <stop offset="1" stopColor="#e8452a" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="fd-mid" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff1a8" />
                    <stop offset="0.6" stopColor="#ffd24a" />
                    <stop offset="1" stopColor="#ff9a2f" />
                  </linearGradient>
                  <filter id="fd-blur" x="-10%" y="-30%" width="120%" height="160%">
                    <feGaussianBlur stdDeviation="2.2" />
                  </filter>
                </defs>
                <path
                  className="fire-dragon__flame fire-dragon__flame--outer"
                  d="M0 52 C60 30 120 18 200 14 C250 12 300 4 340 18 C380 30 400 50 392 62 C400 76 378 98 340 104 C300 114 250 108 200 106 C120 102 60 88 0 68 Z"
                  fill="url(#fd-outer)"
                  filter="url(#fd-blur)"
                />
                <path
                  className="fire-dragon__flame fire-dragon__flame--mid"
                  d="M0 55 C70 40 140 32 220 30 C270 30 320 28 350 42 C372 52 372 70 350 80 C320 92 270 92 220 90 C140 88 70 80 0 65 Z"
                  fill="url(#fd-mid)"
                />
                <path
                  className="fire-dragon__flame fire-dragon__flame--core"
                  d="M0 57 C80 50 160 46 240 48 C280 49 310 52 320 60 C310 68 280 72 240 72 C160 74 80 70 0 63 Z"
                  fill="#fffbe6"
                />
              </svg>
              {EMBERS.map((i) => (
                <i key={i} className="fire-dragon__ember" style={{ "--e": i }} />
              ))}
            </div>

            <button
              type="button"
              className="fire-dragon__body"
              onClick={breatheFire}
              aria-label="Make the K Games dragon breathe fire"
              data-cursor="Fire!"
            >
              <span className="fire-dragon__art" dangerouslySetInnerHTML={{ __html: dragonMarkup }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
