# Contributing

Thank you for considering contributing to this project! This guide will help you get started.

## Prerequisites

- Node.js 22+
- npm 10+

## Getting Started

```bash
git clone https://github.com/migace/test-assignment-toc.git
cd test-assignment-toc
npm install
npm run dev
```

## Development Workflow

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the [Code Standards](#code-standards)

3. Run all checks before committing:

   ```bash
   npm run lint          # ESLint
   npm run format:check  # Prettier
   npx tsc --noEmit      # TypeScript
   npm run test:run      # Unit tests
   npm run test:e2e      # E2E tests
   ```

4. Commit your changes (pre-commit hooks will run lint-staged automatically)

5. Push and open a pull request against `main`

## Code Standards

### TypeScript

- Strict mode is enabled — no `any` types unless absolutely necessary
- Use `interface` for object shapes, `type` for unions and intersections
- Validate external data at system boundaries using Zod schemas

### React

- Functional components with hooks
- Custom hooks for reusable logic (one responsibility per hook)
- `memo()` only where profiling shows a measurable benefit
- CSS Modules for styling — no inline styles

### Testing

- **Unit tests** for pure functions and utilities
- **Hook tests** using `renderHook` from `@testing-library/react`
- **Component tests** using React Testing Library (query by role/label, not test IDs)
- **E2E tests** using Playwright across Chrome, Firefox, and Safari
- **Accessibility tests** using `vitest-axe`
- Coverage threshold: 80% for branches, functions, lines, and statements

### Accessibility

- Follow the [WAI-ARIA Tree Pattern](https://www.w3.org/WAI/ARIA/apd/patterns/treeview/)
- All interactive elements must be keyboard accessible
- Visible focus indicators on all focusable elements
- Test with a screen reader before submitting a11y-related changes

### Commit Messages

- Use [Conventional Commits](https://www.conventionalcommits.org/) format:
  - `feat:` — new feature
  - `fix:` — bug fix
  - `docs:` — documentation changes
  - `test:` — adding or updating tests
  - `refactor:` — code changes that neither fix a bug nor add a feature
  - `chore:` — tooling, dependencies, CI changes

## Project Structure

```
src/
  api/           — API functions and Zod schemas
  components/    — React components (colocated tests, stories, styles)
  hooks/         — Shared custom hooks
  utils/         — Pure utility functions
  mocks/         — MSW handlers and mock data
  test/          — Test setup and helpers
docs/
  adr/           — Architecture Decision Records
e2e/             — Playwright E2E tests
```

## Architecture Decisions

Before making significant architectural changes, please:

1. Check existing [ADRs](docs/adr/) for relevant context
2. Discuss the change in a GitHub issue first
3. Document your decision as a new ADR if accepted

## Need Help?

Open an issue with the "question" label, and we'll be happy to help.
