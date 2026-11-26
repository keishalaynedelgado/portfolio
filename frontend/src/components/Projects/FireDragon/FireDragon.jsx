import { useEffect, useRef, useState } from "react";
import { useInView } from "../../../hooks/useInView";
import dragonMarkup from "./dragon.svg?raw";
import "./FireDragon.css";

const EMBERS = [0, 1, 2, 3, 4, 5, 6, 7];

/**
 * The K Games dragon (from the K Games project's own artwork), flying over the
 * project's screenshot frame: it flies in when scrolled into view, flaps its
 * wings, and breathes a stream of fire across the frame every few seconds.
 * Clicking it fires a bigger blast on demand.
 * With reduced motion it simply hovers in place with a still flame.
 */
export default function FireDragon() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const [burst, setBurst] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const breatheFire = () => {
    clearTimeout(timer.current);
    // Drop the class for a frame so repeated clicks restart the animation.
    setBurst(false);
    requestAnimationFrame(() => {
      setBurst(true);
      timer.current = setTimeout(() => setBurst(false), 1100);
    });
  };

  return (
    <div ref={ref} className={`fire-dragon ${inView ? "is-in" : ""} ${burst ? "is-burst" : ""}`}>
      <div className="fire-dragon__glow" aria-hidden="true" />
      <div className="fire-dragon__flight">
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
  );
}
