import { useState } from "react";
import MapSelector from "./components/MapSelector";
import CardMenu from "./components/CardMenu";

type View = "map" | "cards";

export default function App() {
  const [view, setView] = useState<View>("map");

  if (view === "cards") {
    return <CardMenu onBack={() => setView("map")} />;
  }
  return <MapSelector onOpenCardMenu={() => setView("cards")} />;
}
