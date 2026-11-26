import { useEffect, useState } from "react";
import { profile } from "../../data/profile";
import "./Preloader.css";

const KEY = "kld-intro-seen";

/** Show the intro once per browser session, and never for reduced-motion users. */
function shouldPlay() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return !sessionStorage.getItem(KEY);
  } catch {
    return false;
  }
}

/**
 * Intro curtain: name reveal + 0→100 counter, then a layered wipe.
 * While it plays, <html> has the class "intro-active" so the hero's own
 * entrance animations wait and play right as the curtain lifts.
 */
export default function Preloader() {
  const [phase, setPhase] = useState(() => (shouldPlay() ? "count" : "done"));
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (phase === "done") {
      document.documentElement.classList.remove("intro-active");
      return;
    }
    document.documentElement.classList.add("intro-active");
    if (phase !== "count") return;

    const duration = 1300;
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setTimeout(() => setPhase("exit"), 220);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit") return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode — the intro may simply play again */
    }
    // Let the hero start animating as the curtain begins to lift.
    const lift = setTimeout(() => document.documentElement.classList.remove("intro-active"), 250);
    const done = setTimeout(() => setPhase("done"), 1100);
    return () => {
      clearTimeout(lift);
      clearTimeout(done);
    };
  }, [phase]);

  if (phase === "done") return null;

  const letters = profile.firstName.split("");

  return (
    <div className={`preloader ${phase === "exit" ? "is-exiting" : ""}`} aria-hidden="true">
      <div className="preloader__layer preloader__layer--blue" />
      <div className="preloader__layer preloader__layer--ink">
        <div className="preloader__top mono">
          <span>Portfolio — Vol. 01</span>
          <span>{profile.universityShort}</span>
        </div>

        <p className="preloader__name">
          {letters.map((l, i) => (
            <span key={i} style={{ "--i": i }}>
              {l}
            </span>
          ))}
          <em className="serif" style={{ "--i": letters.length }}>
            .dev
          </em>
        </p>

        <div className="preloader__bottom">
          <span className="mono">Loading the good stuff</span>
          <span className="preloader__count">{String(count).padStart(3, "0")}</span>
        </div>
        <div className="preloader__bar" style={{ transform: `scaleX(${count / 100})` }} />
      </div>
    </div>
  );
}
