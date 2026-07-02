import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/utils";
import { normalizeCategory, getImageUrl } from "@/lib/utils";
import ArticleCard from "./ArticleCard";

interface RelatedArticlesProps {
  current: Article;
  articles: Article[];
  viewCounts?: Record<string, number>;
}

/** タグを比較用の文字列集合に正規化 */
function tagKeys(article: Article): Set<string> {
  const keys = new Set<string>();
  for (const tag of article.tags ?? []) {
    const name = typeof tag === "string" ? tag : tag.name || tag.id;
    if (name) keys.add(name.trim().toLowerCase());
  }
  return keys;
}

/**
 * タグ一致（1件につき2点）＞同カテゴリ（1点）で関連度をスコアリングし、
 * 最上位を「次に読む」1本、続く4件を「関連記事」として二段構成で表示する。
 */
export default function RelatedArticles({ current, articles, viewCounts = {} }: RelatedArticlesProps) {
  const currentTags = tagKeys(current);
  const currentCategory = normalizeCategory(current.category);

  const scored = articles
    .filter((a) => a.id !== current.id)
    .map((a) => {
      let score = 0;
      for (const key of tagKeys(a)) {
        if (currentTags.has(key)) score += 2;
      }
      if (currentCategory && normalizeCategory(a.category) === currentCategory) score += 1;
      return { article: a, score };
    })
    .sort(
      (x, y) =>
        y.score - x.score ||
        (y.article.publishedAt ?? "").localeCompare(x.article.publishedAt ?? "")
    );

  const nextRead = scored[0]?.article;
  const related = scored.slice(1, 5).map((s) => s.article);

  if (!nextRead) return null;

  const nextImgUrl = getImageUrl(nextRead);
  const nextCategory = normalizeCategory(nextRead.category);

  return (
    <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid rgba(0,0,0,0.07)" }}>

      {/* ===== 次に読むべき1本（大きく） ===== */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "#fff", background: "#111", borderRadius: "4px", padding: "3px 7px" }}>
          NEXT
        </span>
        <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em", color: "#1d1d1f" }}>
          次に読む
        </h2>
      </div>
      <Link
        href={`/articles/${nextRead.id}`}
        className="hover:opacity-90 transition-opacity"
        style={{
          display: "block",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#fff",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div style={{ position: "relative", aspectRatio: "16/9", background: "#f0f0f0" }}>
          {nextImgUrl ? (
            <Image
              src={nextImgUrl}
              alt={nextRead.title ?? ""}
              fill
              sizes="(max-width: 680px) 100vw, 632px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#e5e5ea" }} />
          )}
        </div>
        <div style={{ padding: "16px 18px 18px" }}>
          {nextCategory && (
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              {nextCategory}
            </p>
          )}
          <p
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
              color: "#1d1d1f",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {nextRead.title}
          </p>
          {nextRead.description && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#555",
                lineHeight: 1.7,
                marginTop: "8px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {nextRead.description}
            </p>
          )}
        </div>
      </Link>

      {/* ===== 関連記事（リスト） ===== */}
      {related.length > 0 && (
        <div style={{ marginTop: "28px" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              marginBottom: "8px",
              color: "#1d1d1f",
            }}
          >
            関連記事
          </h2>
          <div className="flex flex-col">
            {related.map((a, i) => (
              <ArticleCard key={a.id} article={a} viewCount={viewCounts[a.id] ?? 0} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
