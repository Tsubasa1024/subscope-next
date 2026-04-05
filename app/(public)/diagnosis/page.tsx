import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "サブスク診断",
  description:
    "いくつかの質問に答えるだけで、あなたにぴったりのサブスクリプションが見つかる診断ツール。",
  alternates: { canonical: "https://www.subscope.jp/diagnosis" },
};

// 診断カテゴリー（後でDBから取得）
const DIAGNOSIS_TYPES = [
  {
    id: "lifestyle",
    icon: "🎯",
    title: "ライフスタイル診断",
    description: "あなたの生活スタイルから最適なサブスクを提案",
    questions: 8,
    minutes: 3,
  },
  {
    id: "entertainment",
    icon: "🎬",
    title: "エンタメ診断",
    description: "動画・音楽・読書の好みで絞り込み",
    questions: 6,
    minutes: 2,
  },
  {
    id: "learning",
    icon: "📚",
    title: "学習・スキルアップ診断",
    description: "目標や学習スタイルに合ったサービスを発見",
    questions: 7,
    minutes: 3,
  },
  {
    id: "budget",
    icon: "💰",
    title: "予算別おすすめ診断",
    description: "月額予算から最もコスパの高いサブスクを提案",
    questions: 5,
    minutes: 2,
  },
];

export default function DiagnosisPage() {
  return (
    <main style={{ paddingTop: "96px" }}>
      <div className="container" style={{ paddingBottom: "var(--spacing-section)" }}>

        {/* ページヘッダー */}
        <section style={{ paddingBottom: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Diagnosis
          </p>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "10px" }}>
            サブスク診断
          </h1>
          <p style={{ color: "#86868b", marginTop: "12px", lineHeight: 1.7, maxWidth: "480px", margin: "12px auto 0" }}>
            いくつかの質問に答えるだけで、<br />
            あなたにぴったりのサブスクが見つかります。
          </p>
        </section>

        {/* 診断カード一覧 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          {DIAGNOSIS_TYPES.map((d) => (
            <div
              key={d.id}
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "2.4rem" }}>{d.icon}</span>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.4 }}>{d.title}</h2>
              <p style={{ fontSize: "0.875rem", color: "#86868b", lineHeight: 1.6 }}>{d.description}</p>
              <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "#86868b" }}>
                <span>📝 {d.questions}問</span>
                <span>⏱ 約{d.minutes}分</span>
              </div>
              <button
                disabled
                style={{
                  marginTop: "8px",
                  padding: "11px 0",
                  borderRadius: "12px",
                  background: "#f0f0f2",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#86868b",
                  cursor: "not-allowed",
                  fontFamily: "inherit",
                }}
              >
                準備中
              </button>
            </div>
          ))}
        </div>

        {/* 開発中ノート */}
        <div
          style={{
            background: "#f5f5f5",
            borderRadius: "20px",
            padding: "28px 32px",
            border: "1px solid #e5e5e5",
          }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: "8px", color: "#111111" }}>🔨 開発中</h3>
          <p style={{ fontSize: "0.875rem", color: "#666666", lineHeight: 1.7 }}>
            診断ロジックはSupabaseの <code>diagnosis_questions</code> / <code>diagnosis_options</code> /
            <code>diagnosis_results</code> テーブルと連携予定です。<br />
            近日公開予定。お楽しみに！
          </p>
        </div>
      </div>
    </main>
  );
}
