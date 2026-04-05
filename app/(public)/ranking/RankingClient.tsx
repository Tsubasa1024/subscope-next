"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";

const PERIODS = [
  { key: "all",     label: "すべて" },
  { key: "weekly",  label: "週間" },
  { key: "monthly", label: "月間" },
] as const;

type Period = typeof PERIODS[number]["key"];

type ViewCounts = Record<string, number>;

interface RankingClientProps {
  articles: Article[];
  viewCounts: { all: ViewCounts; weekly: ViewCounts; monthly: ViewCounts };
}

export default function RankingClient({ articles, viewCounts }: RankingClientProps) {
  const [period, setPeriod] = useState<Period>("all");

  const counts = viewCounts[period];
  const ranked = [...articles].sort(
    (a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)
  );
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <main style={{ paddingTop: "96px" }}>
      <div className="container">
        {/* ヘッダー */}
        <section style={{ paddingBottom: "40px" }}>
          <p style={{ fontSize: "0.85rem", color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Ranking
          </p>
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginTop: "10px",
            }}
          >
            ランキング
          </h1>

          {/* 期間切り替え */}
          <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: "1px solid #d2d2d7",
                  fontSize: "0.85rem",
                  background: period === p.key ? "#000" : "#fff",
                  color: period === p.key ? "#fff" : "#1d1d1f",
                  cursor: "pointer",
                  fontWeight: period === p.key ? 600 : 400,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* TOP 3 */}
        <section style={{ padding: "16px 0 80px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "32px" }}>
            {top3.map((article, i) => {
              const imgUrl = getImageUrl(article);
              const rank = i + 1;
              const badgeColor =
                rank === 1 ? "#111111" : rank === 2 ? "#666666" : "#999999";
              const views = counts[article.id] ?? 0;

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
                    cursor: "pointer",
                    position: "relative",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {/* バッジ */}
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

                  {/* コンテンツ */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                    {article.service && (
                      <p
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#86868b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {article.service}
                      </p>
                    )}
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.35 }}>
                      {article.title}
                    </h2>
                    {article.description && (
                      <p style={{ fontSize: "1rem", color: "#555" }}>{article.description}</p>
                    )}
                    <div style={{ marginTop: "8px", display: "flex", gap: "16px", fontSize: "0.9rem", color: "#86868b", alignItems: "center" }}>
                      {article.publishedAt && (
                        <span>{article.publishedAt.slice(0, 10)}</span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        👁 {views.toLocaleString()} views
                      </span>
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
                const rank = i + 4;
                const views = counts[article.id] ?? 0;
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
                      cursor: "pointer",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        textAlign: "right",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: "#555",
                        flexShrink: 0,
                      }}
                    >
                      {rank}
                    </span>
                    <div
                      style={{
                        width: "64px",
                        height: "48px",
                        borderRadius: "10px",
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
                          sizes="64px"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.98rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {article.title}
                      </p>
                      <p style={{ marginTop: "2px", fontSize: "0.78rem", color: "#86868b", display: "flex", gap: "10px" }}>
                        <span>{article.publishedAt?.slice(0, 10)}</span>
                        <span>👁 {views.toLocaleString()} views</span>
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
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
