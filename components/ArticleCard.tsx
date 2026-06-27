import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/utils";
import { normalizeCategory, getImageUrl, formatViews } from "@/lib/utils";
import { formatDateJST } from "@/lib/date";

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
  viewCount?: number;
  index?: number;
}

export default function ArticleCard({ article, priority = false, viewCount, index = 0 }: ArticleCardProps) {
  const imgUrl = getImageUrl(article);
  const category = normalizeCategory(article.category);
  const date = article.publishedAt ? formatDateJST(article.publishedAt) : "";

  return (
    <Link
      href={`/articles/${article.id}`}
      className="stagger-item hover:opacity-75 transition-opacity duration-150"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "12px",
        padding: "12px 0",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        textDecoration: "none",
        color: "inherit",
        animationDelay: `${index * 0.06}s`,
      }}
    >
      <div
        style={{
          width: "100px",
          height: "75px",
          borderRadius: "10px",
          background: "#f0f0f0",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={article.title ?? ""}
            fill
            sizes="100px"
            style={{ objectFit: "cover" }}
            priority={priority}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#e5e5ea" }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {category && (
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#86868b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "4px",
            }}
          >
            {category}
          </p>
        )}
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: "6px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            color: "#1d1d1f",
          }}
        >
          {article.title}
        </h3>
        <div
          style={{
            display: "flex",
            gap: "8px",
            fontSize: "0.78rem",
            color: "#86868b",
            alignItems: "center",
          }}
        >
          {date && <span>{date}</span>}
          {viewCount !== undefined && viewCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {formatViews(viewCount)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
