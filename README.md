# Keisha Layne L. Delgado — Portfolio

Personal portfolio: a React + Vite **frontend** and a small, dependency-free Node **backend** that serves it in production.

## Project layout

```
frontend/                 the website (React + Vite)
  index.html
  vite.config.js
  public/                 static files served as-is
    favicon.svg
    projects/             project screenshots (WebP)
  src/
    main.jsx  App.jsx
    components/           one folder per section (JSX + CSS side by side)
      Preloader/          intro curtain (once per visit)
      Cursor/             custom cursor + magnetic buttons (desktop only)
      Navbar/ Hero/ Marquee/ About/ Projects/ Skills/ Leadership/ Contact/ Footer/
      ui/                 shared pieces: Reveal, SectionHeading, Lightbox, Scramble, Icons
    data/                 ALL editable content lives here
    hooks/                useInView, useActiveSection, useScrollProgress
    styles/global.css     design tokens (palette, fonts, spacing), buttons, utilities
backend/
  server.js               production server: serves frontend/dist, /api/health
package.json              one root package.json runs everything
```

## Run it

```bash
npm install
npm run dev       # develop: http://localhost:5173 (hot reload)
npm run build     # production build -> frontend/dist
npm start         # serve the build with the backend: http://localhost:3000 (PORT to change)
npm run serve     # build + start in one go
```

### Deploying
- **Static hosting** (Netlify, Vercel, GitHub Pages, Cloudflare Pages): build command `npm run build`, publish directory `frontend/dist`. The backend isn't needed.
- **Node hosting** (Render, Railway, a VPS): build `npm run build`, start `npm start`. Health check: `GET /api/health`.

## Updating content

You don't need to touch any components. All text lives in `frontend/src/data/`:

| File | What it controls |
| --- | --- |
| `profile.js` | Name, university, availability line, **email / LinkedIn / GitHub**, extra links, **resume** |
| `projects.js` | Project cards, screenshots and the "Made with K Games" gallery |
| `skills.js` | Skill groups and tiles in the "periodic table" |
| `experience.js` | Leadership & organization timeline |
| `navigation.js` | Navbar / footer section links |

### Add your LinkedIn
Set `contact.linkedin` in `profile.js` to your full profile URL.

### Add your resume
1. Put the PDF in `frontend/public/`, for example `frontend/public/resume.pdf`.
2. Set `resumeUrl: "/resume.pdf"` in `profile.js`.

Download buttons then appear in the navbar, the hero, and the contact section.

### Add a project
Copy a project object in `projects.js` and edit it.
- `screens` are real screenshots shown in a browser frame with tabs. Add `scroll: true` to a tall full-page capture and it scrolls itself on hover. Clicking any screenshot opens it full size.
- `showcase` adds an optional gallery under the card, like "Made with K Games".
- `tech` lists the technologies used. If it's empty, the "Built with" row is hidden.
- `links.repo` / `links.demo` add "View code" and "Live demo" links when filled in.
- With no `screens`, the card falls back to an illustration (`visual`: `"automation"`, `"chat"` or `"generic"`).

Set `showUpcomingSlot = false` to hide the "Next project loading…" card.

### Screenshots
The current screenshots were captured from the real apps in `E:\Playwright`, `E:\Chatbot`, `E:\Chatbot Tool Use` (Synthie) and `E:\task-management-system`, served locally without their backends:
- K's Playwright and K Games: data requests were stubbed with empty responses, so those screens show their normal empty states.
- Synthie "Guardrails": the reply comes from running the project's own `backend/src/guardrails.js` on the message.
- Task Management System: the tasks are the fixed tasks from `backend/scripts/seedDb.js`, shown without assignees so the seed's people's names stay off the public site.

No data is made up. Save new screenshots as `.webp` (or `.png`) in `frontend/public/projects/`.

## Interactive details
- Intro curtain with your name and a counter. It plays once per browser session.
- The hero dot grid reacts to the cursor, and a click sends a ripple through it.
- Custom cursor with "View" / "Play" labels, plus magnetic buttons (mouse only).
- Screenshot frames scroll on hover, and a lightbox has keyboard controls (Esc, ← →).
- The K Games dragon (from the K Games project's own artwork, `mascot: "dragon"` in `projects.js`) flies in over the K Games screenshot, flaps its wings and breathes fire every few seconds. Clicking it fires a bigger blast. The art in `components/Projects/FireDragon/dragon.svg` was generated from `E:\Chatbot\frontend\src\dragon.js` ("fire" pose).

All of these switch off when the visitor's system asks for reduced motion, and on touch devices the native cursor stays.

Palette: `#EFECE3` paper, `#8FABD4` sky, `#4A70A9` blue, `#000000` ink. Two darker blues
(`--blue-ink`, `--blue-deep`) are used where blue sits behind or under small text, to keep it at WCAG AA contrast.
