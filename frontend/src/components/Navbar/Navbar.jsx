import { useEffect, useState } from "react";
import { sections } from "../../data/navigation";
import { profile } from "../../data/profile";
import { useActiveSection } from "../../hooks/useActiveSection";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { Download } from "../ui/Icons";
import "./Navbar.css";

const sectionIds = sections.map((s) => s.id);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  const { progress, scrolled } = useScrollProgress();

  // Lock page scroll and allow Escape to close while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the mobile menu if the viewport grows past the breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""} ${open ? "nav--open" : ""}`}>
      <div className="nav__bar container">
        <a href="#top" className="nav__brand" onClick={close} aria-label={`${profile.name} — back to top`}>
          <span className="nav__mark" aria-hidden="true">
            K
          </span>
          <span className="nav__brand-text">
            <strong>Keisha Delgado</strong>
            <span className="mono">Web Developer</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={active === s.id ? "is-active" : ""}
                  aria-current={active === s.id ? "true" : undefined}
                >
                  <span className="nav__index mono" aria-hidden="true">
                    {s.index}
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__actions">
          {profile.resumeUrl ? (
            <a className="nav__cta" href={profile.resumeUrl} download>
              Resume <Download />
            </a>
          ) : (
            <a className="nav__cta" href="#contact">
              Let's talk
            </a>
          )}
          <button
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="nav__progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      <div id="mobile-menu" className="nav__sheet" hidden={!open}>
        <nav aria-label="Mobile">
          <ul>
            {sections.map((s, i) => (
              <li key={s.id} style={{ "--i": i }}>
                <a href={`#${s.id}`} onClick={close}>
                  <span className="mono">{s.index}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="nav__sheet-foot mono">
          {profile.name} — {profile.universityShort}
        </p>
      </div>
    </header>
  );
}
