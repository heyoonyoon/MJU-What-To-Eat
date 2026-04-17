import { useState, useCallback } from "react";
import type { Restaurant } from "../../../types/restaurant";
import type { MarkerModes } from "../../NaverMap";

interface UseRollStateProps {
  filteredList: Restaurant[];
  filteredMenuIds: Set<string> | null;
  setMarkerModes: React.Dispatch<React.SetStateAction<MarkerModes>>;
  setFocusTarget: React.Dispatch<React.SetStateAction<Restaurant | null>>;
}

export function useRollState({
  filteredList,
  filteredMenuIds,
  setMarkerModes,
  setFocusTarget,
}: UseRollStateProps) {
  const [rolledId, setRolledId] = useState<string | null>(null);
  const [rolledMenuKey, setRolledMenuKey] = useState<{
    restaurantId: string;
    menuId: string;
  } | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const rolledRestaurant =
    rolledId !== null
      ? (filteredList.find((r) => r.id === rolledId) ?? null)
      : null;

  const rolledMenuRestaurant =
    rolledMenuKey !== null
      ? (filteredList.find((r) => r.id === rolledMenuKey.restaurantId) ?? null)
      : null;

  const rolledMenuIdSet =
    rolledMenuKey !== null
      ? new Set([`${rolledMenuKey.restaurantId}-${rolledMenuKey.menuId}`])
      : null;

  const handleRoll = useCallback(() => {
    setRolledMenuKey(null);
    const idx = Math.floor(Math.random() * filteredList.length);
    const picked = filteredList[idx] ?? null;
    setRolledId(picked?.id ?? null);
    setFocusTarget(picked);
    setMarkerModes((prev) =>
      prev.has("name") ? prev : new Set([...prev, "name"]),
    );
    setConfettiTrigger((t) => t + 1);
  }, [filteredList, setFocusTarget, setMarkerModes]);

  const handleRollMenu = useCallback(() => {
    setRolledId(null);
    const allMenus = filteredList.flatMap((r) =>
      (r.menus || [])
        .filter(
          (m) =>
            filteredMenuIds === null ||
            filteredMenuIds.has(`${r.id}-${m.menuId}`),
        )
        .map((m) => ({ restaurantId: r.id, menuId: m.menuId, r })),
    );
    if (allMenus.length === 0) return;
    const picked = allMenus[Math.floor(Math.random() * allMenus.length)];
    setRolledMenuKey({
      restaurantId: picked.restaurantId,
      menuId: picked.menuId,
    });
    setFocusTarget(picked.r);
    setMarkerModes((prev) =>
      prev.has("menu") ? prev : new Set([...prev, "menu"]),
    );
    setConfettiTrigger((t) => t + 1);
  }, [filteredList, filteredMenuIds, setFocusTarget, setMarkerModes]);

  const handleUnroll = useCallback(() => {
    setRolledId(null);
    setRolledMenuKey(null);
  }, []);

  return {
    rolledId,
    rolledMenuKey,
    confettiTrigger,
    rolledRestaurant,
    rolledMenuRestaurant,
    rolledMenuIdSet,
    handleRoll,
    handleRollMenu,
    handleUnroll,
  };
}
