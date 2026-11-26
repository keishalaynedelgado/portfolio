import { profile } from "../../data/profile";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import "./About.css";

const interests = [
  {
    title: "Software Development",
    body: "Writing software with languages and frameworks like Python, Java, React.js, and Node.js, and connecting it all to real databases.",
    glyph: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M17 15 8 24l9 9M31 15l9 9-9 9M27 11l-6 26" />
      </svg>
    ),
  },
  {
    title: "Automation",
    body: "Turning repetitive work into scripts, like using Playwright to test websites and evaluate chatbot responses.",
    glyph: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="7" />
        <path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.3 11.3l4.2 4.2M32.5 32.5l4.2 4.2M11.3 36.7l4.2-4.2M32.5 15.5l4.2-4.2" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Applications",
    body: "Exploring how AI can make creating things more accessible, such as generating a game from a plain-language description.",
    glyph: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 6c1.2 9 5 12.8 14 14-9 1.2-12.8 5-14 14-1.2-9-5-12.8-14-14 9-1.2 12.8-5 14-14Z" />
        <path d="M38 32c.4 3 1.6 4.3 4.6 4.7-3 .4-4.2 1.6-4.6 4.6-.4-3-1.6-4.2-4.6-4.6 3-.4 4.2-1.7 4.6-4.7Z" />
      </svg>
    ),
  },
  {
    title: "Tech Communities",
    body: "Planning projects and running events with GDSC and DEVCON Cagayan de Oro, where organizing meets technology.",
    glyph: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="17" cy="18" r="6" />
        <circle cx="33" cy="20" r="5" />
        <path d="M6 38c1.5-7 6-10 11-10s9.5 3 11 10M28 30.5c1.5-1 3.2-1.5 5-1.5 4.2 0 7.6 2.6 9 9" />
      </svg>
    ),
  },
];

const facts = [
  { label: "Name", value: profile.name },
  { label: "Program", value: "Computer Science" },
  { label: "University", value: profile.university },
  { label: "Path", value: profile.title },
];

export default function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeading
          index="01"
          label="About"
          id="about-title"
          title={
            <>
              I like software that <span className="serif">does real work.</span>
            </>
          }
        />

        <div className="about__split">
          <div className="about__story">
            <Reveal as="p" className="about__lead">
              I'm {profile.firstName}, a Computer Science student at {profile.university}. I'm drawn to
              the point where software stops being an exercise and starts being{" "}
              <mark>useful</mark>: saving someone time, checking that something works, or turning an idea
              into something you can actually play.
            </Reveal>
            <Reveal as="p" delay={100} className="about__body">
              My projects so far have taken me into test automation and AI-powered applications. Outside
              the classroom, I help plan and run tech community initiatives through Google Developer
              Student Clubs and DEVCON Cagayan de Oro.
            </Reveal>
          </div>

          <Reveal delay={150}>
          <aside className="about__card" aria-label="Quick facts">
            <div className="about__card-head mono">
              <span>Fact file</span>
              <span>No. 001</span>
            </div>
            <dl>
              {facts.map((f) => (
                <div key={f.label} className="about__fact">
                  <dt className="mono">{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="about__card-foot" aria-hidden="true">
              <span className="about__barcode" />
              <span className="mono">KLD-CS</span>
            </div>
          </aside>
          </Reveal>
        </div>

        <ol className="about__interests" aria-label="Areas of interest">
          {interests.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 90} className="about__interest">
              <article className="interest">
                <span className="interest__num mono">0{i + 1}</span>
                <span className="interest__glyph">{item.glyph}</span>
                <h3 className="interest__title">{item.title}</h3>
                <p className="interest__body">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
