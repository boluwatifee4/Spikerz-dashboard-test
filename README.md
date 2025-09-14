## Spikerz Dashboard

<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/300ff03d-9d72-4747-8e04-d9ab7f5cf3f5" />

<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/bd52a279-d335-480d-8c4c-306472d4d353" />

<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/97f3cb26-6430-403c-b299-d5ac97258001" />


Modern Angular 19 dashboard implementing a collapsible navigation sidebar, responsive layout, design‑token driven SCSS architecture, and accessible icon tooltips (Angular Material).

### Recent Updates

- Dashboard two‑panel container renamed to `.entity-dashboard` (avoids collision with global `.dashboard-layout`).
- Graph visualization: `ngx-graph` was initially planned for the flow chart, but runtime/build errors (during integration under time constraints) blocked usage, so a lightweight custom placeholder structure + status legend was implemented temporarily. Replacement with `ngx-graph` (or another graph lib) is a queued enhancement.
- Mobile: panels stack (single column) < `$breakpoint-md`; main content now shifts by collapsed sidebar width when sidebar opened on small screens.
- Sidebar overlay logic adds `.sidebar-open` + `data-mobile="true"` to `<main>` for mobile margin control.
- Adopted `100dvh` for layout + scrolling containment to improve iOS viewport handling.
- Component style budget raised: `anyComponentStyle` warning `6kB`, error `10kB` (see `angular.json`).
- Dashboard SCSS trimmed (merged media queries, reduced duplication); move further shared patterns to global partials if growth resumes.

### Tech Stack

| Layer     | Choice                                                |
| --------- | ----------------------------------------------------- |
| Framework | Angular 19 (standalone APIs)                          |
| Styling   | SCSS design tokens (abstracts/base/layout/components) |
| UI Lib    | Angular Material (tooltips only currently)            |
| Charts    | ngx-charts + d3                                       |
| Fonts     | Public Sans (Google Fonts)                            |

### Quick Start

```bash
npm install
npm start   # serves at http://localhost:4200/
```

### Build

```bash
npm run build
```

Artifacts output to `dist/`.

### Inline Templates Rationale

`LayoutComponent` and `SidebarComponent` intentionally use inline templates instead of separate `.html` files because:

1. The markup is relatively small and unlikely to grow drastically.
2. Rapid iteration during early layout + styling passes (fewer file hops, better locality with logic & state signals).
3. Easier to reason about structural changes while refining SCSS architecture.

When to externalize later:

- Template exceeds ~150 lines or becomes hard to scan.
- Designers / other contributors need direct markup access.
- You introduce complex structural directives or lots of conditional branches.

How to externalize (example):

1. Create `sidebar.component.html`.
2. Move template content from the decorator string into the file.
3. Replace `template:` with `templateUrl:` in the component metadata.
4. Repeat for `layout.component.ts` if needed.

### Architecture Overview

```
src/styles/
	abstracts/ (variables, mixins, functions)
	base/      (reset, typography)
	layout/    (grid, containers)
	components/(cards, buttons, etc.)
	vendors/   (overrides)
```

Key tokens in `abstracts/_variables.scss` drive spacing, colors, typography, and sidebar dimensions (`$sidebar-width`, `$sidebar-width-collapsed`).

### Sidebar Behavior

- Collapsible: full width → icon rail using `$sidebar-width-collapsed`.
- Toggle button sits on the outer border (overflow visible).
- Tooltips provided by Angular Material and only activated in collapsed mode.
- Mobile: Sidebar overlays content; when expanded a left offset equal to `$sidebar-width-collapsed` is applied to `.main-content.sidebar-open` for visual breathing room.

### Dashboard Layout

- Two panels (`.panel-left`, `.panel-right`) inside `.entity-dashboard` grid.
- Mobile-first: default 1fr; ≥ `md` switches to 35% / 65% columns; wider breakpoints refine ratios.
- Utility classes: `.dashboard-hide-mobile`, `.dashboard-show-desktop` for conditional rendering.

### Accessibility Notes

- All interactive elements have `aria-label`s.
- Tooltips enhance, not replace, visible text (hidden only when collapsed).

### Next Enhancements (Potential)

- Persist sidebar state (localStorage) per user.
- Add routing + active link synchronization.
- Introduce lazy‑loaded feature modules.
- Consolidate shared dashboard card / legend / table styles into a single global partial to keep per-component budgets healthy.
- Optional CSS container queries for more granular panel stacking logic.

### Style Budgets & Optimization

`angular.json` production budgets include a component style limit now set to 6kB (warn) / 10kB (error). Keep individual component SCSS lean by:

1. Moving repeated card & table patterns into `styles/components/` partials imported once.
2. Pruning rarely used breakpoints (e.g. ultra‑narrow tweaks) if not required.
3. Preferring design tokens & utility abstractions instead of repeating long property blocks.
4. Avoiding excessive comments in component SCSS (document globally instead).

To adjust budgets further, edit the `anyComponentStyle` entry under `projects.spikerz-dashboard.architect.build.configurations.production.budgets`.

### License

Internal / TBD.
