import { projects, showUpcomingSlot } from "../../data/projects";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import ProjectCard from "./ProjectCard";
import ViewMore, { useViewMore } from "../ui/ViewMore";
import "./Projects.css";

// Projects shown before "View more" (add more projects and the rest wait behind it).
const VISIBLE_PROJECTS = 4;

export default function Projects() {
  const nextNumber = String(projects.length + 1).padStart(2, "0");
  const more = useViewMore(projects.length, VISIBLE_PROJECTS, "work");

  return (
    <section id="work" className="section panel surface-ink projects" aria-labelledby="work-title">
      <div className="container">
        <SectionHeading
          index="02"
          label="Selected Work"
          id="work-title"
          title={
            <>
              Things I've <span className="serif">built</span> so far.
            </>
          }
          intro="Real screenshots from real projects in test automation, AI-powered applications and full-stack web apps. Hover a screen to scroll it, click to zoom in, and open “How it works” for the details."
        />

        <ol className="projects__list" id="projects-list">
          {projects.slice(0, more.count).map((project, i) => (
            <li key={project.id} className={i >= VISIBLE_PROJECTS ? "view-more-reveal" : undefined}>
              <ProjectCard project={project} index={i} />
            </li>
          ))}

          {showUpcomingSlot && (more.open || more.hidden === 0) && (
            <Reveal as="li" className="projects__upcoming">
              <span className="projects__upcoming-num mono">{nextNumber}</span>
              <div>
                <p className="projects__upcoming-title">
                  Next project <span className="serif">loading</span>
                  <span className="projects__dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </p>
                <p className="projects__upcoming-text">
                  More projects are on the way. This space is reserved for what I build next.
                </p>
              </div>
            </Reveal>
          )}
        </ol>
        <ViewMore {...more} label="projects" tone="dark" controls="projects-list" />
      </div>
    </section>
  );
}
