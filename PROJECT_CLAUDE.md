# Bealin Project Rules

> These rules apply to ALL agents working on this project.

## Project Overview

Bealin is a Linear-style web UI for Beads issue tracking.
- Frontend: React SPA
- Backend: Node.js REST API
- Data: Reads .beads/ JSONL files

## Critical Architecture Rules

**READ THESE FILES FIRST:**
- `ARCHITECTURE.md` — full architecture specification
- `CONVENTIONS.md` — code style and conventions

## Quick Reference

### Layer Dependencies
```
presentation → domain ← data
                 ↑
           infrastructure
```
Dependencies point INWARD only.

### Presentation Layer is DUMB
**PROHIBITED** in presentation (components, viewmodels, pages):
- Direct fetch/axios calls
- Direct localStorage access
- Any I/O operations

**ALLOWED:**
- Call UseCases via DI
- TanStack Query wrapping useCase.execute()
- React state for UI logic

### Branded Types Required
Never use primitive `string` for IDs:
```typescript
// Good
const id = new IssueId('be-123');

// Bad
const id = 'be-123';
```

### DI via Constructor
```typescript
@injectable()
class ListIssuesUseCase {
  constructor(@inject('IssueRepository') private repo: IssueRepository) {}
}
```

### Testing: GIVEN-WHEN-THEN
```typescript
it('does something', () => {
  // GIVEN - setup
  // WHEN - action
  // THEN - assertions
});
```

## Tech Stack (use latest versions)

| Category | Technology |
|----------|------------|
| Monorepo | pnpm workspaces |
| Frontend | React 19, Vite, TanStack Router, TanStack Query |
| Backend | Node.js, Fastify 5 |
| Styling | Tailwind CSS, shadcn/ui |
| Validation | Zod |
| DI | tsyringe |
| Testing | Vitest |
| Linting | ESLint 9 flat config |

## Directory Structure

```
packages/
├── shared/          # Shared models and types
├── backend/         # Node.js API
│   └── src/
│       ├── domain/
│       ├── data/
│       ├── infrastructure/
│       └── presentation/
└── frontend/        # React SPA
    └── src/
        ├── domain/
        ├── data/
        ├── infrastructure/
        └── presentation/
            ├── issues/      # Feature folders
            ├── labels/
            └── shared/
```

## Before You Code

1. Read `ARCHITECTURE.md` fully
2. Read `CONVENTIONS.md` fully
3. Follow the patterns exactly
4. Ask via mail if unclear (don't guess)
