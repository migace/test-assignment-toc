# ADR 004: React Query for Server State Management

## Status

Accepted

## Context

The TOC data is fetched once from an API and then used throughout the component tree. We needed a data-fetching strategy that handles:

- Loading and error states
- Caching to avoid redundant requests
- Stale-while-revalidate for perceived performance
- Retry logic for transient failures

Alternatives considered:

1. **Plain `useEffect` + `useState`** — manual fetch management
2. **SWR** — lightweight data-fetching library
3. **TanStack React Query** — full-featured server state management

## Decision

We chose **TanStack React Query** (`@tanstack/react-query`).

## Rationale

- **Plain `useEffect`** requires manual implementation of loading/error states, caching, deduplication, and retry logic. This leads to boilerplate and subtle bugs (race conditions, stale closures).
- **SWR** is lighter but lacks the `select` option for data transformation, and its devtools are less mature.
- **React Query** provides:
  - `select` to transform raw API data into a tree structure (`buildTree`) at the query level, avoiding repeated transformation
  - Built-in `staleTime` (5 min) and `gcTime` (24h) for fine-grained cache control
  - Automatic retry with exponential backoff
  - `refetch` function exposed for manual retry on error

## Cache Strategy

```
staleTime: 5 minutes   — data is considered fresh for 5 min (no background refetch)
gcTime: 24 hours        — cached data is kept in memory for 24h before garbage collection
```

This is appropriate because TOC data changes infrequently. Users get instant renders from cache on navigation, and the 5-minute stale window prevents unnecessary background fetches.

## Consequences

- Single `useTOCData` hook encapsulates all fetch logic
- Components receive `{ data, isLoading, error, refetch }` — clean separation of data and UI
- `select: (raw) => buildTree(raw)` transforms data once per fetch, not on every render
- The query client is configured at the app root with sensible defaults
