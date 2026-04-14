# ADR 002: useTransition for Non-Blocking Search

## Status

Accepted

## Context

Filtering a large tree on every keystroke blocks the main thread, causing input lag. Users perceive delays >50ms as sluggish. We needed a strategy to keep the search input responsive while filtering runs.

We considered:

1. **Debouncing** (e.g., `useDebouncedValue` with 300ms delay) — classic approach
2. **Web Worker** — offload filtering to a background thread
3. **React `useTransition`** — mark the filter state update as a low-priority transition

## Decision

We chose **React `useTransition`** to wrap the `setAppliedQuery` state update.

## Rationale

- **Debouncing** adds artificial delay — even when the filter is fast, users wait 300ms for nothing. It also requires choosing a magic delay number.
- **Web Workers** add serialization overhead (structured clone of the tree), build complexity (separate worker bundle), and don't integrate with React's rendering pipeline.
- **`useTransition`** lets React interrupt the low-priority filter re-render if the user types again. The input stays responsive because `setSearchQuery` is a normal (high-priority) update, while `setAppliedQuery` is wrapped in `startTransition`. React automatically yields to higher-priority updates (typing) and only commits the filter result when the main thread is idle.

## Trade-offs

- Requires React 18+ (we're on React 19)
- The `isPending` flag gives us a free loading indicator during filtering — no extra state management
- If the tree grows extremely large (10k+ nodes), `useTransition` alone may not be enough and a Web Worker would be warranted. For our current scale (~500 nodes), it's sufficient.

## Consequences

- Search input remains responsive regardless of tree size
- `isPending` state drives a "Filtering results..." indicator
- No debounce timer to tune or maintain
- The approach is applied on every keystroke; `useTransition` keeps typing responsive while filtering updates are scheduled as low priority
