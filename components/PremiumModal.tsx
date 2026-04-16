"use client";

interface PremiumModalProps {
  onClose: () => void;
}

export default function PremiumModal({ onClose }: PremiumModalProps) {
  async function handleUpgrade() {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    if (!res.ok) {
      alert("決済ページの準備に失敗しました。しばらくしてからお試しください。");
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.5)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: "28px", padding: "40px 32px",
          maxWidth: "420px", width: "100%",
          boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Crown icon */}
        <div style={{ textAlign: "center", marginBottom: "16px", fontSize: "3rem" }}>👑</div>

        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, textAlign: "center", marginBottom: "8px", letterSpacing: "-0.02em" }}>
          プレミアムプランへ
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#86868b", textAlign: "center", marginBottom: "28px", lineHeight: 1.7 }}>
          無料プランでは保存できる記事は<strong style={{ color: "#1d1d1f" }}>3件まで</strong>です。<br />
          プレミアムプランにアップグレードすると<br />
          <strong style={{ color: "#1d1d1f" }}>無制限</strong>で記事を保存できます。
        </p>

        {/* Features */}
        <div style={{
          background: "#f5f5f7", borderRadius: "16px", padding: "20px 24px",
          marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px",
        }}>
          {[
            "記事の保存が無制限",
            "いいねが無制限",
            "広告なしで快適に閲覧",
          ].map((feat) => (
            <div key={feat} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.875rem", fontWeight: 500 }}>
              <span style={{ color: "#34c759", fontSize: "1rem" }}>✓</span>
              {feat}
            </div>
          ))}
        </div>

        <button
          onClick={handleUpgrade}
          style={{
            width: "100%", padding: "15px", borderRadius: "14px",
            background: "#111111", color: "#fff",
            border: "none", fontSize: "0.95rem",
            fontWeight: 700, cursor: "pointer", marginBottom: "12px",
          }}
        >
          プレミアムにアップグレード
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "13px", borderRadius: "14px",
            background: "transparent", color: "#86868b",
            border: "1px solid rgba(0,0,0,0.1)", fontSize: "0.9rem",
            fontWeight: 500, cursor: "pointer",
          }}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
