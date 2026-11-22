import type { ProjectProps } from '@/types/project.type'
import agentDetail from '@/assets/projects/agentdashboard/detail.webp'
import agentOverview from '@/assets/projects/agentdashboard/overview.webp'
import agentRecent from '@/assets/projects/agentdashboard/recent.webp'
import batteryDark from '@/assets/projects/battery/hero-dark.png'
import batteryLight from '@/assets/projects/battery/hero-light.png'
import batteryLow from '@/assets/projects/battery/low-dark.png'
import batterySetup from '@/assets/projects/battery/setup-dark.png'
import bullAccounts from '@/assets/projects/bull/settings-accounts.webp'
import bullChat from '@/assets/projects/bull/chat.webp'
import bullOverview from '@/assets/projects/bull/overview.webp'
import bullUsage from '@/assets/projects/bull/usage.webp'
import forgeDimensions from '@/assets/projects/forge/dimensions.webp'
import forgeDrawing from '@/assets/projects/forge/drawing.webp'
import forgeJobs from '@/assets/projects/forge/jobs.webp'
import forgePart from '@/assets/projects/forge/part.webp'
import mellowDashboard from '@/assets/projects/mellow/dashboard.webp'
import mellowPomodoro from '@/assets/projects/mellow/pomodore.webp'
import mellowSettings from '@/assets/projects/mellow/settings.webp'
import mellowTodos from '@/assets/projects/mellow/todos.webp'
import notaMarkup from '@/assets/projects/nota/markup.webp'
import notaReview from '@/assets/projects/nota/review.webp'
import notaThread from '@/assets/projects/nota/thread.webp'
import tokenscopeDashboard from '@/assets/projects/tokenscope/dashboard.webp'
import tokenscopeSettings from '@/assets/projects/tokenscope/einstellungen.webp'
import tokenscopeUsage from '@/assets/projects/tokenscope/verbrauch.webp'
import trackiDashboard from '@/assets/projects/tracki/dashboard.png'
import trackiCalculator from '@/assets/projects/tracki/fitnesscalculater.png'
import trackiSettings from '@/assets/projects/tracki/settings.png'
import trackiWorkout from '@/assets/projects/tracki/workout.png'
import worldFeedback from '@/assets/projects/worldgame/feedback.webp'
import worldMenu from '@/assets/projects/worldgame/menu.webp'
import worldQuiz from '@/assets/projects/worldgame/quiz.webp'
import worldResult from '@/assets/projects/worldgame/result.webp'

const GITHUB_OWNER = 'https://github.com/nexron-studios'

/**
 * Featured NEXRON projects.
 *
 * Everything here is taken from the repositories themselves (GitHub API +
 * README). `challenges` and `learnings` are intentionally left empty — they
 * are the one part no repository can tell us, so Jonas fills them in rather
 * than having something plausible invented for him.
 */
