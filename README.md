# notadev

Generate production-ready project briefs for AI coding CLIs.

Non-technical? No problem. Answer ~10 plain-English questions and get 5 structured `.md` files that give Claude Code, Gemini CLI, Codex, or OpenCode everything they need to build a well-architected app.

## Usage

```bash
npx notadev
```

No install needed. Requires Node.js 20+ and at least one of: Claude Code, Gemini CLI, Codex, or OpenCode.

## Output

Running `notadev` creates these files in your current directory:

| File | Purpose |
|---|---|
| `PRD.md` | Product requirements — what you're building and why |
| `ARCHITECTURE.md` | Tech stack, folder structure, dependencies |
| `DATA_MODEL.md` | Database entities, fields, and relationships |
| `MILESTONES.md` | Staged development plan with definitions of done |
| `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` | Behavioral contract for your AI CLI |

## Resume after interruption

If generation is interrupted (rate limit, timeout), your answers are saved:

```bash
npx notadev --resume
```

## License

MIT
