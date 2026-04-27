type Props = {
  onDislike: () => void;
  onLike: () => void;
};

const SwipeActionButtons = ({ onDislike, onLike }: Props) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 48,
      paddingBottom: 32,
      paddingTop: 20,
    }}
  >
    <button
      onClick={onDislike}
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        border: "none",
        background: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 28,
      }}
    >
      ✕
    </button>
    <button
      onClick={onLike}
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        border: "none",
        background: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 28,
      }}
    >
      ♥
    </button>
  </div>
);

export default SwipeActionButtons;
