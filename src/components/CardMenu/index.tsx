import { useRef } from "react";
import { useLang } from "../../LangContext";
import { useCardDeck } from "./hooks/useCardDeck";
import { useCardMenuData } from "./hooks/useCardMenuData";
import CardDeck, { type CardDeckHandle } from "./components/CardDeck";
import CardMenuHeader from "./components/CardMenuHeader";
import CardNavBar from "./components/CardNavBar";

type Props = {
  onBack: () => void;
};

export default function CardMenu({ onBack }: Props) {
  const { lang, setLang } = useLang();
  const cards = useCardMenuData();
  const { orderedCards, offset, advance, reset } = useCardDeck(cards);
  const deckRef = useRef<CardDeckHandle>(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#f2f2f7",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CardMenuHeader lang={lang} onLangChange={setLang} onBack={onBack} />

      <div style={{ flex: 1, padding: "16px 28px", position: "relative" }}>
        <CardDeck
          ref={deckRef}
          cards={orderedCards}
          lang={lang}
          onAdvance={advance}
        />
      </div>

      <CardNavBar
        offset={offset}
        total={cards.length}
        onNext={() => deckRef.current?.swipe()}
        onReset={reset}
      />
    </div>
  );
}
