import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "運営会社 | SUBSCOPE",
};

const rows: { label: string; value: string }[] = [
  { label: "サービス名",     value: "SUBSCOPE" },
  { label: "運営者",         value: "個人運営" },
  { label: "所在地",         value: "神奈川県" },
  { label: "設立",           value: "2025年" },
  { label: "お問い合わせ",   value: "subscope.info@gmail.com" },
];

export default function CompanyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", paddingTop: "var(--header-h)" }}>
      <main style={{ display: "flex", justifyContent: "center", padding: "48px 16px 80px" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>

          {/* ページタイトル */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>
              運営会社
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#86868b", marginTop: 8 }}>
              SUBSCOPEは個人が運営するサービスです。
            </p>
          </div>

          {/* 情報テーブル */}
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {rows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 16,
                  padding: "18px 28px",
                  borderBottom: i < rows.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#86868b", minWidth: 120, flexShrink: 0 }}>
                  {row.label}
                </span>
                <span style={{ fontSize: "0.9rem", color: "#111", lineHeight: 1.6 }}>
                  {row.label === "お問い合わせ" ? (
                    <a href={`mailto:${row.value}`} style={{ color: "#111", textDecoration: "underline", textUnderlineOffset: 3 }}>
                      {row.value}
                    </a>
                  ) : row.value}
                </span>
              </div>
            ))}
          </div>

          {/* 補足テキスト */}
          <div style={{ marginTop: 24, background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "24px 28px" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111", marginBottom: 12 }}>サービスについて</h2>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#444" }}>
              SUBSCOPEは、サブスクリプションサービスの比較・レビュー・情報収集を目的としたメディアサービスです。
              各サービスの最新情報や料金、ユーザーレビューをもとに、あなたに合ったサブスクリプション選びをサポートします。
            </p>
            <div style={{ borderTop: "1px solid #f0f0f0", margin: "20px 0" }} />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111", marginBottom: 12 }}>お問い合わせ</h2>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#444" }}>
              ご意見・ご要望・不具合の報告など、お問い合わせは{" "}
              <a href="mailto:subscope.info@gmail.com" style={{ color: "#111", textDecoration: "underline", textUnderlineOffset: 3 }}>
                subscope.info@gmail.com
              </a>{" "}
              までお気軽にご連絡ください。
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
