import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]=+*#";

/**
 * "Decoding" text effect: characters resolve left-to-right from random glyphs.
 * Screen readers get the final text straight away.
 */
export default function Scramble({ text, delay = 0, duration = 1000, className = "" }) {
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let start = 0;

    const run = (now) => {
      // Wait while the intro curtain is still up
      if (document.documentElement.classList.contains("intro-active")) {
        frame = requestAnimationFrame(run);
        return;
      }
      if (!start) start = now + delay;
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const solved = Math.floor(t * text.length);
      setOut(
        text
          .split("")
          .map((c, i) => (i < solved || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join("")
      );
      if (t < 1) frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [text, delay, duration]);

  return (
    <span className={className}>
      <span aria-hidden="true">{out}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
