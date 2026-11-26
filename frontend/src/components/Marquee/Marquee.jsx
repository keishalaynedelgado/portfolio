import "./Marquee.css";

/** One looping row. The list is rendered twice so the CSS loop is seamless. */
function Track({ words }) {
  return (
    <div className="marquee__track">
      {[0, 1].map((copy) => (
        <ul key={copy} className="marquee__list">
          {words.map((w) => (
            <li key={w}>
              {w}
              <span className="marquee__star">✦</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

/** Two crossing "tape" bands used as a decorative transition between sections. */
export default function Marquee({ items, altItems }) {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__band marquee__band--back">
        <Track words={altItems ?? items} />
      </div>
      <div className="marquee__band marquee__band--front">
        <Track words={items} />
      </div>
    </div>
  );
}
