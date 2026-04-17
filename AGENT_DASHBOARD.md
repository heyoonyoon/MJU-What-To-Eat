# MAGE Agent Platform Dashboard 🚀

이 대시보드는 **Antigravity (Gemini)**와 **Claude Code**가 협업하는 멀티 에이전트 플랫폼의 상태를 관리합니다.

## 🕒 Current Status: Online (Ready for Mission)
시스템이 모든 에이전트가 자동화된 상태로 가동 준비되었습니다.

---

## 🏗️ Hierarchy & Authority
이 프로젝트의 설계 및 구현 권한은 다음과 같이 엄격히 분리되어 있습니다.

| 역할 | 에이전트 | 위치 | 권한 및 임무 |
| :--- | :--- | :--- | :--- |
| **Lead Architect** 💎 | **Designer (Claude)** | `.claude/agents/designer.md` | **최종 설계 결정권자 (Final Decision Maker)** |
| **Analyst & Critic** 🧠 | **Planner (Gemini)** | `.gemini/agents/planner.md` | 요구사항 분석 및 설계 비평 (수정 권한 없음) |
| **Implementer** 💻 | **Coder (Gemini)** | `.gemini/agents/coder.md` | 승인된 설계 기반 정밀 구현 |
| **Quality Guard** 🔍 | **Inspector (Gemini)** | `.gemini/agents/inspector.md` | 논리/보안 검증 및 자가 치유 |
| **Vibe Checker** 🎨 | **Reviewer (Gemini)** | `.gemini/agents/reviewer.md` | 시각/UX 및 애니메이션 최종 검증 |

---

## 🛠️ Hybrid Orchestration Strategy
- **Short-cut Mode**: 단순 수정/오타 해결 시 Gemini가 Claude를 직접 호출하여 실시간 반영.
- **Contract Mode**: 복잡한 구현/신규 기능 추가 시 **G-C-G 파이프라인** 가동 (Spec-based).

---

## 🚦 Active Pipeline (Current: Idle)
1. **[Route] Gemini Planner**: 요구사항 분석 및 경로 설정.
2. **[If Contract] Claude Designer**: 설계 모델 생성 (`DESIGN_MODEL.md`) 및 **최종 승인**.
3. **[Execute] Gemini implementation**: 구현 및 검증 (Coder -> Inspector -> Reviewer).

---
*MAGE System v2.0 "Hybrid" - Operational Readiness: 100%*
