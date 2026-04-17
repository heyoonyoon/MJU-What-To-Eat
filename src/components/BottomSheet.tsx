interface BottomSheetProps {
  onClose: () => void;
  onSheetReady: (node: HTMLDivElement | null) => void;
  onOverlayReady: (node: HTMLDivElement | null) => void;
  onDragStart: (clientX: number, clientY: number) => void;
  maxHeight?: string;
  height?: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  onClose,
  onSheetReady,
  onOverlayReady,
  onDragStart,
  maxHeight = "80vh",
  height,
  children,
}: BottomSheetProps) {
  return (
    <>
      <div
        ref={onOverlayReady}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(0,0,0,0.35)",
          animation: "overlayFadeIn 0.2s ease forwards",
        }}
      />
      <div
        ref={onSheetReady}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10001,
          background: "#ffffff",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.13)",
          display: "flex",
          flexDirection: "column",
          maxHeight,
          height,
          animation:
            "shopModalSlideUp 0.32s cubic-bezier(0.2,0.8,0.2,1) forwards",
        }}
      >
        {/* 드래그 핸들 pill */}
        <div
          style={{
            flexShrink: 0,
            cursor: "grab",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
          onTouchStart={(e) =>
            onDragStart(e.touches[0].clientX, e.touches[0].clientY)
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "12px",
              paddingBottom: "4px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "4px",
                borderRadius: "2px",
                background: "#e0e0e0",
              }}
            />
          </div>
        </div>

        {children}
      </div>
    </>
  );
}
