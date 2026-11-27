// Flame colours: outer layer, middle layer (3 stops each) and the hot core.
const PALETTES = {
  // The K Games card dragon's orange fire
  fire: {
    outer: ["#ffb347", "#ff7a2f", "#e8452a"],
    mid: ["#fff1a8", "#ffd24a", "#ff9a2f"],
    core: "#fffbe6",
  },
  // The intro dragon's blue-violet magic fire
  arcane: {
    outer: ["#b9a6ff", "#7b6cff", "#3f4fd8"],
    mid: ["#ffffff", "#a8dcff", "#8a7cff"],
    core: "#ffffff",
  },
};

/**
 * The dragon's fire: three layered flame shapes that blast to the right from
 * their left edge. `idPrefix` keeps the gradient ids unique when more than one
 * flame is on the page (the K Games card dragon and the intro dragon).
 * The flame classes are styled in FireDragon.css (flicker while firing).
 */
export default function Flame({ idPrefix = "fd-", palette = "fire" }) {
  const id = (name) => `${idPrefix}${name}`;
  const c = PALETTES[palette] ?? PALETTES.fire;
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id("outer")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c.outer[0]} />
          <stop offset="0.55" stopColor={c.outer[1]} />
          <stop offset="1" stopColor={c.outer[2]} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={id("mid")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c.mid[0]} />
          <stop offset="0.6" stopColor={c.mid[1]} />
          <stop offset="1" stopColor={c.mid[2]} />
        </linearGradient>
        <filter id={id("blur")} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <path
        className="fire-dragon__flame fire-dragon__flame--outer"
        d="M0 52 C60 30 120 18 200 14 C250 12 300 4 340 18 C380 30 400 50 392 62 C400 76 378 98 340 104 C300 114 250 108 200 106 C120 102 60 88 0 68 Z"
        fill={`url(#${id("outer")})`}
        filter={`url(#${id("blur")})`}
      />
      <path
        className="fire-dragon__flame fire-dragon__flame--mid"
        d="M0 55 C70 40 140 32 220 30 C270 30 320 28 350 42 C372 52 372 70 350 80 C320 92 270 92 220 90 C140 88 70 80 0 65 Z"
        fill={`url(#${id("mid")})`}
      />
      <path
        className="fire-dragon__flame fire-dragon__flame--core"
        d="M0 57 C80 50 160 46 240 48 C280 49 310 52 320 60 C310 68 280 72 240 72 C160 74 80 70 0 63 Z"
        fill={c.core}
      />
    </svg>
  );
}
