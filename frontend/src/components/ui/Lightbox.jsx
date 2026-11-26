import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./Lightbox.css";

/**
 * Full-screen image viewer.
 * items: [{ src, title, caption, alt }], index: number | null
 * Keyboard: Esc closes, ← / → move between images.
 */
export default function Lightbox({ items, index, onClose, onIndex }) {
  const closeRef = useRef(null);
  const lastFocus = useRef(null);
  const open = index !== null && index !== undefined;

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
      // Keep focus inside the dialog
      if (e.key === "Tab") {
        const f = [...document.querySelectorAll(".lightbox button")];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, index, items.length, onClose, onIndex]);

  // Restore focus to whatever opened the viewer
  useEffect(() => {
    if (!open && lastFocus.current) {
      lastFocus.current.focus?.();
      lastFocus.current = null;
    }
  }, [open]);

  if (!open) return null;
  const item = items[index];
  const many = items.length > 1;

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox__scroll">
          <img key={item.src} src={item.src} alt={item.alt || item.title} />
        </div>
        <figcaption className="lightbox__caption">
          <strong>{item.title}</strong>
          {item.caption && <span>{item.caption}</span>}
          {many && (
            <span className="lightbox__count mono">
              {index + 1} / {items.length}
            </span>
          )}
        </figcaption>
      </figure>

      <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      {many && (
        <>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              onIndex((index - 1 + items.length) % items.length);
            }}
          >
            ←
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              onIndex((index + 1) % items.length);
            }}
          >
            →
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
