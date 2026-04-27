# Code Rules

Supplemental rules for this project. **These are mandatory — no exceptions.**

---

## Component Syntax

**Always use arrow function syntax for components.** Never use `function` declarations for React components.

```tsx
// CORRECT
const MyComponent = ({ foo }: Props) => {
  return <div>{foo}</div>;
};
export default MyComponent;

// WRONG
export default function MyComponent({ foo }: Props) {
  return <div>{foo}</div>;
}
```

---

## One Export Per Component File

**A component file must export only the default component.** The `react-refresh/only-export-components` ESLint rule enforces this — mixing a component default export with named utility exports (functions, constants, types) breaks Fast Refresh and causes lint errors.

**Rule:** If a function or constant is needed by another file, extract it to a dedicated file:

- Pure utility functions → `utils/<name>.ts`
- Shared types → `types/<name>.ts`
- Hook logic → `hooks/use<Name>.ts`

```tsx
// WRONG — cardColor is a named export alongside a default component export
export function cardColor(item: CardItem): string { ... }
export default function MenuCard(...) { ... }

// CORRECT — cardColor lives in utils/cardColor.ts; MenuCard file has only the default export
// utils/cardColor.ts
export const cardColor = (item: CardItem): string => { ... };

// components/MenuCard.tsx
import { cardColor } from "../utils/cardColor";
const MenuCard = (...) => { ... };
export default MenuCard;
```

---

## No Impure Functions Inside Hooks or Render

**Never call `Math.random()`, `Date.now()`, or any other impure function inside `useMemo`, `useCallback`, or render logic.** React's purity rules forbid it and `react-hooks/purity` will error.

Instead, run impure initialization at **module scope** so it executes once at module load:

```ts
// WRONG
export function useShuffledItems() {
  return useMemo(() => {
    const j = Math.floor(Math.random() * n); // ❌ impure inside useMemo
    ...
  }, []);
}

// CORRECT
function buildShuffled() {
  const j = Math.floor(Math.random() * n); // ✅ runs at module load, outside React
  ...
}
const shuffled = buildShuffled();

export function useShuffledItems() {
  return shuffled;
}
```