export const projects: ProjectProps[] = [
  {
    slug: 'bull',
    name: 'NEXRON Bull',
    tagline: 'Claude Code sessions as chats in tabs, on every account and every machine.',
    categories: ['desktop', 'ai', 'tools'],
    stack: ['Tauri', 'Rust', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'SSH'],
    year: 2026,
    visibility: 'public',
    repoUrl: `${GITHUB_OWNER}/NEXRON-Bull`,
    liveUrl: `${GITHUB_OWNER}/NEXRON-Bull/releases/latest`,
    status: 'shipped',
    shots: [
      { src: bullChat, label: 'A chat waiting for approval' },
      { src: bullOverview, label: 'Overview of every machine and a year of activity' },
      { src: bullUsage, label: 'Quota per account and tokens per day' },
      { src: bullAccounts, label: 'Accounts on this computer and on another machine' }
    ],
    shotOrientation: 'landscape',
    detail: {
      overview:
        'A desktop app that shows your Claude Code sessions as chats in tabs. Each tab runs the real Claude Code under the account you pick, on this PC or on another machine over SSH. Approvals, questions and plans become buttons, and every tool call shows up as it happens.',
      problem:
        'Claude Code lives in the terminal. With several sessions, several accounts and a second machine you lose track of which one is waiting for you and which account still has quota left.',
      idea: 'One window for all of it: a chat per session, the account picked per chat, and other machines connected over SSH, where Claude keeps running when the app closes.',
      implementation:
        'Tauri 2 with a Rust core that runs Claude Code headless and streams its output into the chat. Vue 3 renders Markdown, diffs and tool calls. Every Claude profile on disk can be an account, and when one hits its limit the chat moves to another account with its session. On other Windows machines a setup assistant installs a small agentd that keeps the sessions alive.',
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'weltenbummler',
    name: 'Weltenbummler',
    tagline: 'Learning geography on a 3D globe: German states, countries, continents and seas.',
    categories: ['web', '3d'],
    stack: ['Vue 3', 'TypeScript', 'globe.gl', 'Three.js', 'Tailwind CSS', 'Pinia', 'Vite'],
    year: 2026,
    visibility: 'private',
    repoUrl: null,
    liveUrl: null,
    status: 'shipped',
    shots: [
      { src: worldMenu, label: 'Start screen with the globe' },
      { src: worldQuiz, label: 'Quiz: what is lit up?' },
      {
        src: worldFeedback,
        label: 'Feedback after an answer'
      },
      { src: worldResult, label: 'Result of a round' }
    ],
    shotOrientation: 'landscape',
    detail: {
      overview:
        'A geography learning game. You turn a 3D globe and learn it country by country, sea by sea: the 16 German states, every country in Europe and the world, the continents and the oceans.',
      problem:
        'Map quizzes on the web are either flat and dull or full of ads. And none of them remembers what you already know.',
      idea: 'Four ways to play on a real globe: find, choose, type and explore freely. Progress stays on your own machine as a file.',
      implementation:
        'Vue 3 and TypeScript, the globe with globe.gl on Three.js. Map data comes from Natural Earth and a script builds it into compact JSON files. Flags and the state coats of arms are openly licensed.',
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'battery-widget',
    name: 'Battery Widget',
    tagline: 'The exact battery level of AirPods and iPhone as a small widget on Windows.',
    categories: ['desktop', 'tools'],
    stack: ['Tauri', 'Rust', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'Bluetooth LE'],
    year: 2026,
    visibility: 'public',
    repoUrl: `${GITHUB_OWNER}/NEXRON-airpods-battery-windows`,
    liveUrl: `${GITHUB_OWNER}/NEXRON-airpods-battery-windows/releases/latest`,
    status: 'shipped',
    shots: [
      { src: batteryLight, label: 'Widget in light mode' },
      { src: batteryDark, label: 'Widget in dark mode' },
      { src: batteryLow, label: 'Low battery warning' },
      {
        src: batterySetup,
        label: 'Before the keys are set up'
      }
    ],
    shotOrientation: 'landscape',
    detail: {
      overview:
        'A small always-on-top widget that shows the exact battery level of the left and right AirPod, the case and the iPhone. Like the battery widget on iOS, only on Windows 10 and 11.',
      problem:
        'Windows does not know the battery level of AirPods at all. Current firmware no longer sends it in plain text, so other tools only show 0 % or rough steps of ten.',
      idea: 'The real values are still in the Bluetooth advert, encrypted with a key from your own Apple account. With that key they can be decrypted locally.',
      implementation:
        'Tauri 2 with a Rust core: a BLE scanner on the Windows API, AES decryption of the AirPods packets, and every Bluetooth device whose battery Windows already knows. Vue 3 draws the rings and the rendered 3D models. No network access, the keys never leave the PC.',
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'tokenscope',
    name: 'NEXRON-TokenScope',
    tagline: 'Local dashboard for the remaining Claude Code and Codex usage quotas.',
    categories: ['tools', 'fullstack', 'desktop'],
    stack: ['Vue 3', 'TypeScript', 'FastAPI', 'Python', 'Tauri', 'Rust', 'SQLite'],
    year: 2026,
    visibility: 'public',
    repoUrl: `${GITHUB_OWNER}/NEXRON-TokenScope`,
    liveUrl: null,
    status: 'shipped',
    shots: [
      { src: tokenscopeDashboard, label: 'Dashboard' },
      { src: tokenscopeUsage, label: 'Usage' },
      { src: tokenscopeSettings, label: 'Settings' }
    ],
    shotOrientation: 'landscape',
    detail: {
      overview:
        'A small FastAPI service reads the usage data that Claude Code and Codex already keep on disk, normalises it and serves it through its own API. The Vue frontend only ever talks to that backend, never directly to a provider and never to a token.',
      problem:
        'Both CLIs consume quota, but neither reliably shows how much is left or when it resets.',
      idea: 'A permanently visible kiosk display instead of yet another browser tab. The target device is a Raspberry Pi with a 7" touchscreen at 1024 × 600, and it runs on a desktop just as well.',
      implementation:
        'Poller, cache and SQLite in the FastAPI backend, which listens on 127.0.0.1 only. Data comes from two sources: the OAuth usage endpoints for remaining quota and reset time, plus both CLIs’ local JSONL logs for per-project and per-model consumption. If the endpoint fails, fresh rate_limits from the Codex rollout logs act as a fallback. Tauri wraps it all as a desktop app.',
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'agent-dashboard',
    name: 'NEXRON Agent Dashboard',
    tagline: 'Live overview of every Claude Code session running on your machine.',
    categories: ['desktop', 'tools', 'ai'],
    stack: ['Tauri', 'Rust', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'Python'],
    year: 2026,
    visibility: 'public',
    repoUrl: `${GITHUB_OWNER}/NEXRON-agentdashboard`,
    liveUrl: null,
    status: 'building',
    shots: [
      { src: agentOverview, label: 'Running sessions as cards' },
      { src: agentDetail, label: 'Detail view of a session' },
      { src: agentRecent, label: 'Recent sessions, grouped by day' }
    ],
    shotOrientation: 'landscape',
    detail: {
      overview:
        'A desktop app that shows every running Claude Code session as a card: whether it is working, done or waiting for approval, the first and latest prompt, the last step, running subagents and how full the context window is. A detail view lists every prompt, tool usage, tokens per model and a timeline.',
      problem:
        'With several Claude Code sessions open at once you keep clicking through terminal tabs just to find the one that is waiting for you.',
      idea: 'One window next to the terminal that answers "who needs me?" at a glance, and one click that takes you straight to that session: its terminal tab, its VS Code window or its project folder.',
      implementation:
        'Tauri 2 with a Rust core that reads Claude Code’s own files and never writes to them: live sessions from each profile’s session files, content from the JSONL transcripts, read incrementally so polling every two seconds stays cheap. Multiple Claude accounts are told apart by colour, and herdr tabs are matched by process ID. Vue 3 and Tailwind on the front. A dependency-free Python version runs in the terminal.',
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'forge',
    name: 'NEXRON Forge',
    tagline: 'Photo of a technical drawing in, printable part out.',
    categories: ['ai', '3d', 'fullstack'],
    stack: ['Vue 3', 'NestJS', 'Python', 'Blender', 'TypeScript', 'SQLite', 'Claude Code'],
    year: 2026,
    visibility: 'private',
    repoUrl: null,
    liveUrl: null,
    status: 'building',
    shots: [
      { src: forgePart, label: 'Finished part with every checked dimension in 3D' },
      { src: forgeDimensions, label: 'Confirming the dimensions Claude read from the sketch' },
      { src: forgeDrawing, label: 'The hand-drawn sketch next to the rendered part' },
      { src: forgeJobs, label: 'All parts with where the work stands' }
    ],
    shotOrientation: 'landscape',
    detail: {
      overview:
        'A small self-hosted web app. You photograph a hand-drawn technical drawing, Claude reads the dimensions, you confirm them, and the part is built in Blender. You get an STL, a 3D view with the dimensions drawn in, and renders.',
      problem:
        'Turning a quick sketch with a few dimensions into a printable part means an hour in CAD, for something you could describe in two sentences.',
      idea: 'Let Claude read the drawing and write the model as code, then measure the result against the dimensions you confirmed. Green means measured on the model and matching.',
      implementation:
        'A Vue 3 PWA in front, NestJS with SQLite and a job queue behind it, and a Python pipeline doing the work. Claude Code runs headless and writes a Blender script for each part. The pipeline checks that script before it runs, builds the part in Blender, measures the STL against the confirmed values to 0.1 mm and renders it. Anything off goes back to the same Claude session, for at most three rounds of fixes.',
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'nota',
    name: 'NEXRON Nota',
    tagline: 'Review PDFs in VS Code and hand every comment to Claude with its exact LaTeX line.',
    categories: ['tools', 'ai'],
    stack: ['TypeScript', 'VS Code API', 'pdf.js', 'SyncTeX', 'LaTeX', 'esbuild'],
    year: 2026,
    visibility: 'private',
    repoUrl: null,
    liveUrl: null,
    status: 'shipped',
    shots: [
      { src: notaReview, label: 'Highlights in four colours, each with its LaTeX line' },
      { src: notaThread, label: 'Claude answers and a rewritten passage marked green' },
      { src: notaMarkup, label: 'Selecting text opens colours, strike and comment' }
    ],
    shotOrientation: 'landscape',
    detail: {
      overview:
        'A PDF viewer for VS Code where you highlight and comment like in Acrobat. One click hands every open comment to Claude Code, each with the LaTeX file and line it belongs to. Claude’s answers and changes come back into the same sidebar.',
      problem:
        'Reviewing a LaTeX document with Claude was a loop: upload the PDF, comment in the browser, download it, then tell Claude where each comment belongs.',
      idea: 'Comment right at the text, in the editor you already write in, and let the tool find the source line. Highlights come in four colours with a fixed meaning: note, error, question and fine.',
      implementation:
        'A VS Code extension with a pdf.js webview, in strict TypeScript. SyncTeX maps a selection to its LaTeX line, which is then narrowed to where the marked text really starts. Comments live in a JSON file next to the PDF, and Claude answers in it directly. After a rebuild every highlight is found again by its text, and passages Claude rewrote are marked green.',
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'mellow',
    name: 'NEXRON-mellow',
    tagline: 'Lightweight local time tracker for tasks, sessions and notes.',
    categories: ['desktop', 'tools'],
    stack: ['Tauri', 'Vue 3', 'TypeScript', 'Rust', 'Tailwind CSS', 'shadcn-vue', 'Pinia'],
    year: 2026,
    visibility: 'public',
    repoUrl: `${GITHUB_OWNER}/NEXRON-mellow`,
    liveUrl: null,
    status: 'shipped',
    shots: [
      { src: mellowDashboard, label: 'Dashboard' },
      { src: mellowTodos, label: 'Tasks' },
      { src: mellowPomodoro, label: 'Pomodoro timer' },
      { src: mellowSettings, label: 'Settings' }
    ],
    shotOrientation: 'landscape',
    detail: {
      overview:
        'Manage tasks, track work sessions, add manual time entries and write notes in Markdown. All data stays local, the app is multilingual and keeps active and completed tasks clearly separated.',
      problem:
        'Time tracking that lives in the cloud and needs a subscription is far too much machinery for tracking your own work.',
      idea: 'Build a tool for personal use: fast, offline, no account.',
      implementation:
        'Tauri shell with a Rust core, fronted by Vue 3 with one Pinia store per domain (tasks, timer, pomodoro, settings) and shadcn-vue as the UI base. Includes a Pomodoro timer with its own statistics plus a Markdown editor and preview.',
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'tracki',
    name: 'NEXRON-Tracki',
    tagline: 'Fitness tracking as a full-stack application, prepared as a PWA.',
    categories: ['fullstack', 'web'],
    stack: ['Vue 3', 'Tailwind CSS', 'shadcn-vue', 'vue-router', 'NestJS', 'PostgreSQL', 'Docker'],
    year: 2025,
    visibility: 'private',
    repoUrl: null,
    liveUrl: null,
    status: 'shipped',
    shots: [
      { src: trackiDashboard, label: 'Dashboard' },
      { src: trackiWorkout, label: 'Workout' },
      { src: trackiCalculator, label: 'Fitness calculator' },
      { src: trackiSettings, label: 'Settings' }
    ],
    shotOrientation: 'portrait',
    detail: {
      overview:
        'Modern fitness tracking web app with authentication and CRUD features, prepared as a Progressive Web App for mobile and desktop.',
      problem:
        'The largest of the projects. The point here was keeping frontend, API and database cleanly separated while still running them as one product.',
      idea: 'Carry a complete full-stack application all the way from database to installable app.',
      implementation:
        'Vue 3 with Tailwind, shadcn-vue and vue-router on the frontend; NestJS with PostgreSQL on the backend; Docker for running it.',
      challenges: [],
      learnings: []
    }
  }
]

export const getProjectBySlug = (slug: string): ProjectProps | undefined =>
  projects.find((project) => project.slug === slug)
