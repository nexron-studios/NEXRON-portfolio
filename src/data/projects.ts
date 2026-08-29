import type { ProjectProps } from '@/types/project.type'

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
    slug: 'spw-sport',
    name: 'SPW Sport App',
    tagline: {
      de: 'Fitness-Tracking als Full-Stack-Anwendung, vorbereitet als PWA.',
      en: 'Fitness tracking as a full-stack application, prepared as a PWA.'
    },
    categories: ['fullstack', 'web'],
    stack: ['Vue 3', 'Tailwind CSS', 'shadcn-vue', 'vue-router', 'NestJS', 'PostgreSQL', 'Docker'],
    year: 2025,
    visibility: 'private',
    repoUrl: null,
    liveUrl: null,
    status: 'shipped',
    image: null,
    detail: {
      overview: {
        de: 'Moderne Fitness-Tracking-Web-App mit Authentifizierung und CRUD-Funktionen, als Progressive Web App für Mobil und Desktop vorbereitet.',
        en: 'Modern fitness tracking web app with authentication and CRUD features, prepared as a Progressive Web App for mobile and desktop.'
      },
      problem: {
        de: 'Das größte der Projekte — hier ging es darum, Frontend, API und Datenbank sauber getrennt und trotzdem als ein Produkt zu betreiben.',
        en: 'The largest of the projects — the point here was keeping frontend, API and database cleanly separated while still running them as one product.'
      },
      idea: {
        de: 'Eine vollständige Full-Stack-Anwendung von der Datenbank bis zur installierbaren App durchziehen.',
        en: 'Carry a complete full-stack application all the way from database to installable app.'
      },
      implementation: {
        de: 'Vue 3 mit Tailwind, shadcn-vue und vue-router im Frontend; NestJS mit PostgreSQL im Backend; Docker für den Betrieb.',
        en: 'Vue 3 with Tailwind, shadcn-vue and vue-router on the frontend; NestJS with PostgreSQL on the backend; Docker for running it.'
      },
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'tokenscope',
    name: 'NEXRON-TokenScope',
    tagline: {
      de: 'Lokales Dashboard für die verbleibenden Kontingente von Claude Code und Codex.',
      en: 'Local dashboard for the remaining Claude Code and Codex usage quotas.'
    },
    categories: ['tools', 'fullstack', 'desktop'],
    stack: ['Vue 3', 'TypeScript', 'FastAPI', 'Python', 'Tauri', 'Rust', 'SQLite'],
    year: 2026,
    visibility: 'public',
    repoUrl: `${GITHUB_OWNER}/NEXRON-TokenScope`,
    liveUrl: null,
    status: 'building',
    image: null,
    detail: {
      overview: {
        de: 'Ein kleiner FastAPI-Dienst liest die Nutzungsdaten, die Claude Code und Codex ohnehin lokal auf der Platte halten, normalisiert sie und liefert sie über eine eigene API aus. Das Vue-Frontend spricht ausschließlich mit diesem Backend — nie direkt mit einem Anbieter, nie mit einem Token.',
        en: 'A small FastAPI service reads the usage data that Claude Code and Codex already keep on disk, normalises it and serves it through its own API. The Vue frontend only ever talks to that backend — never directly to a provider, never to a token.'
      },
      problem: {
        de: 'Beide CLIs verbrauchen Kontingent, aber keine zeigt verlässlich, wie viel noch übrig ist und wann zurückgesetzt wird.',
        en: 'Both CLIs consume quota, but neither reliably shows how much is left or when it resets.'
      },
      idea: {
        de: 'Ein dauerhaft sichtbares Kiosk-Display statt eines weiteren Browser-Tabs. Zielgerät ist ein Raspberry Pi mit 7"-Touchdisplay bei 1024 × 600 — auf dem Desktop läuft es genauso.',
        en: 'A permanently visible kiosk display instead of yet another browser tab. The target device is a Raspberry Pi with a 7" touchscreen at 1024 × 600 — it runs on a desktop just as well.'
      },
      implementation: {
        de: 'Poller, Cache und SQLite im FastAPI-Backend, das ausschließlich auf 127.0.0.1 lauscht. Die Daten stammen aus zwei Quellen: den OAuth-Usage-Endpunkten für Restkontingent und Reset-Zeitpunkt sowie den lokalen JSONL-Logs beider CLIs für den Verbrauch je Projekt und Modell. Fällt der Endpunkt aus, dienen frische rate_limits aus den Codex-Rollout-Logs als Rückfallebene. Tauri verpackt das Ganze als Desktop-App.',
        en: 'Poller, cache and SQLite in the FastAPI backend, which listens on 127.0.0.1 only. Data comes from two sources: the OAuth usage endpoints for remaining quota and reset time, plus both CLIs’ local JSONL logs for per-project and per-model consumption. If the endpoint fails, fresh rate_limits from the Codex rollout logs act as a fallback. Tauri wraps it all as a desktop app.'
      },
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'mellow',
    name: 'NEXRON-mellow',
    tagline: {
      de: 'Schlanker lokaler Zeiterfasser für Aufgaben, Sitzungen und Notizen.',
      en: 'Lightweight local time tracker for tasks, sessions and notes.'
    },
    categories: ['desktop', 'tools'],
    stack: ['Tauri', 'Vue 3', 'TypeScript', 'Rust', 'Tailwind CSS', 'shadcn-vue', 'Pinia'],
    year: 2026,
    visibility: 'public',
    repoUrl: `${GITHUB_OWNER}/NEXRON-mellow`,
    liveUrl: null,
    status: 'shipped',
    image: null,
    detail: {
      overview: {
        de: 'Aufgaben verwalten, Arbeitssitzungen tracken, Zeiten manuell nachtragen und Notizen mit Markdown schreiben. Alle Daten bleiben lokal, die App ist mehrsprachig und zeigt aktive wie abgeschlossene Aufgaben übersichtlich getrennt.',
        en: 'Manage tasks, track work sessions, add manual time entries and write notes in Markdown. All data stays local, the app is multilingual and keeps active and completed tasks clearly separated.'
      },
      problem: {
        de: 'Zeiterfassung, die in der Cloud lebt und ein Abo braucht, ist für die eigene Arbeit deutlich zu viel Apparat.',
        en: 'Time tracking that lives in the cloud and needs a subscription is far too much machinery for tracking your own work.'
      },
      idea: {
        de: 'Ein Werkzeug für den eigenen Gebrauch bauen: schnell, offline, ohne Konto.',
        en: 'Build a tool for personal use: fast, offline, no account.'
      },
      implementation: {
        de: 'Tauri-Shell mit Rust-Kern, davor Vue 3 mit Pinia-Stores je Domäne (Tasks, Timer, Pomodoro, Settings) und shadcn-vue als UI-Basis. Enthält einen Pomodoro-Timer mit eigener Statistik sowie Markdown-Editor und -Vorschau.',
        en: 'Tauri shell with a Rust core, fronted by Vue 3 with one Pinia store per domain (tasks, timer, pomodoro, settings) and shadcn-vue as the UI base. Includes a Pomodoro timer with its own statistics plus a Markdown editor and preview.'
      },
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'mimi',
    name: 'NEXRON-mimi',
    tagline: {
      de: 'Kleine Desktop-App zum schnellen Transkribieren, Speichern und Kopieren von Text.',
      en: 'Small desktop app for quickly transcribing, saving and copying text.'
    },
    categories: ['desktop', 'ai', 'tools'],
    stack: ['Tauri', 'Rust', 'Vue 3', 'TypeScript', 'Tailwind CSS'],
    year: 2026,
    visibility: 'public',
    repoUrl: `${GITHUB_OWNER}/NEXRON-mimi`,
    liveUrl: null,
    status: 'shipped',
    image: null,
    detail: {
      overview: {
        de: 'Sprache aufnehmen, transkribieren, Text speichern und kopieren — mehr macht Mimi bewusst nicht.',
        en: 'Record speech, transcribe it, save and copy the text — Mimi deliberately does nothing more.'
      },
      problem: {
        de: 'Für einen kurzen Gedanken eine große Transkriptions-Suite zu öffnen, dauert länger als das Tippen.',
        en: 'Opening a large transcription suite for one short thought takes longer than typing it.'
      },
      idea: {
        de: 'Einfachheit und Geschwindigkeit als eigentliches Feature.',
        en: 'Simplicity and speed as the actual feature.'
      },
      implementation: {
        de: 'Transkription und Persistenz liegen in Rust (transcribe.rs, db.rs), die Oberfläche ist ein schlankes Vue-3-Frontend mit Aufnahme-, Verlaufs- und Einstellungsansicht sowie einem Pegelmesser während der Aufnahme.',
        en: 'Transcription and persistence live in Rust (transcribe.rs, db.rs); the surface is a lean Vue 3 frontend with record, history and settings views plus a live level meter while recording.'
      },
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'duraki',
    name: 'NEXRON-Duraki',
    tagline: {
      de: 'Mobile-first Web-App für das russische Kartenspiel Durak — zu zweit über Einladungscode.',
      en: 'Mobile-first web app for the Russian card game Durak — two players via invite code.'
    },
    categories: ['web', 'fullstack', '3d'],
    stack: [
      'Vue 3',
      'TypeScript',
      'Socket.io',
      'Express',
      'Prisma',
      'PostgreSQL',
      'Clerk',
      'Three.js',
      'Vitest'
    ],
    year: 2026,
    visibility: 'public',
    repoUrl: `${GITHUB_OWNER}/NEXRON-Duraki`,
    liveUrl: null,
    status: 'shipped',
    image: null,
    detail: {
      overview: {
        de: 'Durak für zwei Spieler mit 36 Karten, Trumpf, Angriff und Verteidigung, Schieben und Nachwerfen. Dazu Dashboard mit Statistiken, Räume per Einladungscode und Echtzeit über Socket.io.',
        en: 'Two-player Durak with 36 cards, trumps, attack and defence, passing and adding cards. Plus a stats dashboard, invite-code rooms and real-time play over Socket.io.'
      },
      problem: {
        de: 'Ein Kartenspiel im Netz ist nur so gut wie sein Regelwerk — und Regeln, die in Komponenten verstreut liegen, lassen sich weder testen noch gegen Manipulation absichern.',
        en: 'An online card game is only as good as its rulebook — and rules scattered across components can neither be tested nor secured against tampering.'
      },
      idea: {
        de: 'Die Spiellogik vollständig von der Oberfläche trennen und autoritativ auf dem Server ausführen.',
        en: 'Separate the game logic completely from the UI and run it authoritatively on the server.'
      },
      implementation: {
        de: 'pnpm-Monorepo: packages/game-core enthält die reine Durak-Engine samt Typen, mit Vitest getestet und ohne jede UI- oder DB-Abhängigkeit. Der Express-Server validiert jeden Zug gegen diese Engine, persistiert Stand und Zug in PostgreSQL über Prisma und broadcastet jedem Spieler nur seine sichtbare Ansicht — die Gegnerhand bleibt verdeckt. Dadurch sind Reload und Resume möglich. Der Tischhintergrund ist eine Three.js-Szene, die auf das gewählte Theme und auf prefers-reduced-motion reagiert.',
        en: 'pnpm monorepo: packages/game-core holds the pure Durak engine and its types, tested with Vitest and free of any UI or DB dependency. The Express server validates every move against that engine, persists state and moves to PostgreSQL through Prisma, and broadcasts each player only their visible view — the opponent hand stays hidden. That makes reload and resume possible. The table background is a Three.js scene that reacts to the selected theme and to prefers-reduced-motion.'
      },
      challenges: [],
      learnings: []
    }
  },
  {
    slug: 'creator-hub',
    name: 'nexron-creator-hub',
    tagline: {
      de: 'Interaktive 3D-Plattform für Content-Creator.',
      en: 'Interactive 3D platform for content creators.'
    },
    categories: ['3d', 'web'],
    stack: ['Vue 3', 'Three.js', 'TypeScript'],
    year: 2025,
    visibility: 'private',
    repoUrl: null,
    liveUrl: null,
    status: 'experiment',
    image: null,
    detail: {
      overview: {
        de: 'Creator-Portfolios, Live-Status, Social-Media-Integrationen und ein Discovery-Hub in einer interaktiven 3D-Oberfläche. Ziel: Fans, Creator und Marken an einem zentralen Ort zusammenbringen.',
        en: 'Creator portfolios, live status, social media integrations and a discovery hub in one interactive 3D interface. The goal: bringing fans, creators and brands together in one place.'
      },
      problem: {
        de: 'Creator verteilen ihre Präsenz über ein Dutzend Plattformen, ohne einen Ort zu haben, der alles zusammenführt.',
        en: 'Creators spread their presence across a dozen platforms without any one place that pulls it all together.'
      },
      idea: {
        de: 'Web-Entwicklung und 3D verbinden — der Hub ist begehbar statt nur eine Liste von Links.',
        en: 'Combine web development and 3D — the hub is something you move through rather than a list of links.'
      },
      implementation: {
        de: 'Vue 3 als Anwendungsgerüst, Three.js für die räumliche Oberfläche.',
        en: 'Vue 3 as the application shell, Three.js for the spatial interface.'
      },
      challenges: [],
      learnings: []
    }
  }
]

export const getProjectBySlug = (slug: string): ProjectProps | undefined =>
  projects.find((project) => project.slug === slug)
