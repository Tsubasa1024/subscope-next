export default function Loading() {
  return (
    <main style={{ paddingTop: "96px" }}>
      <div className="container">
        {/* ヘッダー */}
        <section style={{ paddingBottom: "32px" }}>
          <div className="skeleton" style={{ width: "64px", height: "14px", marginBottom: "10px" }} />
          <div className="skeleton" style={{ width: "180px", height: "36px", marginBottom: "16px" }} />
          <div className="flex gap-2 mb-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ width: "60px", height: "32px", borderRadius: "999px" }} />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ width: "60px", height: "32px", borderRadius: "999px" }} />
            ))}
          </div>
        </section>

        {/* TOP3 カード */}
        <section style={{ paddingBottom: "80px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "32px" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row" style={{
                gap: "16px", padding: "20px", borderRadius: "28px",
                background: "#fff", boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
              }}>
                <div className="skeleton w-full sm:w-[200px] flex-shrink-0" style={{ height: "160px", borderRadius: "16px" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
                  <div className="skeleton" style={{ width: "50px", height: "12px" }} />
                  <div className="skeleton" style={{ width: "80%", height: "22px" }} />
                  <div className="skeleton" style={{ width: "100%", height: "16px" }} />
                  <div className="skeleton" style={{ width: "40%", height: "14px" }} />
                </div>
              </div>
            ))}
          </div>

          {/* 4位以降 */}
          <div style={{ borderTop: "1px solid #e5e5ea", paddingTop: "16px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3" style={{ padding: "10px 4px" }}>
                <div className="skeleton" style={{ width: "28px", height: "20px" }} />
                <div className="skeleton" style={{ width: "64px", height: "48px", borderRadius: "10px" }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: "70%", height: "16px", marginBottom: "6px" }} />
                  <div className="skeleton" style={{ width: "40%", height: "12px" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
