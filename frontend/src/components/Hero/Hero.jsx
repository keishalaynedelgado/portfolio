import { useEffect, useRef } from "react";
import { profile } from "../../data/profile";
import { ArrowDown, ArrowRight, Download } from "../ui/Icons";
import Scramble from "../ui/Scramble";
import HeroCanvas from "./HeroCanvas";
import "./Hero.css";

const ringText =
  "WEB DEVELOPMENT ✦ TEST AUTOMATION ✦ AI-POWERED APPS ✦ MCP & AGENTS ✦ ";

export default function Hero() {
  const heroRef = useRef(null);

  // Gentle pointer parallax on the visual (skipped for touch + reduced motion).
  useEffect(() => {
    const el = heroRef.current;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || !fine || calm) return;

    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
    };
    const onLeave = () => {
      el.style.setProperty("--mx", 0);
      el.style.setProperty("--my", 0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="hero" id="top" ref={heroRef} aria-labelledby="hero-title">
      <HeroCanvas hostRef={heroRef} />
      <p className="hero__hint mono" aria-hidden="true">
        Psst, click anywhere
      </p>

      <div className="hero__inner container">
        <div className="hero__copy">
          <div className="hero__eyebrow">
            {profile.availability && (
              <span className="hero__status">
                <span className="hero__pulse" aria-hidden="true" />
                {profile.availability}
              </span>
            )}
            <span className="mono hero__edition">Portfolio — Vol. 01</span>
          </div>

          <h1 id="hero-title" className="hero__title">
            <span className="hero__name">
              <span className="hero__line" style={{ "--d": "0ms" }}>
                <Scramble text={profile.name} delay={150} duration={1100} />
              </span>
            </span>
            <span className="hero__headline">
              <span className="hero__line" style={{ "--d": "90ms" }}>
                Code that
              </span>
              <span className="hero__line" style={{ "--d": "180ms" }}>
                <em className="hero__w hero__w--tests">tests,</em>{" "}
                <span className="hero__w hero__w--talks">talks</span>
              </span>
              <span className="hero__line" style={{ "--d": "270ms" }}>
                &amp; <span className="hero__w hero__w--plays">plays.</span>
              </span>
            </span>
          </h1>

          <p className="hero__lede">
            I'm an aspiring web developer who likes building practical web apps, from automation that
            tests websites and chatbots to AI tools that turn plain-language ideas into playable games.
          </p>

          <div className="hero__ctas">
            <a href="#work" className="btn">
              Explore My Work <ArrowRight />
            </a>
            <a href="#contact" className="btn btn--ghost">
              Get in Touch
            </a>
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} className="hero__resume" download>
                <Download /> Download Resume
              </a>
            )}
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="orb">
            <svg className="orb__ring" viewBox="0 0 400 400">
              <defs>
                <path id="ring-path" d="M200,200 m-172,0 a172,172 0 1,1 344,0 a172,172 0 1,1 -344,0" />
              </defs>
              <text>
                <textPath href="#ring-path" textLength="1078" lengthAdjust="spacing">
                  {ringText}
                </textPath>
              </text>
            </svg>
            <div className="orb__core">
              <span className="orb__k">K</span>
            </div>
            <span className="orb__sat orb__sat--a" />
            <span className="orb__sat orb__sat--b" />
          </div>

          <figure className="code-card">
            <div className="code-card__bar">
              <span />
              <span />
              <span />
              <em className="mono">keisha.config.js</em>
            </div>
            <pre className="code-card__body">
              <code>
                <span className="t-key">export const</span> <span className="t-var">keisha</span> = {"{"}
                {"\n  "}studies: <span className="t-str">"Computer Science"</span>,
                {"\n  "}at: <span className="t-str">"{profile.universityShort}"</span>,
                {"\n  "}builds: [<span className="t-str">"test automation"</span>,
                {"\n           "}
                <span className="t-str">"AI chatbots"</span>],
                {"\n  "}nextUp: <span className="t-str">"your team?"</span>
                {"\n"}
                {"}"};<span className="code-card__caret" />
              </code>
            </pre>
          </figure>

          <div className="hero__sticker">
            <span className="mono">Based at</span>
            <strong>XU</strong>
            <span className="mono">Ateneo de Cagayan</span>
          </div>
        </div>
      </div>

      <div className="hero__meta container">
        <dl>
          <div>
            <dt className="mono">Studying</dt>
            <dd>Computer Science</dd>
          </div>
          <div>
            <dt className="mono">University</dt>
            <dd>{profile.university}</dd>
          </div>
          <div>
            <dt className="mono">Interests</dt>
            <dd>Web · Automation · AI</dd>
          </div>
        </dl>
        <a href="#about" className="hero__scroll mono" aria-label="Scroll to About section">
          Scroll <ArrowDown />
        </a>
      </div>
    </section>
  );
}
