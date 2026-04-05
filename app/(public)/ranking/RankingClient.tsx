"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/utils";
import { getImageUrl, normalizeCategory } from "@/lib/utils";

// ─── 定数 ────────────────────────────────────────────────────

const PERIODS = [
  { key: "all",     label: "すべて" },
  { key: "weekly",  label: "週間" },
  { key: "monthly", label: "月間" },
] as const;

const CATEGORIES = [
  "すべて",
  "AI",
  "動画",
  "音楽",
  "読書",
  "フィットネス",
  "学習",
  "ビジネス",
  "その他",
];

const SORT_OPTIONS = [
  { key: "views", label: "閲覧数" },
  { key: "likes", label: "いいね" },
  { key: "newest", label: "新着" },
] as const;

type Period  = typeof PERIODS[number]["key"];
type SortKey = typeof SORT_OPTIONS[number]["key"];
type Counts  = Record<string, number>;

interface RankingClientProps {
  articles:   Article[];
  viewCounts: { all: Counts; weekly: Counts; monthly: Counts };
  likeCounts: Counts;
}

// ─── ヘルパー ─────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "999px",
        border: "1px solid #d2d2d7",
        fontSize: "0.85rem",
        background: active ? "#000" : "#fff",
        color: active ? "#fff" : "#1d1d1f",
        cursor: "pointer",
        fontWeight: active ? 600 : 400,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

// ─── メインコンポーネント ─────────────────────────────────────

