# Project Conventions

> Project rules and conventions. Mandatory for all participants (humans and AI).

## Code Style

### Formatting
- Trailing commas — always
- Explicit types — avoid `any`, use `unknown` if needed
- async/await — no callback hell
- Comments — in English
- Semicolons — always

### Structure
- Small modules — single responsibility
- Utility functions — class with static methods (not top-level exports)
- One class/component per file
- Index files for public exports only

### Naming

| Type | Pattern | Example |
|------|---------|---------|
| Branded type | `*Id` | `IssueId`, `LabelId` |
| Domain entity | PascalCase | `Issue`, `Label` |
| Repository interface | `*Repository` | `IssueRepository` |
| Repository implementation | `*RepositoryImpl` | `IssueRepositoryImpl` |
| UseCase | `*UseCase` | `ListIssuesUseCase` |
| Data source | `*Source` | `FileSystemSource`, `ApiSource` |
| Cache | `*Cache` | `IssueCache` |
| ViewModel hook | `use*ViewModel` | `useIssuesViewModel` |
| Formatter | `*Formatter` or `format*` | `IssueFormatter`, `formatIssue` |
| Component | PascalCase | `IssueList`, `IssueRow` |
| Page | `*Page` | `IssuesPage` |

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase.tsx | `IssueList.tsx` |
| Hook | camelCase.ts | `useIssuesViewModel.ts` |
| Type/Interface | PascalCase.ts | `IssueId.ts` |
| Utility | camelCase.ts | `formatDate.ts` |
| Test | *.test.ts | `ListIssuesUseCase.test.ts` |

## TypeScript

### Strict Mode
All strict options enabled in tsconfig:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Branded Types

Primitives (`number`, `string`) are forbidden for ID-like fields.

**Rules:**
- All ID-like fields must use branded types (classes with `readonly value`)
- Use `new Type(value)` at boundaries (presentation layer, API response)
- Use `.value` to extract primitive at external API boundaries
- Use `.equals()` method for comparison (not `===`)

```typescript
// Good
const issueId = new IssueId('be-123');
if (issueId.equals(otherIssueId)) { ... }

// Bad
const issueId = 'be-123';
if (issueId === otherIssueId) { ... }
```

### Imports

- Use path aliases (`@shared/`, `@domain/`, etc.)
- Group imports: external, internal, relative
- No circular dependencies

## React

### Components
- Functional components only
- Props interface named `*Props`
- Destructure props in function signature
- No business logic in components

```typescript
interface IssueRowProps {
  issue: IssueViewModel;
  onSelect: (id: IssueId) => void;
}

export function IssueRow({ issue, onSelect }: IssueRowProps) {
  return (
    <div onClick={() => onSelect(issue.id)}>
      {issue.title}
    </div>
  );
}
```

### ViewModels
- Named `use*ViewModel`
- Return object with data, loading, error states
- Call UseCases via DI, never fetch directly
- Use TanStack Query for caching/state

```typescript
export function useIssuesViewModel() {
  const listIssues = useInject(ListIssuesUseCase);

  const { data, isLoading, error } = useQuery({
    queryKey: ['issues'],
    queryFn: () => listIssues.execute(),
  });

  return {
    issues: data ?? [],
    isLoading,
    error,
  };
}
```

## Testing

### Framework
- Vitest for all tests
- @testing-library/react for component tests (if needed)

### Structure: GIVEN-WHEN-THEN

Every test follows the pattern:

```typescript
describe('ListIssuesUseCase', () => {
  it('returns issues from repository', async () => {
    // GIVEN
    const mockIssue = createMockIssue({ title: 'Test issue' });
    const mockRepo: IssueRepository = {
      findAll: vi.fn().mockResolvedValue([mockIssue]),
    };
    const useCase = new ListIssuesUseCase(mockRepo);

    // WHEN
    const result = await useCase.execute();

    // THEN
    expect(result).toEqual([mockIssue]);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });
});
```

### Test Naming
- `describe('ClassName')` or `describe('functionName')`
- `it('does X when Y')` — describe behavior, not implementation

### What to Test
| Layer | What to test |
|-------|--------------|
| domain/usecases | Business logic with mocked repositories |
| data/repositories | Data mapping with mocked sources |
| presentation/viewmodels | UI state logic with mocked useCases |
| presentation/formatters | Pure transformation functions |

### What NOT to Test (initially)
- Pure UI components (visual tests are complex)
- Infrastructure utilities (logging, config)

## Git Conventions

### Branches
- `main` — production-ready code
- `feature/*` — new features
- `fix/*` — bug fixes
- `refactor/*` — code improvements

### Commits
- Meaningful messages in English
- Present tense: "Add feature" not "Added feature"
- Reference issue ID if applicable: "Add issue list (be-xyz)"

### Pull Requests
- Clear description of changes
- Reference related issues
- Self-review before requesting review

## Security

- Secrets — never in code, only via environment variables
- Logging — no sensitive data in logs
- Input validation — at API boundary (Zod schemas)

## Environment

- Node.js 22 LTS
- pnpm 9+
- Keep `.env.example` up-to-date
