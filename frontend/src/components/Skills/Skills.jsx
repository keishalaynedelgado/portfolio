import { useMemo, useState } from "react";
import { skillGroups } from "../../data/skills";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import "./Skills.css";

export default function Skills() {
  const [filter, setFilter] = useState("all");

  // Flatten into numbered "elements" while keeping their group id.
  const elements = useMemo(() => {
    let n = 0;
    return skillGroups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.id, groupLabel: g.short, n: ++n })));
  }, []);

  const total = elements.length;
  const activeLabel = filter === "all" ? "All skills" : skillGroups.find((g) => g.id === filter)?.label;

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading
          index="03"
          label="Toolkit"
          id="skills-title"
          title={
            <>
              The periodic table of my <span className="serif">toolkit.</span>
            </>
          }
          intro="The languages, frameworks, tools, and databases I work with. Pick a group to highlight it."
        />

        <Reveal className="skills__filters" role="group" aria-label="Filter skills by group">
          <button
            type="button"
            className={`skills__filter ${filter === "all" ? "is-active" : ""}`}
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All <span className="skills__count mono">{total}</span>
          </button>
          {skillGroups.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`skills__filter ${filter === g.id ? "is-active" : ""}`}
              aria-pressed={filter === g.id}
              onClick={() => setFilter((f) => (f === g.id ? "all" : g.id))}
            >
              <span className={`skills__swatch swatch--${g.id}`} aria-hidden="true" />
              {g.short}
              <span className="skills__count mono">{g.items.length}</span>
            </button>
          ))}
        </Reveal>

        <p className="sr-only" aria-live="polite">
          Showing: {activeLabel}
        </p>

        <ul className="skills__table" aria-label="Skills">
          {elements.map((el, i) => {
            const dim = filter !== "all" && filter !== el.group;
            return (
              <Reveal as="li" key={el.name} delay={(i % 10) * 45} className="skills__cell">
                <div className={`element element--${el.group} ${dim ? "is-dim" : ""}`} aria-hidden={dim || undefined}>
                  <span className="element__n mono">{String(el.n).padStart(2, "0")}</span>
                  <span className="element__group mono">{el.groupLabel}</span>
                  <span className="element__symbol" aria-hidden="true">
                    {el.symbol}
                  </span>
                  <span className="element__name">{el.name}</span>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <dl className="skills__legend">
          {skillGroups.map((g, i) => (
            <Reveal key={g.id} delay={i * 80} className="skills__legend-item">
              <dt>
                <span className={`skills__swatch swatch--${g.id}`} aria-hidden="true" />
                {g.label}
              </dt>
              <dd>{g.items.map((s) => s.name).join(", ")}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
