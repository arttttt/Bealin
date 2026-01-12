# Bealin Architecture

> Single source of truth for project architecture. All other docs reference this file.

## Overview

Bealin is a Linear-style web UI for Beads issue tracking. Single Page Application with a REST API backend.

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Clean Architecture** | Strict layer separation, dependencies point inward only |
| **SOLID** | Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion |
| **DRY** | Don't repeat yourself, extract common logic |
| **KISS** | Keep it simple, avoid over-engineering |
| **Dependency Injection** | No hard dependencies, everything injectable via constructor |

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React SPA)                    │
├─────────────────────────────────────────────────────────────┤
│  presentation/   │ Pages, Components, ViewModels, Formatters│
│  domain/         │ UseCases, Repository Interfaces          │
│  data/           │ Repository Impl, Sources (API, Memory)   │
│  infrastructure/ │ Shared utilities (logging, config)       │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js API)                     │
├─────────────────────────────────────────────────────────────┤
│  presentation/   │ HTTP Handlers, Request/Response mapping  │
│  domain/         │ UseCases, Repository Interfaces          │
│  data/           │ Repository Impl, Sources (FileSystem)    │
│  infrastructure/ │ Shared utilities (logging, config)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                        ┌───────────┐
                        │  .beads/  │
                        │   JSONL   │
                        └───────────┘
```

## Directory Structure

```
packages/
├── shared/                    # Shared between frontend and backend
│   └── src/
│       ├── models/            # Domain entities (Issue, Label, Project)
│       └── types/             # Branded types (IssueId, LabelId, etc.)
│
├── backend/
│   └── src/
│       ├── domain/
│       │   ├── models/        # Backend-specific entities (if any)
│       │   ├── usecases/      # Business logic
│       │   └── repositories/  # Interfaces (ports)
│       │
│       ├── data/
│       │   ├── repositories/  # Implementations
│       │   └── sources/
│       │       ├── filesystem/  # JSONL file operations
│       │       └── memory/      # In-memory caches
│       │
│       ├── infrastructure/
│       │   ├── internal/      # Only for data layer
│       │   └── shared/        # Accessible by all layers (logging, config)
│       │
│       └── presentation/
│           └── http/          # Fastify handlers
│
└── frontend/
    └── src/
        ├── domain/
        │   ├── usecases/      # Business logic (calls repositories)
        │   └── repositories/  # Interfaces
        │
        ├── data/
        │   ├── repositories/  # Implementations
        │   └── sources/
        │       ├── api/       # Backend API client
        │       └── memory/    # Local cache
        │
        ├── infrastructure/
        │   └── shared/        # Logging, config
        │
        └── presentation/
            ├── issues/        # Feature: issues
            │   ├── components/
            │   ├── viewmodels/
            │   ├── formatters/
            │   └── IssuesPage.tsx
            │
            ├── labels/        # Feature: labels
            │   └── ...
            │
            └── shared/        # Shared UI
                ├── components/  # Button, Modal, Spinner
                ├── hooks/       # Common UI hooks
                └── layouts/     # MainLayout, Sidebar
```

## Layer Rules

### Domain Layer (innermost)
- Pure business logic, no framework dependencies
- Entities: Issue, Label, Project with branded IDs
- Repository interfaces only — no implementations
- UseCases orchestrate business logic
- Can use `infrastructure/shared` for pure utilities (logging)

### Data Layer
- Implements domain repository interfaces
- Contains data sources by type (filesystem, memory, api)
- No business logic — only data storage/retrieval
- Can use `infrastructure/internal` and `infrastructure/shared`

### Infrastructure Layer
- `internal/` — utilities only for data layer
- `shared/` — utilities for all layers (logging, config)
- No business logic

### Presentation Layer (frontend only)
- **Components**: Pure UI, receive props, render JSX. NO logic.
- **ViewModels**: UI logic, loading/error states, call UseCases via DI
- **Formatters**: Transform domain models to view models
- **Pages**: Compose components with viewmodels

## Layer Access Rules

```
domain          → infrastructure/shared (logging, config)
data            → domain/repositories (interfaces)
                → infrastructure/internal
                → infrastructure/shared
presentation    → domain/usecases (via DI)
                → infrastructure/shared
infrastructure  → (nothing, except shared between own modules)
```

**Key rule:** Dependencies point inward only.

```
presentation → domain ← data
                 ↑
           infrastructure
```

## Presentation Layer Rules

### PROHIBITED in presentation (components, viewmodels, pages):
- Direct fetch/axios calls
- Direct localStorage/sessionStorage access
- Direct WebSocket connections
- Any I/O operations
- Direct database access

### ALLOWED:
- Call UseCases from domain (via DI)
- TanStack Query ONLY wrapping useCase.execute()
- React state/effects for UI logic
- Formatters for data transformation

## Dependency Injection

All dependencies injected via constructor. Using `tsyringe`.

```typescript
// Good: dependency injected
@injectable()
class ListIssuesUseCase {
  constructor(
    @inject('IssueRepository') private repo: IssueRepository,
  ) {}
}

// Bad: hard dependency
class ListIssuesUseCase {
  private repo = new IssueRepositoryImpl(); // PROHIBITED
}
```

## Branded Types

Primitives (`number`, `string`) are forbidden for ID-like fields.

```typescript
// types/IssueId.ts
export class IssueId {
  constructor(readonly value: string) {}

  equals(other: IssueId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Usage
const id = new IssueId('be-abc');
if (id.equals(otherId)) { ... }
api.get(`/issues/${id.value}`);  // Extract primitive at boundaries
```

## API Contract

REST API with JSON:

```
GET    /api/issues          # List issues
GET    /api/issues/:id      # Get issue
POST   /api/issues          # Create issue
PATCH  /api/issues/:id      # Update issue
DELETE /api/issues/:id      # Delete issue

GET    /api/labels          # List labels
GET    /api/projects        # List projects
```

Error format:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Issue not found"
  }
}
```

## Anti-patterns (Prohibited)

| Prohibition | Reason |
|-------------|--------|
| Utils/helpers/common folders | Become dumps. Each component must have a specific place |
| Domain Services | Not used. All business logic in UseCases |
| Direct service access from domain | Domain works only with repository interfaces |
| Business logic in data layer | Data only stores/retrieves, makes no decisions |
| Event bus / implicit coupling | Makes dependencies hidden and hard to trace |
| Business logic in adapters/formatters | Adapters are thin, logic belongs in UseCases |
| Direct I/O in presentation | Violates layer separation, use repositories via UseCases |
| Framework deps in domain | Domain must be pure, no external framework imports |
| Primitive IDs | Use branded types for all ID fields |

## Tech Stack

| Category | Technology |
|----------|------------|
| Monorepo | pnpm workspaces |
| Language | TypeScript (strict) |
| Frontend | React 19, Vite |
| Backend | Node.js, Fastify 5 |
| Routing | TanStack Router |
| Data Fetching | TanStack Query (as cache in viewmodels) |
| Styling | Tailwind CSS, shadcn/ui |
| Forms | React Hook Form + Zod |
| Validation | Zod (shared schemas) |
| DI | tsyringe |
| Testing | Vitest |
| Linting | ESLint 9 (flat config), Prettier |
