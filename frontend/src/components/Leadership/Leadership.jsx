import { experience } from "../../data/experience";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import "./Leadership.css";

export default function Leadership() {
  return (
    <section id="leadership" className="section panel surface-sky leadership" aria-labelledby="leadership-title">
      <div className="container">
        <SectionHeading
          index="04"
          label="Experience & Leadership"
          id="leadership-title"
          title={
            <>
              Building, organizing &amp; <span className="serif">leading.</span>
            </>
          }
          intro="My OJT at MeldCX, plus helping tech communities plan projects, run events, and keep people engaged."
        />

        <ol className="timeline">
          {experience.map((item, i) => (
            <li key={item.id} className="timeline__item">
              <Reveal className="timeline__period" aria-hidden="true">
                <span className="timeline__year">{item.period}</span>
              </Reveal>

              <div className="timeline__rail" aria-hidden="true">
                <span className="timeline__node">{String(experience.length - i).padStart(2, "0")}</span>
              </div>

              <Reveal delay={100} className="timeline__card-wrap">
                <article className="timeline__card">
                  <header className="timeline__head">
                    <p className="timeline__period-inline mono">{item.period}</p>
                    <h3 className="timeline__org">{item.organization}</h3>
                    {item.location && <p className="timeline__loc">{item.location}</p>}
                    <ul className="timeline__roles" aria-label="Roles">
                      {item.roles.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </header>

                  {item.photo && (
                    <figure className="timeline__photo">
                      <img src={item.photo.src} alt={item.photo.alt} loading="lazy" decoding="async" width="1400" height="788" />
                      {item.photo.caption && <figcaption className="mono">{item.photo.caption}</figcaption>}
                    </figure>
                  )}

                  <h4 className="timeline__label mono">Responsibilities</h4>
                  <ul className="timeline__list">
                    {item.responsibilities.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
