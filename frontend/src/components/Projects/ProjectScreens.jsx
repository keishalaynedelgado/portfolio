import { useId, useState } from "react";

/**
 * Real screenshots in a browser frame.
 * - Tabs switch between screens.
 * - Tall full-page captures (scroll: true) glide from top to bottom on hover/focus,
 *   so visitors can see the whole page without leaving the portfolio.
 * - Clicking a screen opens it full size (handled by onOpen).
 */
export default function ProjectScreens({ project, onOpen }) {
  const [active, setActive] = useState(0);
  const tabsId = useId();
  const screens = project.screens;
  const screen = screens[active];

  return (
    <div className="screens">
      <div className="screens__bar">
        <span className="screens__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {screens.length > 1 ? (
          <div className="screens__tabs" role="tablist" aria-label={`${project.title} screens`}>
            {screens.map((s, i) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                id={`${tabsId}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${tabsId}-panel`}
                className={`screens__tab ${i === active ? "is-active" : ""}`}
                onClick={() => setActive(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="screens__label mono">{screen.label}</span>
        )}
      </div>

      <button
        type="button"
        id={`${tabsId}-panel`}
        role="tabpanel"
        aria-labelledby={screens.length > 1 ? `${tabsId}-tab-${active}` : undefined}
        className={`screens__view ${screen.scroll ? "screens__view--scroll" : ""}`}
        onClick={() => onOpen(active)}
        aria-label={`Open ${project.title} — ${screen.label} full size`}
        data-cursor="View"
      >
        {screens.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt={i === active ? s.alt : ""}
            aria-hidden={i === active ? undefined : true}
            className={i === active ? "is-active" : ""}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        ))}
        {screen.scroll && (
          <span className="screens__hint mono" aria-hidden="true">
            Hover to scroll ↓
          </span>
        )}
      </button>
    </div>
  );
}
