import { useEffect, useRef } from "react";
import dragonMarkup from "./dragon-side.svg?raw";
import Flame from "./Flame";
import "./FireDragon.css";

const EMBERS = [0, 1, 2, 3, 4, 5, 6, 7];

const FIRE_MS = 1300; // how long one breath of fire lasts
const CRUISE = 210; // px/s while flying
const HOVER = 40; // px/s while breathing fire
const TURN_MS = 950; // dive, roll over, pull out the other way
const MAX_PITCH = 22; // degrees the nose tilts when climbing or diving

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * The K Games dragon flying side-on over the top part of the K Games card
 * (title, text and screenshot), and only there: it never flies into the games
 * gallery below or off the card, and anything past that area is clipped.
 * It wanders between points in the visible part of the card, tilts its nose
 * as it climbs and dives, and every few seconds hovers to breathe fire.
 * Click it to make it fire.
 *
 * To turn around it does what a flyer would: it swoops into a dive, rolls over
 * along its spine, and pulls out facing the other way (no mirror flip).
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

    const s = {
      x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0,
      face: 1, pitch: 0,
      turn: null, // { from, dive, t0 } while turning around
      started: false, fireUntil: 0, nextFire: 0, lastCheck: 0,
    };
    stateRef.current = s;
    let frame = 0;
    let last = 0;
    let onScreen = false;

    // Where the dragon may fly: inside the card, limited to the part that's
    // visible below the navbar when there's room for it.
    const bounds = () => {
      const r = area.getBoundingClientRect();
      const w = flight.offsetWidth;
      const h = flight.offsetHeight;
      const W = area.clientWidth;
      const H = area.clientHeight;
      const navH = document.querySelector(".nav")?.offsetHeight ?? 72;
      const top = clamp(navH + 8 - r.top, 0, H);
      const bottom = clamp(window.innerHeight - r.top, 0, H);
      const maxX = Math.max(0, W - w);
      const cardMaxY = Math.max(0, H - h);
      let minY = clamp(top, 0, cardMaxY);
      let maxY = clamp(bottom - h, minY, cardMaxY);
      return { w, h, maxX, cardMaxY, minY, maxY, roomy: bottom - top >= h * 1.2 };
    };

    // Next waypoint: somewhere visible, and far enough away that it really travels.
    const pickTarget = () => {
      const b = bounds();
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * b.maxX;
        const y = b.minY + Math.random() * (b.maxY - b.minY);
        if (Math.abs(x - s.x) > b.maxX * 0.35 || i === 9) {
          s.tx = x;
          s.ty = y;
          return;
        }
      }
    };

    // Appear just inside the left or right edge of the card, heading inwards.
    const enter = (now) => {
      const b = bounds();
      const fromLeft = Math.random() < 0.6;
      s.x = fromLeft ? 0 : b.maxX;
      s.y = b.minY + (b.maxY - b.minY) * (0.15 + Math.random() * 0.3);
      s.face = fromLeft ? 1 : -1;
      s.vx = s.face * CRUISE * 0.6;
      s.vy = 0;
      s.pitch = 0;
      s.turn = null;
      s.nextFire = now + 1800;
      s.started = true;
      pickTarget();
      if (Math.sign(s.tx - s.x) !== s.face) s.tx = fromLeft ? b.maxX * 0.7 : b.maxX * 0.3;
      flight.style.opacity = "1";
    };

    const tick = (now) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      frame = requestAnimationFrame(tick);

      if (!s.started) {
        if (!bounds().roomy) return;
        enter(now);
      } else if (now - s.lastCheck > 300) {
        // Re-aim when the page scrolls and the waypoint is no longer in view.
        s.lastCheck = now;
        const b = bounds();
        if (s.ty < b.minY - 10 || s.ty > b.maxY + 10 || s.tx > b.maxX + 10) pickTarget();
      }

      // Fire schedule: hover and breathe fire every few seconds, never mid-turn.
      let firing = now < s.fireUntil;
      if (!firing && !s.turn && now > s.nextFire) {
        s.fireUntil = now + FIRE_MS;
        s.nextFire = now + FIRE_MS + 2600 + Math.random() * 3200;
        firing = true;
      }
      area.classList.toggle("is-firing", firing);

      // Steer smoothly towards the waypoint.
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 40) pickTarget();
      const speed = firing ? HOVER : s.turn ? CRUISE * 0.75 : CRUISE;
      const k = Math.min(1, dt * 2.2);
      s.vx += ((dx / dist) * speed - s.vx) * k;
      s.vy += ((dy / dist) * speed - s.vy) * k;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Never leave the card.
      const b = bounds();
      s.x = clamp(s.x, 0, b.maxX);
      s.y = clamp(s.y, 0, b.cardMaxY);

      // Waypoint behind it: turn around (not while breathing fire).
      if (!s.turn && !firing && Math.abs(dx) > 60 && Math.sign(dx) !== s.face) {
        // Dive into the turn, or climb into it when there's no room below.
        const dive = s.y < (b.minY + b.maxY) / 2 + b.h * 0.1 ? 1 : -1;
        s.turn = { from: s.face, dive, t0: now };
      }

      // Nose follows climbs and dives a little while cruising.
      const wantPitch = firing ? 0 : clamp((Math.atan2(s.vy, Math.abs(s.vx) + 1) * 180) / Math.PI, -MAX_PITCH, MAX_PITCH);
      s.pitch += (wantPitch - s.pitch) * Math.min(1, dt * 5);

      let rot = s.face * s.pitch;
      let roll = 0;
      let face = s.face;
      let swoop = 0;
      if (s.turn) {
        const { from, dive } = s.turn;
        const p = Math.min(1, (now - s.turn.t0) / TURN_MS);
        face = from;
        // 0-0.4 tip the nose down (or up), 0.4-0.6 roll over along the spine,
        // 0.6-1 pull out level facing the other way.
        const tip = 80 * dive;
        if (p < 0.4) {
          rot = from * (s.pitch + (tip - s.pitch) * ease(p / 0.4));
        } else if (p < 0.6) {
          rot = from * tip;
          roll = 180 * ease((p - 0.4) / 0.2);
        } else {
          rot = from * tip * (1 - ease((p - 0.6) / 0.4));
          roll = 180;
        }
        swoop = dive * Math.sin(Math.PI * p) * b.h * 0.35;
        if (p >= 1) {
          // Same picture as roll 180, written the plain way round.
          s.face = -from;
          s.pitch = 0;
          s.turn = null;
          face = s.face;
          rot = 0;
          roll = 0;
          swoop = 0;
        }
      }

      const drawY = clamp(s.y + swoop, 0, b.cardMaxY);
      flight.style.transform = `translate3d(${s.x.toFixed(1)}px, ${drawY.toFixed(1)}px, 0)`;
      orient.style.transform = `rotateY(${roll.toFixed(1)}deg) rotate(${rot.toFixed(2)}deg) scaleX(${face})`;
    };

    const start = () => {
      if (frame || !onScreen || document.hidden) return;
      last = 0;
      // Coming back to a card whose dragon is far off screen: appear again.
      if (s.started) {
        const b = bounds();
        if (s.y < b.minY - b.h * 2 || s.y > b.maxY + b.h * 2) {
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
    const s = stateRef.current;
    if (s?.turn) return; // it can't breathe fire mid-roll
    if (s) s.fireUntil = performance.now() + 1100;
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
            {/* The one flame: it starts at the mouth and turns with the dragon. */}
            <div className="fire-dragon__fire" aria-hidden="true">
              <Flame idPrefix="fd-" />
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
