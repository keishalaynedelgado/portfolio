import { sections } from "../../data/navigation";
import { profile } from "../../data/profile";
import { ArrowUp } from "../ui/Icons";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer surface-ink">
      <div className="container">
        <div className="footer__top">
          <nav aria-label="Footer">
            <ul className="footer__links">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="mono">{s.index}</span> {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#top" className="footer__top-btn" aria-label="Back to top">
            <ArrowUp />
          </a>
        </div>

        <p className="footer__wordmark" aria-hidden="true">
          Keisha <span className="serif">Layne</span>
        </p>

        <div className="footer__bottom mono">
          <span>
            © {year} {profile.name}
          </span>
          <span>
            {profile.role} · {profile.universityShort}
          </span>
        </div>
      </div>
    </footer>
  );
}
