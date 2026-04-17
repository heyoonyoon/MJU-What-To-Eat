Core Constraints
File Limits: Max 200 lines. Exceeding 500 lines REQUIRES splitting (hooks/components/utils).
No Prop Refs: Never pass ref as a prop. Use onXxxReady: (node: T | null) => void for parent-child DOM syncing.
State Flow: No setState in useEffect. Derive state during render or use useMemo.
Mandatory I18n: All UI text must use t[lang].key from src/i18n.ts.

Architecture & Conventions
Context Layering & Efficiency (Tokens)

- Layer 1 (Blueprint): Always refer to CLAUDE.md and directory structure.
- Layer 2 (Schema): Use src/types/restaurant.ts for data structures.
- Layer 3 (Implementation): Read only the component file you are editing.
- Layer 4 (Raw Data): Use `grep` or line-range reads for data2.ts.

### 🚨 Mandatory Dispatch Protocol (CRITICAL)

1. **Requirement Inbound**: For ANY user requirement (feature implementation, modification, etc.), you MUST load the `planner.md` (Gemini Planner) agent protocol first.
2. **Analysis**: The Planner will analyze the requirement and create `CLAUDE_TASK.md`.
3. **Execution**: Follow the Planner's routing (Short-cut or Contract-based) to continue.

_Environment Note: Local Node/icu4c mismatch prevents CLI runtime execution. Use browser for verification._
