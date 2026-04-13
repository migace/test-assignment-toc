# ADR 001: Virtualization for Large Lists

## Status

Accepted

## Context

The TOC component needs to render a potentially large hierarchical tree — real-world documentation can have hundreds or thousands of items. Rendering all DOM nodes simultaneously leads to:

- Slow initial render (>100ms for 500+ items)
- High memory usage from DOM elements
- Janky scrolling on lower-end devices

We considered three approaches:

1. **Pagination** — load items in chunks with "Load more" buttons
2. **Lazy rendering via Intersection Observer** — render items as they scroll into view
3. **Windowed virtualization** — only mount items currently visible in the scroll viewport

## Decision

We chose **windowed virtualization** using `@tanstack/react-virtual`.

## Rationale

- **Pagination** breaks the UX for tree navigation — users expect to scroll through a continuous list, and keyboard navigation (ArrowUp/Down, Home/End) would be fragmented across pages.
- **Intersection Observer** is simpler but still mounts all items once they're scrolled past. For very long sessions, memory accumulates. It also doesn't integrate cleanly with keyboard-driven scrolling.
- **@tanstack/react-virtual** provides constant memory usage regardless of list size, smooth 60fps scrolling, and built-in `scrollToIndex` for programmatic navigation. It requires flattening the tree first, which we handle with `useFlattenedTree`.

## Trade-offs

- Added complexity: the tree must be flattened before rendering, and virtual items require absolute positioning
- Animations are limited — expand/collapse animations on child groups are not feasible with virtualization, so we animate only the expand icon rotation
- Testing requires mocking the virtualizer since jsdom has no layout engine

## Consequences

- The TOC renders 500+ items with <16ms frame times
- `useFlattenedTree` hook converts hierarchical data to a flat list with depth metadata for indentation and ARIA attributes
- Tests mock `useVirtualizer` to avoid layout dependencies
