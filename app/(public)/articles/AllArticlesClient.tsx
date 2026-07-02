"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Article } from "@/lib/utils";
import { normalizeCategory } from "@/lib/utils";
import ArticleCard from "@/components/ArticleCard";

interface AllArticlesClientProps {
  articles: Article[];
  categories: string[];
  initialCategory?: string;
  initialSearch?: string;
  initialType?: string;
  viewCounts?: Record<string, number>;
}

export default function AllArticlesClient({
  articles,
  initialCategory = "すべて",
  initialSearch = "",
  viewCounts = {},
}: AllArticlesClientProps) {
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery,    setSearchQuery]    = useState(initialSearch);
  const [activeType,     setActiveType]     = useState("all");

  useEffect(() => {
    const cat = searchParams.get("category") ?? "すべて";
    const q   = searchParams.get("q")        ?? "";
    const t   = searchParams.get("type")     ?? "all";
    setActiveCategory(cat);
    setSearchQuery(q);
    setActiveType(t);
  }, [searchParams]);

  const filtered = articles.filter((a) => {
    // contentType は microCMS 上 "news（ニュース）" / "article（記事）" 形式の値
    const matchType =
      activeType === "all" ||
      String(a.contentType ?? "").includes(activeType);

    const matchCategory =
      activeCategory === "すべて" ||
      normalizeCategory(a.category) === activeCategory;

    const matchSearch =
      searchQuery === "" ||
      [a.title, a.description, normalizeCategory(a.category)]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchType && matchCategory && matchSearch;
  });

  return (
    <main style={{ paddingTop: "var(--header-h)" }}>

      {/* ページタイトル */}
      <div className="container" style={{ paddingTop: "32px", paddingBottom: "16px" }}>
        {activeCategory !== "すべて" ? (
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {activeCategory}
          </h1>
        ) : (
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            記事一覧
          </h1>
        )}
        {searchQuery && (
          <p className="mt-2 text-sm" style={{ color: "#86868b" }}>
            「{searchQuery}」の検索結果：{filtered.length}件
          </p>
        )}
      </div>

      {/* 記事グリッド */}
      <div className="container" style={{ paddingBottom: "var(--spacing-section)" }}>
        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "#86868b" }}>
            <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24"
              fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="font-semibold mb-2" style={{ color: "#1d1d1f" }}>記事が見つかりませんでした</p>
            <p className="text-sm">キーワードやカテゴリを変えてお試しください。</p>
          </div>
        ) : (
          <div className="articles-grid">
            {filtered.map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                priority={i < 3}
                viewCount={viewCounts[article.id] ?? 0}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
