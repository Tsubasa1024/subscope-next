import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "サービス比較",
  description:
    "複数のサブスクリプションサービスをスペック・料金・機能で横並び比較。最大5サービスまで同時比較できます。",
  alternates: { canonical: "https://www.subscope.jp/compare" },
};

export default function ComparePage() {
  return (
    <main style={{ paddingTop: "96px" }}>
      <div className="container" style={{ paddingBottom: "var(--spacing-section)" }}>

        {/* ページヘッダー */}
        <section style={{ paddingBottom: "40px" }}>
          <p style={{ fontSize: "0.85rem", color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Compare
          </p>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "10px" }}>
            サービス比較
          </h1>
          <p style={{ color: "#86868b", marginTop: "12px", lineHeight: 1.7 }}>
            気になるサービスを並べて比較。料金・機能・評価を一目で確認できます。
          </p>
        </section>

        {/* プラン制限バナー */}
        <div
          style={{
            background: "#111111",
            borderRadius: "20px",
            padding: "24px 32px",
            color: "#fff",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "0.8rem", opacity: 0.8, marginBottom: "4px" }}>プランについて</p>
            <p style={{ fontWeight: 700, fontSize: "1rem" }}>
              Free: 2件 ／ Standard: 3件 ／ Pro: 5件まで同時比較
            </p>
          </div>
          <Link
            href="/login"
            style={{
              padding: "10px 24px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "40px",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)",
              whiteSpace: "nowrap",
            }}
          >
            アップグレード
          </Link>
        </div>

        {/* 準備中メッセージ */}
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            background: "var(--color-bg-secondary)",
            borderRadius: "24px",
          }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "16px" }}>⚖️</p>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>準備中</h2>
          <p style={{ color: "#86868b", lineHeight: 1.7 }}>
            比較機能は現在開発中です。<br />
            サービスデータベースと連携して近日公開予定です。
          </p>
          <Link
            href="/services"
            style={{
              display: "inline-block",
              marginTop: "24px",
              padding: "12px 32px",
              borderRadius: "40px",
              background: "#1d1d1f",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            サービス一覧を見る
          </Link>
        </div>
      </div>
    </main>
  );
}
