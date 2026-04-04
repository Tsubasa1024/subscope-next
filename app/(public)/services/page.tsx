import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "サービス一覧",
  description:
    "SUBSCOPEが厳選したサブスクリプションサービスの一覧。カテゴリ・料金・評価で絞り込んで自分にぴったりのサブスクを見つけよう。",
  alternates: { canonical: "https://www.subscope.jp/services" },
};

// カテゴリー（後でDBから取得）
const CATEGORIES = [
  { id: "all",            label: "すべて" },
  { id: "video",          label: "動画" },
  { id: "music",          label: "音楽" },
  { id: "reading",        label: "読書・マンガ" },
  { id: "learning",       label: "学習" },
  { id: "fitness",        label: "フィットネス" },
  { id: "food",           label: "フード" },
  { id: "cloud",          label: "クラウド・ツール" },
  { id: "beauty",         label: "美容・ファッション" },
];

export default function ServicesPage() {
  return (
    <main style={{ paddingTop: "96px" }}>
      <div className="container" style={{ paddingBottom: "var(--spacing-section)" }}>

        {/* ページヘッダー */}
        <section style={{ paddingBottom: "40px" }}>
          <p style={{ fontSize: "0.85rem", color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Services
          </p>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "10px" }}>
            サービス一覧
          </h1>
          <p style={{ color: "#86868b", marginTop: "12px", lineHeight: 1.7 }}>
            カテゴリ・料金・評価で絞り込んで、あなたにぴったりのサブスクを見つけよう。
          </p>
        </section>

        {/* カテゴリタブ */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
          {CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              style={{
                padding: "8px 20px",
                borderRadius: "99px",
                border: id === "all" ? "none" : "1px solid var(--color-border)",
                background: id === "all" ? "#1d1d1f" : "transparent",
                color: id === "all" ? "#fff" : "var(--color-text-main)",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          ))}
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
          <p style={{ fontSize: "3rem", marginBottom: "16px" }}>🚧</p>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>準備中</h2>
          <p style={{ color: "#86868b", lineHeight: 1.7 }}>
            サービスデータベースを構築中です。<br />
            まもなく公開予定です。
          </p>
          <Link
            href="/"
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
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
