# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Rules

- **Keep files under 200 lines.** If a file exceeds 500 lines, split it — extract hooks into `hooks/`, sub-components into `components/`, and pure utilities into a separate file.
- **Separate resources by folder and keep units minimal.** Components go in `components/`, hooks go in `hooks/`. Each file should do one thing. Never co-locate a hook and a component in the same file.

## Commands

```bash
npm run dev       # dev server (LAN-accessible via --host)
npm run build     # tsc type-check + vite build
npm run lint      # eslint
npm run preview   # preview the production build
```

There are no tests in this project.

> **Note:** The local environment has a Node/icu4c version mismatch that prevents `node` from running. Use the dev server via the browser instead of CLI tools for runtime verification.

## Architecture

This is a single-page React + TypeScript app (Vite) — a restaurant finder for the area around Myongji University. The entire app is one screen: `App` renders `<MapSelector />`, which is the only route.

### Data layer

- **`src/data2.ts`** — the full restaurant dataset as a static TypeScript array, plus the `Restaurant` and `Menu` interfaces. `data.ts` and `dataBackup.ts` are legacy/backup files; active data is in `data2.ts`.
- `Restaurant` has multilingual menu names (`{ ko, en, zh, ja, vi }`), a `naverMapCode` for deep-linking to Naver Maps, and a `filters` object (`isCheap`, `isHighProtein`, `isHealthy`).

### Internationalisation

- **`src/i18n.ts`** — all UI strings keyed by `Lang = "ko" | "en" | "zh" | "ja" | "vi"`.
- **`src/LangContext.tsx`** — React context that holds the active `lang`. Wrap with `useLang()` to read/set language anywhere. `LangProvider` is mounted at the root in `main.tsx`.
- When adding new UI strings, add a key to every language object in `t` and update `CAT_KEY_MAP` / `TAG_KEY_MAP` if it's a category or tag label.

### MapSelector module (`src/components/MapSelector/`)

The main feature module. `index.tsx` is the orchestration layer (~350 lines); everything else is split by concern:

| Path                             | Responsibility                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `hooks/useFilterState.ts`        | Filter state + `filteredList` (useMemo), search query, price cap, `applySearch`, `toggleFilter`   |
| `hooks/useShopModal.ts`          | Selected restaurant state, open/close animations, drag-to-dismiss gesture                         |
| `hooks/useSearchModal.ts`        | Search modal open/close, drag-to-dismiss gesture, input state                                     |
| `hooks/useToast.ts`              | Toast queue with auto-fade                                                                        |
| `components/HeaderSection.tsx`   | Search bar trigger, language picker, title island, marker mode toggles, hint snackbar             |
| `components/FilterBar.tsx`       | Random roll button, category chips, tag chips, price slider popup                                 |
| `components/MenuView.tsx`        | Virtualised menu list/grid (manual virtual scroll via `menuScrollTop`)                            |
| `components/SearchModal.tsx`     | Full-screen search UI with drag dismiss                                                           |
| `components/ShopDetailModal.tsx` | Restaurant detail sheet with drag dismiss                                                         |
| `utils.ts`                       | Pure helpers: `resistY`, `resistX` (drag resistance curves), `applyTagFilter`, `applyPriceFilter` |

### NaverMap (`src/components/NaverMap.tsx`)

Wraps the Naver Maps JavaScript SDK (loaded via `<script>` in `index.html`, typed via `@types/navermaps`). Renders custom HTML markers whose content is built by `buildMarkerContent()` — controlled by the `markerModes` Set (`"price" | "menu" | "name"`). `focusTarget` pans/zooms the map to a restaurant.

### Styling

All styles are inline `style={{}}` objects — no CSS modules, no Tailwind classes in components (Tailwind is installed but unused in the main feature). Global resets and keyframe animations are in `src/index.css` and a `<style>` tag inside `MapSelector/index.tsx`.

## Key patterns

- **Virtual scroll** in `MenuView` is manual: the parent tracks `menuScrollTop` via an `onScroll` handler and passes it down as a prop. The component derives `visibleStart`/`visibleEnd` from it on each render.
- **Drag gestures** on both modals use imperative DOM style mutations (not React state) during the drag for performance, with React state only updated on drag end.
- **`applySearch`** in `useFilterState` receives `setMarkerModes` and `setFocusTarget` as arguments so the hook doesn't need to own those states.
- **`ResizeObserver`** instances are attached directly to DOM nodes via `ref` callbacks and stored as `node._ro` for cleanup — not via `useEffect`.
