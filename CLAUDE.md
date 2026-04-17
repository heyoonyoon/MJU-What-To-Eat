## 🚨 COMPONENT CREATION RULES — NO EXCEPTIONS

**Every new UI element (chip, modal, card, button group, etc.) MUST be created as a separate file.**

1. **JSX → `components/` folder**: Create `components/MyComponent.tsx`. Never inline new components into existing files.
2. **Logic/state → `hooks/` folder**: Create `hooks/useMyFeature.ts`. Never put hook logic directly in a component file.
3. **Even small components require their own file.** A "simple" chip, badge, or tooltip is NOT an excuse to inline.
4. **This applies at creation time**, not just when files get too long. Do not wait until 200 lines to extract.

**MANDATORY: Always split components by feature unit. Never keep logic, JSX, and state together in one file if it exceeds 200 lines. Extract hooks to hooks/, UI blocks to components/. This rule has NO exceptions.**

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

### Build & Verification

**MANDATORY: After every code modification, run the build and fix ALL errors before reporting the task as done.**

Build command: `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build`

Fix any TypeScript or build errors immediately and re-run until `✓ built` is confirmed.

### Glassmorphism Design System

**유닛 파일**: `src/components/GlassPanel.tsx`

글래스모피즘을 적용할 때는 반드시 이 유닛을 참조하세요.

```tsx
import { glassStyle } from "../GlassPanel";
// 또는 컴포넌트로
import GlassPanel from "../GlassPanel";
```

**3가지 톤 (GlassTone)**:

- `"light"` — 흰 반투명 패널 (기본값). 검색바·버튼·카드 등 일반 UI.
- `"dark"` — 검정 반투명. 힌트 스낵바·토스트 등 알림성 UI.
- `"blue"` — 파란 반투명. 강조·활성 상태.

**사용 예시**:

```tsx
// 인라인 style spread (버튼, 기존 div 유지)
style={{ ...glassStyle("light"), borderRadius: 16 }}

// 래퍼 컴포넌트
<GlassPanel tone="light" borderRadius={16}>...</GlassPanel>
```

**현재 적용된 UI**:

- 상단 검색바 / 언어 버튼 (`HeaderSection.tsx`)
- 마커 모드 아일랜드 (`index.tsx`)
- 하단 뽑기 버튼 바 (`index.tsx`)
- 탭 전환 FAB 버튼 (`index.tsx`)
