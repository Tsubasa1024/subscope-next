import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/utils";
import { normalizeCategory, getImageUrl, formatViews } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
  viewCount?: number;
}

export default function ArticleCard({ article, priority = false, viewCount }: ArticleCardProps) {
  const imgUrl = getImageUrl(article);
  const category = normalizeCategory(article.category);
  const date = article.publishedAt ? article.publishedAt.slice(0, 10) : "";

  return (
    <Link
      href={`/articles/${article.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.4s var(--ease-out-expo), transform 0.4s var(--ease-out-expo)",
        textDecoration: "none",
        color: "inherit",
      }}
      className="article-card-link"
    >
      {/* サムネイル */}
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          position: "relative",
          background: "#f0f0f0",
          flexShrink: 0,
        }}
      >
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={article.title ?? ""}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            priority={priority}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#e5e5ea" }} />
        )}
        {category && (
          <span
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: "99px",
              background: "rgba(0,0,0,0.52)",
              backdropFilter: "blur(6px)",
              color: "#fff",
              pointerEvents: "none",
            }}
          >
            {category}
          </span>
        )}
      </div>

      {/* 本文 */}
      <div
        style={{
          padding: "14px 16px 0",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {article.service && (
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#86868b",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            {article.service}
          </p>
        )}
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: 1.45,
            marginBottom: "7px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            color: "#1d1d1f",
          }}
        >
          {article.title}
        </h3>
        {article.description && (
          <p
            style={{
              fontSize: "12px",
              color: "#666",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flexGrow: 1,
            }}
          >
            {article.description}
          </p>
        )}
      </div>

      {/* フッター */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px 14px",
          marginTop: "10px",
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "10px", color: "#86868b" }}>{date}</span>
          {viewCount !== undefined && viewCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "#86868b" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {formatViews(viewCount)}
            </span>
          )}
        </span>
        <span
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "1px solid rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="#1d1d1f"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6h8M6 2l4 4-4 4" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
