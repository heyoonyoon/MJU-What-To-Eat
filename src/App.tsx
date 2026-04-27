import { useState } from "react";
import MapSelector from "./components/MapSelector";
import CardMenu from "./components/CardMenu";
import type { BottomTab } from "./components/BottomTabBar";

type View = "cards" | "map";
type MapInitialTab = "map" | "menu";

const App = () => {
  const [view, setView] = useState<View>("cards");
  const [mapInitialTab, setMapInitialTab] = useState<MapInitialTab>("map");

  const handleTabChange = (tab: BottomTab) => {
    if (tab === "cards") {
      setView("cards");
    } else {
      setMapInitialTab(tab);
      setView("map");
    }
  };

  if (view === "cards") {
    return <CardMenu onTabChange={handleTabChange} />;
  }
  return <MapSelector initialTab={mapInitialTab} onTabChange={handleTabChange} />;
};

export default App;
