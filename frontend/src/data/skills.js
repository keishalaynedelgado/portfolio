/**
 * SKILLS — presented as a "periodic table" of tools.
 * Add a skill by appending { name, symbol } to a group's `items`.
 * `symbol` is the short 1–3 letter code shown large on the tile.
 */
export const skillGroups = [
  {
    id: "languages",
    label: "Programming Languages",
    short: "Languages",
    items: [
      { name: "Python", symbol: "Py" },
      { name: "Java", symbol: "Jv" },
      { name: "JavaScript", symbol: "Js" },
      { name: "PHP", symbol: "Php" },
      { name: "JSX", symbol: "Jsx" },
      { name: "HTML", symbol: "Ht" },
      { name: "CSS", symbol: "Cs" },
    ],
  },
  {
    id: "frameworks",
    label: "Frameworks & Libraries",
    short: "Frameworks",
    items: [
      { name: "React.js", symbol: "Re" },
      { name: "Node.js", symbol: "No" },
      { name: "Express.js", symbol: "Ex" },
    ],
  },
  {
    id: "tools",
    label: "Tools & Technologies",
    short: "Tools",
    items: [
      { name: "Git", symbol: "Gt" },
      { name: "Docker", symbol: "Dk" },
      { name: "Figma", symbol: "Fg" },
      { name: "Cisco Packet Tracer", symbol: "Pt" },
      { name: "XAMPP", symbol: "Xp" },
      { name: "Wireshark", symbol: "Ws" },
      { name: "Ollama", symbol: "Ol" },
    ],
  },
  {
    id: "databases",
    label: "Databases",
    short: "Databases",
    items: [
      { name: "MySQL", symbol: "My" },
      { name: "Supabase", symbol: "Sb" },
      { name: "PostgreSQL", symbol: "Pg" },
    ],
  },
];
