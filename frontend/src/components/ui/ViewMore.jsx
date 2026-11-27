import { useCallback, useState } from "react";
import { ArrowDown } from "./Icons";
import "./ViewMore.css";

/**
 * Show the first `limit` items of a list and keep the rest behind a
 * "View more" button, so the page only grows when a visitor asks.
 *
 *   const more = useViewMore(items.length, 3, "certificates");
 *   items.slice(0, more.count)…  <ViewMore {...more} label="certificates" />
 *
 * "Show less" collapses the list again and scrolls back to the section top.
 */
export function useViewMore(total, limit, sectionId) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => {
    setOpen((was) => {
      if (was && sectionId) {
        // collapsing: bring the section back into view so nothing jumps away
        requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
      return !was;
    });
  }, [sectionId]);
  const hidden = Math.max(0, total - limit);
  return { open, toggle, hidden, count: open ? total : Math.min(total, limit) };
}

export default function ViewMore({ open, toggle, hidden, label = "items", tone = "light", controls }) {
  if (hidden <= 0) return null;
  return (
    <div className={`view-more view-more--${tone}`}>
      <button
        type="button"
        className={`view-more__btn${open ? " is-open" : ""}`}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={controls}
        data-magnetic
      >
        <span>{open ? "Show less" : `View more ${label}`}</span>
        {!open && <span className="view-more__count mono">+{hidden}</span>}
        <ArrowDown className="view-more__icon" />
      </button>
    </div>
  );
}
