import { useState, useCallback } from "react";
import type { MarkerModeKey, MarkerModes } from "../../NaverMap";

export function useMarkerMode() {
  const [markerModes, setMarkerModes] = useState<MarkerModes>(
    new Set(["price"]),
  );
  const [markerIslandOpen, setMarkerIslandOpen] = useState(true);

  const handleToggleMarkerMode = useCallback((mode: MarkerModeKey) => {
    setMarkerModes((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) {
        if (next.size === 1) return prev;
        next.delete(mode);
      } else {
        next.add(mode);
      }
      return next;
    });
  }, []);

  return {
    markerModes,
    setMarkerModes,
    markerIslandOpen,
    setMarkerIslandOpen,
    handleToggleMarkerMode,
  };
}
