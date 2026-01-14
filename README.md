# Bealin

> Linear-style web UI for Beads issue tracking

## What is Bealin?

Bealin is a modern, clean web interface for [Beads](https://github.com/steveyegge/beads) — an AI-native issue tracking system that lives in your git repository.

While Beads is CLI-first and perfect for AI agents, sometimes you want a visual interface to browse issues, manage labels, and get an overview of your project. Bealin provides exactly that — a fast, keyboard-friendly UI inspired by [Linear](https://linear.app).

## What is Beads?

Beads is issue tracking that lives in your codebase:

- **Git-native**: Issues stored in `.beads/issues.jsonl` alongside your code
- **AI-friendly**: CLI-first design works seamlessly with AI coding agents
- **Offline-first**: Works without internet, syncs when you push
- **Branch-aware**: Issues follow your branch workflow

```bash
bd create "Add user authentication"  # Create issue
bd list                               # View issues
bd update be-123 --status done        # Update status
```

## Why Bealin?

| Beads CLI | Bealin UI |
|-----------|-----------|
| Create/update issues | Browse and search visually |
| Perfect for AI agents | Perfect for humans |
| Terminal workflow | Visual overview |
| Quick edits | Bulk operations |

**They complement each other.** Use Beads CLI for quick actions and AI workflows. Use Bealin when you want to see the big picture.

## Features

### MVP (Current Focus)
- [ ] View issues list with status, priority, labels
- [ ] Issue detail view
- [ ] Filter and search

### Planned
- [ ] Create and edit issues
- [ ] Labels management
- [ ] Projects/workspaces
- [ ] Keyboard navigation (Linear-style)
- [ ] Dark mode

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TanStack Router/Query
- **Backend**: Node.js, Fastify, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Architecture**: Clean Architecture, DI with tsyringe

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## Development

```bash
# Prerequisites
node >= 22
pnpm >= 9

# Setup
pnpm install

# Development
pnpm dev

# Testing
pnpm test              # Run tests once
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Project Structure

```
packages/
├── shared/      # Shared domain models and types
├── backend/     # REST API server
└── frontend/    # React SPA
```

## Contributing

See [CONVENTIONS.md](./CONVENTIONS.md) for code style and contribution guidelines.

## License

MIT
