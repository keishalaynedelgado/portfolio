import { useEffect, useRef } from "react";
import "./Cursor.css";

const MAGNETIC = ".btn, .nav__cta, .footer__top-btn, .project__toggle-icon, .hero__scroll svg, [data-magnetic]";
const INTERACTIVE = "a, button, [role=button], select, label, summary";

/**
 * Custom cursor (desktop mouse only):
 * - a dot that tracks the pointer exactly, and a ring that follows with easing;
 * - the ring grows over links/buttons, and shows a label over [data-cursor] elements;
 * - "magnetic" buttons lean towards the pointer.
 * Disabled for touch devices and reduced-motion users (the native cursor stays).
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let frame = 0;
    let magnet = null;

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const releaseMagnet = () => {
      if (magnet) {
        magnet.style.translate = "";
        magnet = null;
      }
    };

    // Ring state depends on what's under the pointer
    const updateState = (t) => {
      const labelled = t?.closest("[data-cursor]");
      const interactive = t?.closest(INTERACTIVE);
      const text = t?.closest("input, textarea, [contenteditable=true]");
      ring.classList.toggle("is-label", Boolean(labelled));
      ring.classList.toggle("is-hover", Boolean(interactive) && !labelled);
      root.classList.toggle("cursor-text", Boolean(text));
      if (labelled) label.textContent = labelled.getAttribute("data-cursor");
    };

    // Content moves under a still mouse while scrolling — re-check the element there
    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        updateState(document.elementFromPoint(pos.x, pos.y));
        releaseMagnet();
      });
    };

    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      root.classList.remove("cursor-hidden");

      const t = e.target instanceof Element ? e.target : null;
      updateState(t);

      // Magnetic pull
      const m = t?.closest(MAGNETIC);
      if (m !== magnet) releaseMagnet();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        m.style.translate = `${dx * 0.22}px ${dy * 0.3}px`;
      }
    };
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");
    const onOut = (e) => {
      if (!e.relatedTarget) {
        root.classList.add("cursor-hidden");
        releaseMagnet();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerout", onOut);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      releaseMagnet();
      root.classList.remove("has-cursor", "cursor-hidden", "cursor-text");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor__ring" ref={ringRef}>
        <span className="cursor__label" ref={labelRef} />
      </div>
      <div className="cursor__dot" ref={dotRef} />
    </div>
  );
}
