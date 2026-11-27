import { useState } from "react";
import { profile } from "../../data/profile";
import Reveal from "../ui/Reveal";
import { ArrowUpRight, Check, Copy, Download, FileText, GitHub, LinkIcon, LinkedIn, Mail } from "../ui/Icons";
import "./Contact.css";

function ContactRow({ icon: Icon, label, value, href, display, external, children }) {
  const available = Boolean(value);
  const content = (
    <>
      <span className="contact__icon">
        <Icon />
      </span>
      <span className="contact__text">
        <span className="contact__label mono">{label}</span>
        <span className="contact__value">{available ? display ?? value : "Coming soon"}</span>
      </span>
      {available && <ArrowUpRight className="contact__arrow" />}
    </>
  );

  return (
    <li className={`contact__row ${available ? "" : "is-pending"}`}>
      {available ? (
        <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {content}
        </a>
      ) : (
        <div aria-label={`${label}: coming soon`}>{content}</div>
      )}
      {available && children}
    </li>
  );
}

const pretty = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

// Opens Gmail in the browser with a new message to this address, instead of
// relying on a desktop mail app (mailto: does nothing when none is set up).
const gmailCompose = (to) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;

export default function Contact() {
  const { email, linkedin, github } = profile.contact;
  const emailHref = email ? gmailCompose(email) : "";
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(emailHref, "_blank", "noreferrer");
    }
  };

  return (
    <section id="contact" className="section panel surface-blue contact" aria-labelledby="contact-title">
      <div className="contact__glow" aria-hidden="true" />
      <div className="container contact__inner">
        <div className="contact__intro">
          <Reveal className="contact__meta mono">
            <span className="section-heading__index">05</span>
            <span className="section-heading__rule" />
            <span>Contact</span>
          </Reveal>

          <Reveal as="h2" delay={80} id="contact-title" className="contact__title">
            Let's build something <span className="serif">useful.</span>
          </Reveal>

          <Reveal as="p" delay={160} className="contact__text-lead">
            I'm open to internships, entry-level roles, and collaborations. If you're hiring or have a project
            in mind, I'd love to hear from you.
          </Reveal>

          <Reveal delay={240} className="contact__resume">
            <FileText className="contact__resume-icon" />
            <div>
              <p className="contact__resume-title">Resume</p>
              <p className="contact__resume-sub">
                {profile.resumeUrl ? "PDF · ready to download" : "Coming soon"}
              </p>
            </div>
            {profile.resumeUrl ? (
              <a className="btn btn--light" href={profile.resumeUrl} download>
                Download <Download />
              </a>
            ) : (
              <span className="contact__resume-pending mono">Soon</span>
            )}
          </Reveal>
        </div>

        <div className="contact__side">
        {email && (
          <Reveal delay={200} className="contact__badge-wrap">
            <a
              className="contact__badge"
              href={emailHref}
              target="_blank"
              rel="noreferrer"
              data-magnetic
              aria-label={`Email ${profile.firstName} in Gmail (opens in a new tab)`}
            >
              <svg viewBox="0 0 200 200" className="contact__badge-ring" aria-hidden="true">
                <defs>
                  <path id="badge-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                <text>
                  <textPath href="#badge-path" textLength="488" lengthAdjust="spacing">
                    SAY HELLO ✦ SEND AN EMAIL ✦ SAY HELLO ✦ SEND AN EMAIL ✦
                  </textPath>
                </text>
              </svg>
              <span className="contact__badge-core">
                <ArrowUpRight />
              </span>
            </a>
          </Reveal>
        )}
        <Reveal as="ul" delay={120} className="contact__list" aria-label="Contact links">
          <ContactRow icon={Mail} label="Email" value={email} href={emailHref} external>
            <button type="button" className="contact__copy" onClick={copyEmail} aria-label="Copy email address">
              {copied ? <Check /> : <Copy />}
              <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
            </button>
          </ContactRow>
          <ContactRow
            icon={LinkedIn}
            label="LinkedIn"
            value={linkedin}
            href={linkedin}
            display={linkedin && pretty(linkedin)}
            external
          />
          <ContactRow
            icon={GitHub}
            label="GitHub"
            value={github}
            href={github}
            display={github && pretty(github)}
            external
          />
          {profile.otherLinks.map((link) => (
            <ContactRow
              key={link.url}
              icon={LinkIcon}
              label={link.label}
              value={link.url}
              href={link.url}
              display={pretty(link.url)}
              external
            />
          ))}
        </Reveal>
        </div>
      </div>
    </section>
  );
}
