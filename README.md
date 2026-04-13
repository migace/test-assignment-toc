# TOC (Table of Contents)

[![CI](https://github.com/migace/test-assignment-toc/actions/workflows/ci.yml/badge.svg)](https://github.com/migace/test-assignment-toc/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![a11y](https://img.shields.io/badge/a11y-WAI--ARIA%20Tree-green)

A high-performance, accessible Table of Contents component built with React 19 and TypeScript. Features virtual scrolling for large datasets, full WAI-ARIA tree pattern compliance, and cross-browser keyboard navigation.

**[Live Demo](https://migace.github.io/test-assignment-toc/)** | **[Storybook](https://migace.github.io/test-assignment-toc/storybook/)**

## Key Technical Decisions

| Decision                                             | Why                                                                                       | ADR                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Virtual scrolling** with `@tanstack/react-virtual` | Constant memory usage regardless of tree size; <16ms frame times for 500+ items           | [ADR-001](docs/adr/001-virtualization-for-large-lists.md) |
| **`useTransition`** for search filtering             | Non-blocking search — input stays responsive while React yields to high-priority updates  | [ADR-002](docs/adr/002-use-transition-for-search.md)      |
| **CSS Modules** with custom properties               | Zero-runtime styling, automatic dark mode via `prefers-color-scheme`, scoped class names  | [ADR-003](docs/adr/003-css-modules-over-css-in-js.md)     |
| **React Query** for server state                     | Built-in caching (5min stale / 24h GC), `select` for data transformation, automatic retry | [ADR-004](docs/adr/004-react-query-for-data-fetching.md)  |
| **WAI-ARIA Tree Pattern**                            | Full keyboard navigation, screen reader support, roving tabindex focus management         | [ADR-005](docs/adr/005-accessibility-first-design.md)     |
| **Zod** for API validation                           | Runtime type safety at system boundaries, preventing silent data contract violations      | —                                                         |

## Performance

- **Virtualization**: Only visible items are mounted in the DOM — handles 1000+ nodes without frame drops
- **Memoization**: `memo()` on row components + `useMemo` for tree flattening and filtering
- **Caching**: React Query with `staleTime: 5min` prevents redundant API calls
- **Non-blocking search**: `useTransition` keeps UI responsive during heavy tree filtering
- **Web Vitals**: Instrumented with `web-vitals` for CLS, FCP, LCP, and TTFB monitoring in development

## Accessibility

Full [WAI-ARIA Treeview Pattern](https://www.w3.org/WAI/ARIA/apd/patterns/treeview/) implementation:

- **Keyboard navigation**: ArrowUp/Down, ArrowRight/Left (expand/collapse), Home/End, Enter/Space
- **Roving tabindex**: Focus management without `aria-activedescendant`
- **ARIA attributes**: `role="tree/treeitem"`, `aria-expanded`, `aria-selected`, `aria-level`, `aria-setsize`, `aria-posinset`
- **Landmarks**: `role="search"`, `role="navigation"` with labels
- **Reduced motion**: Respects `prefers-reduced-motion` via Framer Motion's `useReducedMotion`
- **Dark mode**: Automatic via `prefers-color-scheme` with semantic CSS variables
- **Automated audits**: `vitest-axe` tests + Lighthouse CI with 95% a11y threshold

## Tech Stack

| Category       | Technology                                                     |
| -------------- | -------------------------------------------------------------- |
| Framework      | React 19 + TypeScript (strict mode)                            |
| Build          | Vite 8                                                         |
| Data fetching  | TanStack React Query                                           |
| Virtualization | TanStack React Virtual                                         |
| Animations     | Framer Motion                                                  |
| Styling        | CSS Modules + CSS custom properties                            |
| Validation     | Zod                                                            |
| Unit tests     | Vitest + React Testing Library + vitest-axe                    |
| E2E tests      | Playwright (Chrome, Firefox, Safari)                           |
| Component docs | Storybook 10                                                   |
| API mocking    | MSW (Mock Service Worker)                                      |
| CI/CD          | GitHub Actions (lint, test, e2e, Lighthouse, Storybook deploy) |
| Quality        | ESLint + Prettier + Husky + lint-staged                        |

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation

```bash
git clone https://github.com/migace/test-assignment-toc.git
cd test-assignment-toc
npm install
```

### Development

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run storybook    # Component explorer at http://localhost:6006
```

### Testing

```bash
npm run test:run       # Unit tests (single run)
npm run test:coverage  # Unit tests with coverage report
npm run test:e2e       # Playwright E2E (Chrome + Firefox + Safari)
npm run test:e2e:ui    # Playwright with interactive UI
```

### Build

```bash
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview production build locally
```

## Project Structure

```
src/
  api/                  — API client + Zod validation schemas
  components/
    TOC/
      hooks/            — Custom hooks (useTOCData, useTOCSearch, useExpandedState, useFlattenedTree)
      utils/            — Tree filtering with tests
      TOC.tsx           — Main component (virtualizer, search, navigation)
      TOCRow.tsx        — Virtualized row (flat list rendering)
      TOCItem.tsx       — Recursive tree item (non-virtualized, with animations)
      HighlightMatch.tsx — Search result highlighting
      constants.ts      — Shared layout constants
      *.test.tsx        — Colocated tests
      *.stories.tsx     — Storybook stories
    ErrorBoundary/      — Error boundary with CSS Modules
    Loader/             — Loading indicator
  utils/                — buildTree, normalize, reportWebVitals
  mocks/                — MSW handlers + mock data
  test/                 — Test setup (jest-dom, vitest-axe matchers)
docs/
  adr/                  — Architecture Decision Records
e2e/                    — Playwright E2E tests
```

## Available Scripts

| Script                    | Description               |
| ------------------------- | ------------------------- |
| `npm run dev`             | Start Vite dev server     |
| `npm run build`           | Production build          |
| `npm run preview`         | Preview production build  |
| `npm run lint`            | ESLint check              |
| `npm run format`          | Prettier format all files |
| `npm run format:check`    | Prettier check            |
| `npm run test`            | Vitest in watch mode      |
| `npm run test:run`        | Single test run           |
| `npm run test:coverage`   | Coverage report           |
| `npm run test:ui`         | Vitest with browser UI    |
| `npm run test:e2e`        | Playwright E2E tests      |
| `npm run test:e2e:ui`     | Playwright interactive UI |
| `npm run storybook`       | Storybook dev server      |
| `npm run build-storybook` | Build static Storybook    |

## CI/CD Pipeline

The GitHub Actions pipeline runs on every push and PR:

```
Lint ──────────────┐
Unit Tests ────────┼── Build ── Deploy Storybook (main only)
E2E Tests ─────────┘
Lighthouse Audit (parallel)
```

- **Lint**: TypeScript type check + ESLint + Prettier
- **Unit Tests**: Vitest with coverage report (80% threshold)
- **E2E Tests**: Playwright across Chrome, Firefox, and Safari
- **Lighthouse**: Performance (90%), Accessibility (95%), Best Practices (90%), SEO (90%)
- **Deploy**: App + Storybook auto-deployed to GitHub Pages on `main`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines, code standards, and the contribution workflow.

## Architecture Decisions

Key decisions are documented as [Architecture Decision Records](docs/adr/):

- [ADR-001: Virtualization for Large Lists](docs/adr/001-virtualization-for-large-lists.md)
- [ADR-002: useTransition for Non-Blocking Search](docs/adr/002-use-transition-for-search.md)
- [ADR-003: CSS Modules over CSS-in-JS](docs/adr/003-css-modules-over-css-in-js.md)
- [ADR-004: React Query for Server State Management](docs/adr/004-react-query-for-data-fetching.md)
- [ADR-005: Accessibility-First Design](docs/adr/005-accessibility-first-design.md)

## License

This project is part of a coding assignment.
