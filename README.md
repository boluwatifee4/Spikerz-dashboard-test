## Spikerz Dashboard

Modern Angular 19 dashboard implementing a collapsible navigation sidebar, responsive layout, design‑token driven SCSS architecture, and accessible icon tooltips (Angular Material).

### Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | Angular 19 (standalone APIs) |
| Styling | SCSS design tokens (abstracts/base/layout/components) |
| UI Lib | Angular Material (tooltips only currently) |
| Charts | ngx-charts + d3 |
| Fonts | Public Sans (Google Fonts) |

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

### Accessibility Notes
- All interactive elements have `aria-label`s.
- Tooltips enhance, not replace, visible text (hidden only when collapsed).

### Next Enhancements (Potential)
- Persist sidebar state (localStorage) per user.
- Add routing + active link synchronization.
- Introduce lazy‑loaded feature modules.

### License
Internal / TBD.
