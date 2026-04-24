# 📋 notadev (Not a Developer)

> Stop one-shotting your AI coding CLI. Start with a plan.

**notadev** is an open source CLI tool that helps non-technical builders — product managers, founders, analysts — generate a complete set of project files before they touch an AI coding tool like Claude Code, Gemini CLI, Codex, or OpenCode.

Instead of typing *"build me an app"* and getting spaghetti code after 30 prompts, you answer 10 plain-English questions and get 5 structured `.md` files that give your AI coding CLI everything it needs to build a well-architected app from session one.

---

## The problem it solves

Non-technical people using AI coding CLIs today run into the same wall:

- They one-shot a vague prompt and get unmaintainable code
- They don't know what a PRD, data model, or milestone plan is — or why they matter
- Every new session loses context and the AI starts drifting
- 20 prompts later, the app is a mess that's hard to fix

notadev fixes the **pre-coding phase** by interviewing you and generating the files your AI CLI reads to stay on track.

---

## Prerequisites

- **Node.js 20+** — [Download at nodejs.org](https://nodejs.org) (free, takes 2 minutes). If you've already installed Claude Code, Gemini CLI, Codex, or OpenCode, you likely have this already.
- **At least one AI coding CLI:**
  - [Claude Code](https://claude.ai/code)
  - [Gemini CLI](https://github.com/google-gemini/gemini-cli)
  - [Codex](https://github.com/openai/codex)
  - [OpenCode](https://opencode.ai)

## Usage

```bash
npx notadev
```

No separate install needed — `npx` is included with Node.js. notadev detects which CLI you have installed and uses it to generate your files — no separate API key needed.

---

## How it works

```
npx notadev
    │
    ├─ Detects your installed CLI (Claude Code, Gemini, etc.)
    ├─ Asks ~10 plain-English questions about your app
    ├─ Recommends a production-ready tech stack
    ├─ Generates 5 .md files using your CLI
    │
    └─ Open your CLI in that folder and say:
       "Read all .md files, then let's begin Stage 1."
```

---

## What it generates

| File | Purpose |
|---|---|
| `PRD.md` | What you're building, who it's for, and what success looks like |
| `ARCHITECTURE.md` | Tech stack, folder structure, key dependencies |
| `DATA_MODEL.md` | Database entities, fields, and relationships |
| `MILESTONES.md` | Staged build plan — each stage has a clear definition of done |
| `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` | Behavioral contract: TDD rules, don't deviate from the stack, confirm before moving stages |

---

## Supported tech stacks

notadev recommends one of four curated stacks based on your app description:

| App type | Stack |
|---|---|
| Dashboard / analytics | Next.js + PostgreSQL + Prisma + Vercel |
| SaaS / subscription | Next.js + PostgreSQL + Prisma + Stripe + Vercel |
| API / backend service | Node.js + Express + PostgreSQL + Railway |
| Internal tool | Next.js + SQLite + Prisma |

You can override with any stack you prefer.

---

## Resume after interruption

If generation is interrupted (rate limit, timeout), your answers are saved automatically:

```bash
node /path/to/notadev/bin/notadev.js --resume
```

Already-generated files are skipped — only the remaining ones are regenerated.

---

## Contributing

Pull requests are welcome. Good first contributions:

- New stack templates (Vue, SvelteKit, FastAPI, etc.)
- Improved prompts for specific app types
- Support for additional AI CLIs
- Translations of the question set

---

## Disclaimer

- Generated files are AI output — always review them before use
- notadev uses your existing AI CLI account and will consume tokens
- Token usage is moderate (5 file generations per run)

---

## License

MIT — see [LICENSE](LICENSE)
