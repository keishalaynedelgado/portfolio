import Reveal from "./Reveal";
import "./SectionHeading.css";

/**
 * Editorial section header: index number, label, and a large title.
 * `title` can contain JSX (e.g. a <span className="serif"> accent).
 */
export default function SectionHeading({ index, label, title, intro, id }) {
  return (
    <header className="section-heading">
      <Reveal className="section-heading__meta mono">
        <span className="section-heading__index">{index}</span>
        <span className="section-heading__rule" aria-hidden="true" />
        <span>{label}</span>
      </Reveal>
      <Reveal as="h2" delay={80} className="section-heading__title" id={id}>
        {title}
      </Reveal>
      {intro && (
        <Reveal as="p" delay={160} className="section-heading__intro">
          {intro}
        </Reveal>
      )}
    </header>
  );
}
