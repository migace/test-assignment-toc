# ADR 003: CSS Modules over CSS-in-JS

## Status

Accepted

## Context

We needed a styling approach that provides:

- Scoped styles to prevent class name collisions
- Good developer experience with auto-completion
- Zero runtime cost
- Dark mode support via system preferences

Alternatives considered:

1. **CSS-in-JS** (styled-components, Emotion) — runtime style injection
2. **Tailwind CSS** — utility-first classes
3. **CSS Modules** — scoped CSS files with compile-time class name hashing
4. **Vanilla Extract** — type-safe zero-runtime CSS-in-TS

## Decision

We chose **CSS Modules** with CSS custom properties (variables) for theming.

## Rationale

- **CSS-in-JS** adds ~12KB to the bundle and has runtime overhead for style injection. With React 19's streaming SSR direction, runtime CSS-in-JS libraries face compatibility challenges.
- **Tailwind CSS** results in long `className` strings that reduce component readability. For a tree component with many conditional styles, this becomes unwieldy.
- **Vanilla Extract** has excellent type safety but requires additional build configuration and a steeper learning curve for contributors.
- **CSS Modules** are natively supported by Vite with zero configuration. They provide scoped class names at build time, produce standard CSS output, and have full IDE support.

## Theme Strategy

CSS custom properties are defined on `.tocContainer` and overridden within a `@media (prefers-color-scheme: dark)` block. This approach:

- Requires zero JavaScript for theme switching
- Respects the user's OS preference automatically
- Uses semantic variable names (`--toc-bg`, `--toc-accent`, `--toc-focus-ring`) for clarity

## Consequences

- Zero runtime styling overhead
- Standard `.module.css` files colocated with components
- Dark mode works without JavaScript or React context
- `clsx` utility handles conditional class composition cleanly
