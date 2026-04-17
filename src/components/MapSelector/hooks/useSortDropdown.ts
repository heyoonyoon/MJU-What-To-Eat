import { useState, useRef, useCallback } from "react";

export function useSortDropdown() {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [sortDropdownPos, setSortDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const sortBtnRef = useRef<HTMLButtonElement | null>(null);
  const sortClosingRef = useRef(false);

  const openSortDropdown = useCallback(() => {
    const rect = sortBtnRef.current?.getBoundingClientRect();
    if (rect) setSortDropdownPos({ top: rect.bottom + 6, left: rect.left });
    setSortDropdownOpen(true);
    requestAnimationFrame(() => setSortDropdownVisible(true));
  }, []);

  const closeSortDropdown = useCallback(() => {
    sortClosingRef.current = true;
    setSortDropdownVisible(false);
    setTimeout(() => { setSortDropdownOpen(false); sortClosingRef.current = false; }, 180);
  }, []);

  const openSortDropdownSafe = useCallback(() => {
    if (!sortClosingRef.current) openSortDropdown();
  }, [openSortDropdown]);

  return {
    sortDropdownOpen, sortDropdownVisible, sortDropdownPos,
    sortBtnRef, openSortDropdownSafe, closeSortDropdown,
  };
}
