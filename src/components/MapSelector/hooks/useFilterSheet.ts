import { useState, useCallback } from "react";

export function useFilterSheet() {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filterSheetClosing, setFilterSheetClosing] = useState(false);

  const openFilterSheet = useCallback(() => {
    setFilterSheetClosing(false);
    setFilterSheetOpen(true);
  }, []);

  const closeFilterSheet = useCallback(() => {
    setFilterSheetClosing(true);
    setTimeout(() => { setFilterSheetOpen(false); setFilterSheetClosing(false); }, 230);
  }, []);

  return { filterSheetOpen, filterSheetClosing, openFilterSheet, closeFilterSheet };
}
