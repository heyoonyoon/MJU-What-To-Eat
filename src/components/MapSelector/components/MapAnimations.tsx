export default function MapAnimations() {
  return (
    <style>{`
      @keyframes scrollBounce {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(4px); }
      }
      @keyframes snackSlideDown {
        from { opacity: 0; transform: translateY(-12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes snackFadeOut {
        0%   { opacity: 1; max-height: 60px; margin-bottom: 0px; padding-top: 10px; padding-bottom: 10px; }
        60%  { opacity: 0; max-height: 60px; margin-bottom: 0px; padding-top: 10px; padding-bottom: 10px; }
        100% { opacity: 0; max-height: 0px;  margin-bottom: -6px; padding-top: 0px; padding-bottom: 0px; }
      }
      @keyframes searchModalSlideDown {
        from { opacity: 0; transform: translateY(-16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes shopModalSlideUp {
        from { opacity: 0; transform: translateY(100%); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes filterSheetSlideDown {
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(100%); }
      }
      @keyframes overlayFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes overlayFadeOut {
        from { opacity: 1; }
        to   { opacity: 0; }
      }
      @keyframes rollBtnPress {
        0%   { background: rgba(0,0,0,0.03); color: #333; border-color: #d1d5db; }
        15%  { background: #0066ff; color: white; border-color: #0066ff; }
        100% { background: rgba(0,0,0,0.03); color: #333; border-color: #d1d5db; }
      }
      @keyframes menuViewFadeIn {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes fabIconPop {
        0% { opacity: 0; transform: scale(0.85) translateY(6px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      .roll-btn-pressing {
        animation: rollBtnPress 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
      }
      @keyframes rollPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.03); }
        100% { transform: scale(1); }
      }
      .roll-pulse-active {
        animation: rollPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes rollWinningPop {
        0% { transform: scale(0.94) translateY(10px); opacity: 0; }
        50% { transform: scale(1.03) translateY(-2px); opacity: 1; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
      .roll-winning-anim {
        animation: rollWinningPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
        background-color: #ffffff !important;
        z-index: 10;
        position: relative;
      }
      .header-backdrop {
        position: absolute;
        top: 8px;
        left: 12px;
        right: 12px;
        border-radius: 24px;
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        border: 1px solid transparent;
        box-shadow: none;
        transition: background 0.35s ease, backdrop-filter 0.35s ease, -webkit-backdrop-filter 0.35s ease, border 0.35s ease, box-shadow 0.35s ease;
        pointer-events: none;
      }
      .header-backdrop.is-scrolled {
        background: linear-gradient(
          160deg,
          rgba(255, 255, 255, 0.6) 0%,
          rgba(255, 255, 255, 0.2) 100%
        );
        backdrop-filter: blur(30px) saturate(200%) brightness(1.05);
        -webkit-backdrop-filter: blur(30px) saturate(200%) brightness(1.05);
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      }
    `}</style>
  );
}