export default function RankingClient({ articles, viewCounts, likeCounts }: RankingClientProps) {
  const [period,   setPeriod]   = useState<Period>("all");
  const [category, setCategory] = useState("すべて");
  const [sortBy,   setSortBy]   = useState<SortKey>("views");

  const viewCnt = viewCounts[period];

  // 1. カテゴリフィルタ
  const filtered =
    category === "すべて"
      ? articles
      : articles.filter((a) => normalizeCategory(a.category) === category);

  // 2. 並び替え
  const ranked = [...filtered].sort((a, b) => {
    if (sortBy === "views")  return (viewCnt[b.id] ?? 0) - (viewCnt[a.id] ?? 0);
    if (sortBy === "likes")  return (likeCounts[b.id] ?? 0) - (likeCounts[a.id] ?? 0);
    // newest: publishedAt 降順
    return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
  });

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  // カードのメタ情報（ソートキーに応じて表示するメトリクスを切り替え）
  function metricLabel(article: Article) {
    if (sortBy === "views")  return `👁 ${(viewCnt[article.id] ?? 0).toLocaleString()} views`;
    if (sortBy === "likes")  return `♥ ${(likeCounts[article.id] ?? 0).toLocaleString()} likes`;
    return "";
  }

  return (
    <main style={{ paddingTop: "96px" }}>
      <div className="container">

        {/* ヘッダー */}
        <section style={{ paddingBottom: "32px" }}>
          <p style={{ fontSize: "0.85rem", color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Ranking
          </p>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "10px" }}>
            ランキング
          </h1>

          {/* 期間フィルタ */}
          <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {PERIODS.map((p) => (
              <TabButton key={p.key} active={period === p.key} onClick={() => setPeriod(p.key)}>
                {p.label}
              </TabButton>
            ))}
          </div>

          {/* カテゴリフィルタ（横スクロール） */}
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "4px",
              scrollbarWidth: "none",
            }}
            className="hide-scrollbar"
          >
            {CATEGORIES.map((cat) => (
              <TabButton key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                {cat}
              </TabButton>
            ))}
          </div>

          {/* 並び替え */}
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "#86868b", flexShrink: 0 }}>並び替え</span>
            <div
              style={{
                display: "inline-flex",
                background: "#f0f0f0",
                borderRadius: "999px",
                padding: "3px",
                gap: "2px",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "999px",
                    border: "none",
                    fontSize: "0.82rem",
                    background: sortBy === opt.key ? "#fff" : "transparent",
                    color: sortBy === opt.key ? "#111" : "#777",
                    cursor: "pointer",
                    fontWeight: sortBy === opt.key ? 600 : 400,
                    boxShadow: sortBy === opt.key ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                    transition: "background 0.15s, box-shadow 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ランキング本体 */}
        <section style={{ padding: "0 0 80px" }}>
          {ranked.length === 0 ? (
            <p style={{ color: "#86868b", textAlign: "center", padding: "60px 0" }}>
              該当する記事がありません
            </p>
          ) : (
            <>
              {/* TOP 3 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "32px" }}>
                {top3.map((article, i) => {
                  const imgUrl    = getImageUrl(article);
                  const rank      = i + 1;
                  const badgeColor = rank === 1 ? "#111111" : rank === 2 ? "#666666" : "#999999";

                  return (
                    <Link
                      key={article.id}
                      href={`/articles/${article.id}`}
                      style={{
                        display: "flex",
                        gap: "20px",
                        padding: "24px",
                        borderRadius: "28px",
                        background: "#fff",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                        position: "relative",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      {/* 順位バッジ */}
                      <div
                        style={{
                          position: "absolute",
                          top: "20px",
                          left: "20px",
                          width: "54px",
                          height: "54px",
                          borderRadius: "999px",
                          background: badgeColor,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "1.2rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1,
                        }}
                      >
                        {rank}
                      </div>

                      {/* サムネイル */}
                      <div
                        style={{
                          width: "260px",
                          height: "160px",
                          borderRadius: "20px",
                          background: "#f0f0f0",
                          flexShrink: 0,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {imgUrl && (
                          <Image
                            src={imgUrl}
                            alt={article.title ?? ""}
                            fill
                            sizes="260px"
                            style={{ objectFit: "cover" }}
                            priority={rank <= 3}
                          />
                        )}
                      </div>

                      {/* テキスト */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                        {article.service && (
                          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {article.service}
                          </p>
                        )}
                        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.35 }}>
                          {article.title}
                        </h2>
                        {article.description && (
                          <p style={{ fontSize: "1rem", color: "#555" }}>{article.description}</p>
                        )}
                        <div style={{ marginTop: "8px", display: "flex", gap: "12px", fontSize: "0.9rem", color: "#86868b", alignItems: "center", flexWrap: "wrap" }}>
                          {article.publishedAt && <span>{article.publishedAt.slice(0, 10)}</span>}
                          {normalizeCategory(article.category) && (
                            <span
                              style={{
                                background: "#f0f0f0",
                                borderRadius: "999px",
                                padding: "2px 10px",
                                fontSize: "0.78rem",
                                color: "#555",
                              }}
                            >
                              {normalizeCategory(article.category)}
                            </span>
                          )}
                          {metricLabel(article) && (
                            <span>{metricLabel(article)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* 4位以降 */}
              {rest.length > 0 && (
                <div style={{ borderTop: "1px solid #e5e5ea", paddingTop: "16px" }}>
                  {rest.map((article, i) => {
                    const imgUrl = getImageUrl(article);
                    const rank   = i + 4;
                    return (
                      <Link
                        key={article.id}
                        href={`/articles/${article.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 4px",
                          borderRadius: "16px",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <span style={{ width: "28px", textAlign: "right", fontWeight: 600, fontSize: "0.95rem", color: "#555", flexShrink: 0 }}>
                          {rank}
                        </span>
                        <div style={{ width: "64px", height: "48px", borderRadius: "10px", background: "#f0f0f0", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                          {imgUrl && (
                            <Image src={imgUrl} alt={article.title ?? ""} fill sizes="64px" style={{ objectFit: "cover" }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.98rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {article.title}
                          </p>
                          <p style={{ marginTop: "2px", fontSize: "0.78rem", color: "#86868b", display: "flex", gap: "10px", alignItems: "center" }}>
                            <span>{article.publishedAt?.slice(0, 10)}</span>
                            {normalizeCategory(article.category) && (
                              <span>{normalizeCategory(article.category)}</span>
                            )}
                            {metricLabel(article) && <span>{metricLabel(article)}</span>}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <Link
              href="/articles"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                borderRadius: "40px",
                background: "#000",
                color: "#fff",
                fontSize: "0.95rem",
                fontWeight: 600,
                boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
              }}
            >
              すべての記事を見る
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
