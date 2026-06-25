export default function Loading() {
  return (
    <main style={{ paddingTop: "var(--header-h)", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 0" }}>
        {/* メタ情報 */}
        <div className="flex items-center gap-2 mb-5">
          <div className="skeleton" style={{ width: "64px", height: "24px", borderRadius: "999px" }} />
          <div className="skeleton" style={{ width: "80px", height: "18px" }} />
          <div className="skeleton" style={{ width: "80px", height: "18px" }} />
        </div>

        {/* タイトル */}
        <div className="skeleton" style={{ width: "100%", height: "32px", marginBottom: "12px" }} />
        <div className="skeleton" style={{ width: "70%", height: "32px", marginBottom: "24px" }} />

        {/* アクションバー */}
        <div style={{ borderBottom: "1px solid #e5e5e5", paddingBottom: "16px", marginBottom: "24px" }}>
          <div className="skeleton" style={{ width: "64px", height: "20px" }} />
        </div>

        {/* アイキャッチ */}
        <div className="skeleton" style={{ aspectRatio: "16/9", borderRadius: 0, marginBottom: "32px" }} />

        {/* 本文 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{
            width: i === 2 || i === 5 ? "60%" : i === 7 ? "45%" : "100%",
            height: "16px",
            marginBottom: "14px",
          }} />
        ))}
      </div>
    </main>
  );
}
