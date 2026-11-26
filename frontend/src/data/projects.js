/**
 * PROJECTS — add a new object to this array to publish a new project.
 * Cards render in array order and alternate their layout automatically.
 *
 * Fields
 *  id          unique slug (used for keys and anchors)
 *  title       project name
 *  category    short label, e.g. "Test Automation"
 *  tagline     one punchy line shown above the summary (optional)
 *  summary     one or two sentences shown on the card
 *  details     array of { heading, body } shown when the card is expanded
 *  focus       capability / theme tags (what the project does)
 *  tech        technologies used; leave [] if not listed yet (row is hidden)
 *  screens     real screenshots, shown in a browser frame with tabs:
 *                { src, label, alt, scroll }  — scroll: true for tall full-page captures
 *                that glide down on hover. Put files in /public/projects.
 *  showcase    optional gallery under the card: { title, intro, items: [{ src, title, caption }] }
 *  visual      fallback illustration when there are no screens: "automation" | "chat" | "generic"
 *  mascot      optional animated character: "dragon" (the K Games dragon, flies around the card)
 *              or "bread" (a walking slice of bread on top of the screenshot frame)
 *  links       optional { repo, demo } URLs; empty values are hidden
 */
export const projects = [
  {
    id: "ks-playwright",
    title: "K's Playwright",
    category: "AI Test Automation",
    tagline: "An AI agent that tests a chatbot, so people don't have to.",
    summary:
      "A Playwright-based testing agent that automates website testing and chatbot evaluation. An LLM decides each browser action, Playwright performs it through a small set of approved tools, and every chatbot answer is checked against the expected result. Each run produces an evidence-backed test report.",
    details: [
      {
        heading: "Purpose",
        body: "Automate regression testing of an AI chatbot: ask it questions, validate its answers against expected results, and keep a searchable history of every run.",
      },
      {
        heading: "How the agent works",
        body: "The LLM picks the next browser action and Playwright carries it out using only approved tools (open chat, new chat, send message). Answers are verified with explicit Playwright assertions, then an AI judge gives a verdict and a reason.",
      },
      {
        heading: "Dashboard",
        body: "A web dashboard to write tests (question, expected result, must-contain checks), group them into regression folders, run them with live progress, and review past results in Backtracking.",
      },
      {
        heading: "Tests from files",
        body: "Upload spreadsheets, JSON, PDF, Word or text files. Spreadsheets become test cases directly, and other documents are turned into proposed tests for review. Supports multi-question conversations in the same chat.",
      },
      {
        heading: "Built to be safe",
        body: "Information-only scope: the agent can press just three buttons and type only into the chat box. The dashboard has sign-in, lockout after repeated failed logins, and optional sharing over an HTTPS tunnel.",
      },
    ],
    focus: ["LLM-driven agent", "Chatbot evaluation", "AI judge", "Regression suites", "Test reports"],
    tech: ["Playwright", "Node.js", "JavaScript", "PostgreSQL", "LLM API", "HTML & CSS"],
    screens: [
      {
        src: "/projects/playwright-dashboard-full.webp",
        label: "Dashboard",
        alt: "K's Playwright regression dashboard with the test table, file upload panel and past test runs",
        scroll: true,
      },
      {
        src: "/projects/playwright-login.webp",
        label: "Sign in",
        alt: "K's Playwright sign-in page",
      },
    ],
    visual: "automation",
    links: { repo: "https://github.com/keishalaynedelgado/Playwright", demo: "" },
  },
  {
    id: "k-games",
    title: "K Games",
    category: "AI-Powered Game Creation Chatbot",
    tagline: "Describe a game. A team of AI agents builds it.",
    summary:
      "An AI-powered chatbot that lets people generate games just by describing the kind of game they want. Behind the chat, cooperating agents design, build and test a complete web game you can play, download, or install as an app.",
    details: [
      {
        heading: "Purpose",
        body: "Make game creation more accessible, so people can express ideas in natural language instead of writing all of the code by hand.",
      },
      {
        heading: "Multi-agent pipeline",
        body: "An intent agent routes every message: a Designer asks only for missing details, a Planner writes a Game Design Summary to confirm, and a Builder and Asset agent write the full project with placeholder art and synthesized audio.",
      },
      {
        heading: "Built-in QA",
        body: "Every generated JavaScript file is syntax-checked and its imports are resolved. Broken code goes back to the builder for repair, while a live planning feed shows each build step as it runs.",
      },
      {
        heading: "Real, versioned projects",
        body: "Each game is an organized multi-file project, saved as a new version on every improvement, with a sandboxed live preview and a one-click project download.",
      },
      {
        heading: "Export as an app",
        body: "Games export to Android (APK), Windows (EXE and installer), iPhone and iPad, and Mac, each with an app icon the AI designs from the game itself.",
      },
    ],
    focus: ["AI integration", "Multi-agent system", "Conversational interface", "Game generation", "App export"],
    tech: ["Node.js", "JavaScript", "HTML & CSS", "PostgreSQL", "LLM API", "Server-Sent Events"],
    screens: [
      {
        src: "/projects/kgames-landing-full.webp",
        label: "Landing page",
        alt: "K Games landing page: 'Build playable games by chatting' with a sample design conversation",
        scroll: true,
      },
      {
        src: "/projects/kgames-chat.webp",
        label: "Chat app",
        alt: "K Games chat app with the dragon mascot asking 'What game are we building?'",
      },
    ],
    showcase: {
      title: "Made with K Games",
      intro: "Real games generated by the chatbot from plain-language descriptions.",
      items: [
        { src: "/projects/game-rooftop.webp", title: "Rooftop Escape", caption: "Side-scrolling action platformer" },
        { src: "/projects/game-flappy.webp", title: "Flappy Bird", caption: "Tap to fly through the pipes" },
        { src: "/projects/game-fruit.webp", title: "Fruit Catcher", caption: "Catch fresh fruit, dodge the rotten" },
        { src: "/projects/game-word.webp", title: "Letter Lock", caption: "Timed word puzzle" },
        { src: "/projects/game-chess.webp", title: "Chess vs Computer", caption: "Board game with difficulty levels" },
      ],
    },
    visual: "chat",
    mascot: "dragon",
    links: { repo: "https://github.com/keishalaynedelgado/Gaming_Chatbot", demo: "" },
  },
  {
    id: "synthie",
    title: "Synthie AI",
    category: "Database-Grounded AI Chatbot",
    tagline: "Ask the database anything, except the password.",
    summary:
      "A conversational assistant connected live to a task management database. It answers questions about tasks, people and deadlines from real PostgreSQL records. Every message first passes safety guardrails, so passwords, card numbers and prompt-injection attempts never reach the AI model.",
    details: [
      {
        heading: "Purpose",
        body: "Let teams ask about their work in plain language, like \"What's overdue?\" or \"Show the DevOps tasks\", and get answers built from the live database instead of guesses.",
      },
      {
        heading: "Guardrails first",
        body: "Every message is checked before the AI sees it. Harmful content and prompt-injection attempts are blocked, sensitive terms like passwords, card numbers and SSNs are refused, and personal details such as emails and phone numbers are masked.",
      },
      {
        heading: "Grounded, never invented",
        body: "An intent router decides whether a question needs the database, the document knowledge base, or neither. Ask about one department and only that department's records are used. If the data isn't there, it says so.",
      },
      {
        heading: "Document knowledge base",
        body: "Upload PDF, Word or text files. They are guardrail-checked, split into chunks and embedded locally, with no external API, so answers can draw on company documents.",
      },
      {
        heading: "Report autofill",
        body: "Ask it to fill a PowerPoint template with a person's information and it maps the placeholders to database fields, then adds a chart slide of their task status. The AI model isn't used for this step, so the document can't be hallucinated.",
      },
      {
        heading: "Long conversations",
        body: "Messages older than the last 20 are summarized rather than dropped. It switches between several AI providers and falls back to a built-in offline engine.",
      },
    ],
    focus: ["Database-grounded AI", "Safety guardrails", "PII masking", "Document knowledge base", "Report automation"],
    tech: ["Node.js", "Express", "React", "PostgreSQL", "Vercel AI SDK", "Server-Sent Events", "Tailwind CSS"],
    screens: [
      {
        src: "/projects/synthie-welcome.webp",
        label: "Chat",
        alt: "Synthie AI welcome screen with starter prompts for pending tasks, team workload and task progress",
      },
      {
        src: "/projects/synthie-guardrail.webp",
        label: "Guardrails",
        alt: "Synthie AI blocking the question 'What is the admin password?' because it contains a forbidden term",
      },
    ],
    visual: "chat",
    mascot: "bread",
    links: { repo: "https://github.com/keishalaynedelgado/Chatbot", demo: "" },
  },
  {
    id: "task-management-system",
    title: "Task Management System",
    category: "Full-Stack Web App",
    tagline: "One workspace, many teams, clear boundaries.",
    summary:
      "A multi-tenant task management system with role-based access control. Teams create, assign and track tasks in a table or on a Kanban board, each organization's data stays separate, and Synthie AI is built in to answer questions from the live database.",
    details: [
      {
        heading: "Purpose",
        body: "Give each organization (tenant) its own workspace to plan, assign and follow work from pending to done.",
      },
      {
        heading: "Roles & tenants",
        body: "JWT sign-in with three roles: a Super Admin manages every tenant, an Admin manages their own tenant's users and tasks, and Staff see and update only the tasks assigned to them. The server enforces these rules, not just the interface.",
      },
      {
        heading: "Task tools",
        body: "A task table with search, status filters and pagination, a Kanban board grouped by status with priority colors and due dates, and screens to manage users and tenants.",
      },
      {
        heading: "AI assistant & reports",
        body: "Synthie AI is built in and grounded on the same PostgreSQL data, scoped to what the signed-in user's role is allowed to see. A Reports page adds period analytics and AI-written summaries.",
      },
      {
        heading: "Details that matter",
        body: "Light, dark and system themes, validation on both the client (Zod) and the server (Joi), and clear loading and empty states.",
      },
    ],
    focus: ["Multi-tenant", "Role-based access", "Kanban board", "AI assistant", "Reports"],
    tech: ["React", "Express", "PostgreSQL", "Sequelize", "JWT", "Tailwind CSS", "shadcn/ui", "TanStack Query"],
    screens: [
      {
        src: "/projects/tms-board.webp",
        label: "Task board",
        alt: "Kanban task board with Pending, In Progress, Completed and Cancelled columns",
      },
      {
        src: "/projects/tms-tasks.webp",
        label: "Tasks",
        alt: "Task table with search, status filter, priority badges and due dates",
      },
      {
        src: "/projects/tms-assistant.webp",
        label: "Assistant",
        alt: "Synthie AI inside the task manager, marked as PostgreSQL grounded, with suggested questions",
      },
    ],
    visual: "generic",
    links: { repo: "https://github.com/keishalaynedelgado/task-management-system", demo: "" },
  },
];

/** Show the "more projects on the way" card at the end of the list. */
export const showUpcomingSlot = true;
