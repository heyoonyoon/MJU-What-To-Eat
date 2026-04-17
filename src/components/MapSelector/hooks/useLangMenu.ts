import { useState, useCallback, useRef } from "react";

export function useLangMenu() {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [langMenuVisible, setLangMenuVisible] = useState(false);
  const [langMenuPos, setLangMenuPos] = useState<{ top: number; right: number }>(
    { top: 60, right: 16 },
  );
  const langBtnRef = useRef<HTMLButtonElement | null>(null);

  const openLangMenu = useCallback(() => {
    const rect = langBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setLangMenuPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setLangMenuOpen(true);
    requestAnimationFrame(() => setLangMenuVisible(true));
  }, []);

  const closeLangMenu = useCallback(() => {
    setLangMenuVisible(false);
    setTimeout(() => setLangMenuOpen(false), 180);
  }, []);

  return {
    langMenuOpen,
    langMenuVisible,
    langMenuPos,
    langBtnRef,
    openLangMenu,
    closeLangMenu,
  };
}
