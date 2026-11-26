import { useCallback, useId, useRef, useState } from "react";
import Reveal from "../ui/Reveal";
import Lightbox from "../ui/Lightbox";
import { ArrowUpRight, GitHub, Plus } from "../ui/Icons";
import ProjectScreens from "./ProjectScreens";
import ProjectVisual from "./ProjectVisual";
import FireDragon from "./FireDragon/FireDragon";

export default function ProjectCard({ project, index }) {
  const [open, setOpen] = useState(false);
  const [viewer, setViewer] = useState({ items: [], index: null });
  const detailsId = useId();
  const mediaRef = useRef(null);
  const number = String(index + 1).padStart(2, "0");
  const flipped = index % 2 === 1;
  const { repo, demo } = project.links ?? {};
  const hasScreens = project.screens?.length > 0;

  // Gentle pointer-driven 3D tilt on the media stage.
  const onMove = (e) => {
    const el = mediaRef.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
  };
  const onLeave = () => {
    mediaRef.current?.style.setProperty("--rx", "0deg");
    mediaRef.current?.style.setProperty("--ry", "0deg");
  };

  const openScreens = (i) =>
    setViewer({
      items: project.screens.map((s) => ({ src: s.src, alt: s.alt, title: `${project.title} — ${s.label}` })),
      index: i,
    });
  const openShowcase = (i) => setViewer({ items: project.showcase.items, index: i });
  const closeViewer = useCallback(() => setViewer((v) => ({ ...v, index: null })), []);
  const setViewerIndex = useCallback((i) => setViewer((v) => ({ ...v, index: i })), []);

  return (
    <article
      className={`project ${flipped ? "project--flipped" : ""} ${open ? "is-open" : ""} ${hasScreens ? "project--screens" : ""} ${project.mascot ? "project--mascot" : ""}`}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="project__main">
      <Reveal className="project__media-wrap">
        <div
          className="project__media"
          data-visual={project.visual}
          ref={mediaRef}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          {hasScreens ? <ProjectScreens project={project} onOpen={openScreens} /> : <ProjectVisual project={project} />}
        </div>
        {project.mascot === "dragon" && <FireDragon />}
      </Reveal>

      <Reveal className="project__content" delay={120}>
        <div className="project__top">
          <span className="project__num">{number}</span>
          <span className="project__category mono">{project.category}</span>
        </div>

        <h3 className="project__title" id={`${project.id}-title`}>
          {project.title}
        </h3>
        {project.tagline && <p className="project__tagline serif">{project.tagline}</p>}
        <p className="project__summary">{project.summary}</p>

        {project.focus?.length > 0 && (
          <ul className="project__tags" aria-label="Focus areas">
            {project.focus.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}

        {project.tech?.length > 0 && (
          <div className="project__tech">
            <span className="mono">Built with</span>
            <ul aria-label="Technologies">
              {project.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="project__actions">
          {project.details?.length > 0 && (
            <button
              type="button"
              className="project__toggle"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="project__toggle-icon">
                <Plus />
              </span>
              {open ? "Hide details" : "How it works"}
            </button>
          )}
          {demo && (
            <a className="project__link" href={demo} target="_blank" rel="noreferrer">
              Live demo <ArrowUpRight />
            </a>
          )}
          {repo && (
            <a className="project__link" href={repo} target="_blank" rel="noreferrer">
              <GitHub /> View code
            </a>
          )}
        </div>

        <div className="project__details" id={detailsId} role="region" aria-label={`${project.title} details`}>
          <div className="project__details-inner" inert={!open}>
            <dl>
              {project.details?.map((d) => (
                <div key={d.heading}>
                  <dt className="mono">{d.heading}</dt>
                  <dd>{d.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Reveal>
      </div>

      {project.showcase?.items?.length > 0 && (
        <Reveal className="showcase">
          <div className="showcase__head">
            <h4 className="showcase__title">
              {project.showcase.title.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="serif">{project.showcase.title.split(" ").slice(-2).join(" ")}</span>
            </h4>
            {project.showcase.intro && <p className="showcase__intro">{project.showcase.intro}</p>}
          </div>
          <ul className="showcase__list">
            {project.showcase.items.map((item, i) => (
              <li key={item.src} style={{ "--i": i }}>
                <button
                  type="button"
                  className="showcase__card"
                  onClick={() => openShowcase(i)}
                  aria-label={`Open screenshot of ${item.title}`}
                  data-cursor="Play"
                >
                  <span className="showcase__img">
                    <img src={item.src} alt={`${item.title} — ${item.caption}`} loading="lazy" decoding="async" />
                  </span>
                  <span className="showcase__meta">
                    <strong>{item.title}</strong>
                    <span>{item.caption}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <Lightbox items={viewer.items} index={viewer.index} onClose={closeViewer} onIndex={setViewerIndex} />
    </article>
  );
}
