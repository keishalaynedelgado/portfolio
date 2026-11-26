/**
 * Artwork shown in each project's media frame.
 * If the project has an `image`, the screenshot is shown instead of the illustration.
 */
import { Check } from "../ui/Icons";

function BrowserBar({ label }) {
  return (
    <div className="pv__bar">
      <span />
      <span />
      <span />
      <em className="mono">{label}</em>
    </div>
  );
}

function AutomationArt() {
  const rows = [72, 54, 88, 63, 46];
  return (
    <div className="pv pv--automation">
      <BrowserBar label="test-run" />
      <div className="pv__split">
        <div className="pv__chat">
          <span className="pv__bubble pv__bubble--in" style={{ "--w": "78%" }} />
          <span className="pv__bubble pv__bubble--out" style={{ "--w": "62%" }} />
          <span className="pv__bubble pv__bubble--in" style={{ "--w": "70%" }} />
          <span className="pv__cursor" />
        </div>
        <div className="pv__report">
          <p className="pv__report-title mono">Test report</p>
          <ul>
            {rows.map((w, i) => (
              <li key={i} style={{ "--i": i }}>
                <span className="pv__check">
                  <Check />
                </span>
                <span className="pv__line" style={{ "--w": `${w}%` }} />
              </li>
            ))}
          </ul>
          <p className="pv__compare mono">
            <span>expected</span>
            <span aria-hidden="true">⇄</span>
            <span>actual</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// 8×6 pixel scene: sky (0), ground (1), platform (2), star (3)
const scene = [
  "00000300",
  "00000000",
  "00222000",
  "00000003",
  "00000000",
  "11111111",
];

function ChatArt() {
  return (
    <div className="pv pv--chat">
      <BrowserBar label="k-games" />
      <div className="pv__thread">
        <div className="pv__msg pv__msg--user">
          <span className="pv__line" style={{ "--w": "100%" }} />
          <span className="pv__line" style={{ "--w": "64%" }} />
        </div>
        <div className="pv__msg pv__msg--bot">
          <span className="pv__avatar">K</span>
          <div className="pv__game">
            {scene.join("").split("").map((c, i) => (
              <i key={i} className={`px px--${c}`} />
            ))}
            <b className="pv__player" />
          </div>
        </div>
      </div>
      <div className="pv__input">
        <span>Describe the game you want…</span>
        <i />
      </div>
    </div>
  );
}

function GenericArt({ title }) {
  return (
    <div className="pv pv--generic">
      <BrowserBar label="project" />
      <div className="pv__generic-body">
        <span className="serif">{title?.charAt(0) ?? "K"}</span>
      </div>
    </div>
  );
}

export default function ProjectVisual({ project }) {
  if (project.image) {
    return (
      <figure className="pv pv--image">
        <BrowserBar label={project.id} />
        <img src={project.image} alt={project.imageAlt || `${project.title} screenshot`} loading="lazy" />
      </figure>
    );
  }

  const art =
    project.visual === "automation" ? (
      <AutomationArt />
    ) : project.visual === "chat" ? (
      <ChatArt />
    ) : (
      <GenericArt title={project.title} />
    );

  return (
    <figure className="pv-figure" aria-label={`Illustration for ${project.title}`}>
      {art}
      <figcaption className="pv__caption mono">Illustration · screenshots coming soon</figcaption>
    </figure>
  );
}
