/**
 * PROFILE — personal details, contact links, and resume.
 *
 * Anything left as an empty string ("") is treated as "not provided yet":
 *  - Contact links render as a muted "Coming soon" row (not clickable).
 *  - Resume buttons stay hidden until `resumeUrl` is set.
 *
 * To add your resume: drop the PDF into /public (e.g. /public/resume.pdf)
 * and set resumeUrl: "/resume.pdf".
 */
export const profile = {
  name: "Keisha Layne L. Delgado",
  firstName: "Keisha",
  initials: "KLD",
  role: "Computer Science Student",
  title: "Aspiring Software Developer",
  university: "Xavier University – Ateneo de Cagayan",
  universityShort: "XU – Ateneo de Cagayan",

  // Short status line shown in the hero. Set to "" to hide it.
  availability: "Open to internships & opportunities",

  resumeUrl: "",

  contact: {
    email: "keishadelgado2560@gmail.com",
    linkedin: "https://www.linkedin.com/in/keisha-delgado-483339424/",
    github: "https://github.com/keishalaynedelgado",
  },

  // Extra professional links (portfolio, Behance, Devpost, etc.).
  // Example: { label: "Devpost", url: "https://devpost.com/..." }
  otherLinks: [],
};
