/**
 * EXPERIENCE & LEADERSHIP — newest first.
 * Optional photo: { src, alt, caption } (put the image in /public/experience).
 * Add an entry by copying an object below.
 */
export const experience = [
  {
    id: "meldcx-ojt",
    period: "Aug 2026 – Present",
    organization: "MeldCX",
    location: "On-the-job training (OJT)",
    roles: ["Web Developer Intern"],
    photo: {
      src: "/experience/meldcx-ojt.webp",
      alt: "Group photo on a couch at the MeldCX office during my OJT, with MeldCX coffee cups on the table",
      caption: "At the MeldCX office during my OJT",
    },
    responsibilities: [
      "Built K Games, a chatbot where a team of AI agents turns a plain-language idea into a playable browser game.",
      "Developed Synthie AI, a company chatbot grounded on a live PostgreSQL database, with safety guardrails, conversation summarization, and Tool Use, Planning, Reflection and Multi-agent versions.",
      "Built an IoT MCP server (Node.js, Express, Streamable HTTP) that exposes site, device and sensor data from the Viana API, with API-key auth and request logging.",
      "Built the MCP Portal, a React dashboard to manage, test and monitor the MCP server: tool playground, API keys, request logs and integrations.",
      "Created AI agents on the Eve framework that answer questions about sites, devices and sensors through the MCP server.",
      "Automated testing with K's Playwright, an AI agent that runs chatbot regression tests and judges every answer.",
    ],
  },
  {
    id: "devcon-cdo",
    period: "2025 – 2026",
    organization: "DEVCON Cagayan de Oro",
    location: "",
    roles: ["Program Coordinator", "Event Host"],
    responsibilities: [
      "Coordinated workshop schedules and program activities to ensure smooth event execution.",
      "Served as an event host, engaging with participants and maintaining a welcoming and positive atmosphere.",
    ],
  },
  {
    id: "gdsc-xu",
    period: "2023 – 2024",
    organization: "Google Developer Student Clubs (GDSC)",
    location: "Xavier University – Ateneo de Cagayan",
    roles: ["Back-End Officer", "Project Head"],
    responsibilities: [
      "Project Head of “Scratch That! Reverse It! Unveiling the World of Scratch Programming” (April 2024).",
      "Prepared project and budget proposals for organizational initiatives.",
      "Coordinated project planning and task assignments.",
      "Collaborated with officers to support decision-making and project execution.",
      "Presented project proposals during organizational planning meetings.",
    ],
  },
];
