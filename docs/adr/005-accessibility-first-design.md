# ADR 005: Accessibility-First Design with WAI-ARIA Tree Pattern

## Status

Accepted

## Context

The TOC is a hierarchical, interactive navigation component. Screen reader users, keyboard-only users, and users with motor impairments must be able to navigate and interact with it effectively. The [WAI-ARIA Treeview Pattern](https://www.w3.org/WAI/ARIA/apd/patterns/treeview/) defines the expected behavior.

## Decision

We implemented the full WAI-ARIA Tree pattern, including:

- **Roles**: `tree`, `treeitem`, `group`
- **States**: `aria-expanded`, `aria-selected`, `aria-level`, `aria-setsize`, `aria-posinset`
- **Keyboard navigation**: ArrowUp/Down (linear), ArrowRight (expand/descend), ArrowLeft (collapse/ascend), Home/End, Enter/Space
- **Focus management**: roving tabindex (`tabIndex={isFocused ? 0 : -1}`)
- **Landmarks**: `role="search"`, `role="navigation"` with `aria-label`

## Rationale

### Why roving tabindex over `aria-activedescendant`

Two patterns exist for managing focus in composite widgets:

1. **Roving tabindex**: move `tabIndex="0"` between items, call `.focus()` on the active one
2. **`aria-activedescendant`**: keep focus on the container, point to the active item via ID

We chose roving tabindex because:

- It works naturally with virtualization — only mounted items need focus
- Browser native scroll-into-view works when an element receives focus
- It's simpler to implement and test

### Why dedicated a11y tests

We use `vitest-axe` for automated accessibility audits alongside manual ARIA attribute assertions. Automated tools catch ~30% of accessibility issues; the remaining coverage comes from explicit assertions on roles, states, and keyboard behavior in both unit and E2E tests.

### Why reduced-motion CSS fallbacks

We respect the user's `prefers-reduced-motion` OS setting with CSS media queries. Non-essential motion (spinner animation and hover/icon transitions) is disabled in reduced-motion mode, which lowers vestibular risk without adding runtime dependencies.

## Consequences

- The component is fully navigable by keyboard alone
- Screen readers announce the tree structure, expansion state, and position
- Every interactive element has visible focus indicators
- E2E tests validate keyboard navigation flows across browsers
- The `proposal.md` document tracks which accessibility features are implemented vs. planned
