export default function Loading() {
  return (
    <main style={{ paddingTop: "96px", paddingBottom: "60px" }}>
      <div className="container">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="skeleton" style={{ width: "120px", height: "28px" }} />
          <div className="skeleton" style={{ width: "80px", height: "20px" }} />
        </div>

        {/* カテゴリタブ */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: "72px", height: "32px", borderRadius: "999px" }} />
          ))}
        </div>

        {/* カードグリッド */}
        <div className="articles-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="skeleton" style={{ aspectRatio: "16/9", borderRadius: 0 }} />
              <div style={{ padding: "16px" }}>
                <div className="skeleton" style={{ width: "40%", height: "12px", marginBottom: "10px" }} />
                <div className="skeleton" style={{ width: "100%", height: "16px", marginBottom: "8px" }} />
                <div className="skeleton" style={{ width: "75%", height: "16px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
