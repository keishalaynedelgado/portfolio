import { useCallback, useState } from "react";
import { certificates } from "../../data/certificates";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import Lightbox from "../ui/Lightbox";
import ViewMore, { useViewMore } from "../ui/ViewMore";
import "./Certificates.css";

// Certificates shown before "View more" (one row on desktop).
const VISIBLE_CERTIFICATES = 3;

/** Certificates as a grid of cards; clicking one opens it full size. */
export default function Certificates() {
  const [index, setIndex] = useState(null);
  const more = useViewMore(certificates.length, VISIBLE_CERTIFICATES, "certificates");
  const items = certificates.map((c) => ({
    src: c.src,
    title: c.title,
    caption: `${c.issuer} · ${c.date}`,
    alt: `${c.title} certificate from ${c.issuer}`,
  }));
  const close = useCallback(() => setIndex(null), []);

  return (
    <section id="certificates" className="section certificates" aria-labelledby="certificates-title">
      <div className="container">
        <SectionHeading
          index="05"
          label="Certificates"
          id="certificates-title"
          title={
            <>
              Recognized <span className="serif">along the way.</span>
            </>
          }
          intro="Certificates from my service learning, tech communities, and school. Click one to see it full size."
        />

        <ul className="certificates__grid" id="certificates-grid">
          {certificates.slice(0, more.count).map((c, i) => (
            <Reveal as="li" key={c.id} delay={(i % 3) * 90} className={i >= VISIBLE_CERTIFICATES ? "view-more-reveal" : undefined}>
              <button
                type="button"
                className="cert"
                onClick={() => setIndex(i)}
                aria-label={`Open the ${c.title} certificate`}
                data-cursor="View"
              >
                <span className="cert__img">
                  <img src={c.src} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="cert__body">
                  <span className="cert__meta mono">
                    <span className="cert__kind">{c.kind}</span>
                    <span>{c.date}</span>
                  </span>
                  <strong className="cert__title">{c.title}</strong>
                  <span className="cert__issuer">{c.issuer}</span>
                  <span className="cert__desc">{c.description}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
        <ViewMore {...more} label="certificates" tone="light" controls="certificates-grid" />
      </div>
      <Lightbox items={items} index={index} onClose={close} onIndex={setIndex} fit />
    </section>
  );
}
