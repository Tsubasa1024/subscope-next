export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getNewsList, getArticlesList, getImageUrl, normalizeCategory } from "@/lib/microcms";
import NewsCarousel, { type NewsDay } from "@/components/NewsCarousel";
import { formatDateJST, todayJST, yesterdayJST } from "@/lib/date";
import type { Article } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/features";
import { fetchAllViewCounts, fetchWeeklyViewCounts } from "@/lib/viewCounts";
import { formatViews } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SUBSCOPE｜AIニュース・ツール活用メディア",
  description:
    "ChatGPT・Claude・Gemini・Grokなど、主要AIの最新ニュースを毎日更新。初心者向けの使い方から徹底比較まで、AI活用に役立つ情報を発信するメディアです。",
  alternates: { canonical: "https://www.subscope.jp/" },
  openGraph: {
    title: "SUBSCOPE｜AIニュース・ツール活用メディア",
    description:
      "ChatGPT・Claude・Gemini・Grokなど、主要AIの最新ニュースを毎日更新。初心者向けの使い方から徹底比較まで、AI活用に役立つ情報を発信するメディアです。",
  },
  twitter: {
    title: "SUBSCOPE｜AIニュース・ツール活用メディア",
    description:
      "ChatGPT・Claude・Gemini・Grokなど、主要AIの最新ニュースを毎日更新。初心者向けの使い方から徹底比較まで、AI活用に役立つ情報を発信するメディアです。",
  },
};


// ============================================================
// Page
// ============================================================
type RankingItem = {
  id: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  avgScore: number;
  reviewCount: number;
};

async function fetchTop5Rankings(): Promise<RankingItem[]> {
  const supabase = await createClient();

  const [{ data: reviewRows }, { data: serviceRows }] = await Promise.all([
    supabase.from("service_reviews").select("service_id, score"),
    supabase
      .from("services")
      .select("id, name, logo_url, category_id, categories(name)")
      .eq("is_active", true),
  ]);

  type ReviewRow = { service_id: string; score: number };
  const statsMap: Record<string, { total: number; count: number }> = {};
  for (const row of (reviewRows ?? []) as ReviewRow[]) {
    if (!statsMap[row.service_id]) statsMap[row.service_id] = { total: 0, count: 0 };
    statsMap[row.service_id].total += row.score;
    statsMap[row.service_id].count += 1;
  }

  type ServiceRow = {
    id: string;
    name: string;
    logo_url: string | null;
    category_id: number | null;
    categories: { name: string } | null;
  };

  return ((serviceRows ?? []) as unknown as ServiceRow[])
    .filter((s) => statsMap[s.id])
    .map((s) => {
      const stats = statsMap[s.id];
      return {
        id: s.id,
        name: s.name,
        logo_url: s.logo_url,
        category: s.categories?.name ?? null,
        avgScore: stats.total / stats.count,
        reviewCount: stats.count,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore || b.reviewCount - a.reviewCount)
    .slice(0, 5);
}

export default async function TopPage() {
  const [newsRes, articleRes, top5, viewCounts, weeklyViewCounts] = await Promise.all([
    getNewsList(21).catch(() => ({ contents: [] as Article[] })),
    getArticlesList(4).catch(() => ({ contents: [] as Article[] })),
    fetchTop5Rankings().catch(() => []),
    fetchAllViewCounts().catch((): Record<string, number> => ({})),
    fetchWeeklyViewCounts().catch((): Record<string, number> => ({})),
  ]);
  const newsItems = newsRes.contents;
  const articleItems = articleRes.contents;
  const featuredArticle = articleItems[0] as Article | undefined;
  const subArticles = articleItems.slice(1);

  // ── ニュースを日付ごとにグルーピング（最大7日・1日3件） ──
  const _today = todayJST();
  const _yesterday = yesterdayJST();

  function makeDateLabel(d: string): string {
    if (d === _today) return `${d.slice(5).replace("-", "/")}（今日）`;
    if (d === _yesterday) return `${d.slice(5).replace("-", "/")}（昨日）`;
    return d.slice(5).replace("-", "/");
  }

  const _byDay: Record<string, Article[]> = {};
  for (const a of newsItems) {
    const d = a.publishedAt ? formatDateJST(a.publishedAt) : "unknown";
    if (!_byDay[d]) _byDay[d] = [];
    if (_byDay[d].length < 3) _byDay[d].push(a);
  }
  const newsGroups: NewsDay[] = Object.entries(_byDay)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)
    .map(([dateStr, articles]) => ({ dateStr, label: makeDateLabel(dateStr), articles }));

  // ヒーロー: 週間PVトップ4（1位=主役, 2〜4位=サイドバー）
  const allItems = [...newsItems, ...articleItems];
  const sortedByWeekly = [...allItems].sort(
    (a, b) => (weeklyViewCounts[b.id] ?? 0) - (weeklyViewCounts[a.id] ?? 0)
  );
  const hasWeeklyData = (weeklyViewCounts[sortedByWeekly[0]?.id ?? ""] ?? 0) > 0;
  const heroItems = (hasWeeklyData ? sortedByWeekly : allItems).slice(0, 4);
  const heroFeatured = heroItems[0] ?? null;
  const heroSidebar = heroItems.slice(1, 4);

  return (
    <div style={{ paddingTop: "var(--header-h)" }}>

      {/* =====================================================
          1. ヒーローゾーン（左:主役 / 右:人気リスト）
      ===================================================== */}
      {heroFeatured && (
        <div className="md:max-w-[1100px] md:mx-auto md:px-4">
          <div className="flex flex-col md:flex-row md:gap-5">

            {/* 左: 主役記事 62% */}
            <Link
              href={`/articles/${heroFeatured.id}`}
              className="group block md:w-[62%]"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {/* 画像 16:9 */}
              <div
                className="relative w-full overflow-hidden md:rounded-2xl"
                style={{ aspectRatio: "16/9", background: "#111" }}
              >
                {getImageUrl(heroFeatured) && (
                  <Image
                    src={getImageUrl(heroFeatured)}
                    alt={heroFeatured.title ?? ""}
                    fill
                    sizes="(min-width: 1100px) 672px, (min-width: 768px) 62vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                )}
              </div>

              {/* テキスト（画像の下） */}
              <div style={{ padding: "14px 16px 18px" }}>
                {/* カテゴリ・日付・閲覧数 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", background: "#111", borderRadius: "4px", padding: "2px 6px", letterSpacing: "0.06em" }}>
                    ✦ 注目
                  </span>
                  {normalizeCategory(heroFeatured.category) && (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#86868b", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                      {normalizeCategory(heroFeatured.category)}
                    </span>
                  )}
                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#86868b" }}>
                    {heroFeatured.publishedAt && (
                      <span>{formatDateJST(heroFeatured.publishedAt)}</span>
                    )}
                    {(weeklyViewCounts[heroFeatured.id] ?? 0) > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {formatViews(weeklyViewCounts[heroFeatured.id] ?? 0)}
                      </span>
                    )}
                  </span>
                </div>

                {/* タイトル */}
                <h1
                  style={{
                    fontSize: "clamp(1.1rem, 2.8vw, 1.6rem)",
                    fontWeight: 700,
                    lineHeight: 1.4,
                    letterSpacing: "-0.025em",
                    color: "#1d1d1f",
                    marginBottom: "10px",
                  }}
                >
                  {heroFeatured.title}
                </h1>

                {/* リード文 */}
                {heroFeatured.description && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#555",
                      lineHeight: 1.75,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {heroFeatured.description}
                  </p>
                )}
              </div>
            </Link>

            {/* 右: 人気記事リスト 38% */}
            {heroSidebar.length > 0 && (
              <div
                className="md:w-[38%]"
                style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
              >
                {/* ヘッダ */}
                <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "#86868b", textTransform: "uppercase" as const }}>
                    今週よく読まれている
                  </p>
                </div>

                {/* リスト */}
                {heroSidebar.map((article, i) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="group flex gap-3 hover:opacity-75 transition-opacity"
                    style={{
                      padding: "14px 16px",
                      borderBottom: i < heroSidebar.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    {/* サムネ */}
                    <div
                      style={{
                        width: "80px",
                        height: "60px",
                        borderRadius: "8px",
                        background: "#f0f0f0",
                        flexShrink: 0,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {getImageUrl(article) ? (
                        <Image
                          src={getImageUrl(article)}
                          alt={article.title ?? ""}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <CategoryPlaceholder category={normalizeCategory(article.category)} />
                      )}
                    </div>

                    {/* タイトル・PV */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          lineHeight: 1.45,
                          color: "#1d1d1f",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          marginBottom: "4px",
                        }}
                      >
                        {article.title}
                      </p>
                      {(weeklyViewCounts[article.id] ?? 0) > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.72rem", color: "#86868b" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {formatViews(weeklyViewCounts[article.id] ?? 0)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* =====================================================
          3. ニュースセクション（日付ごとカルーセル）
      ===================================================== */}
      <section className="py-12">
        <div className="max-w-[1100px] mx-auto px-4">
          <NewsCarousel days={newsGroups} viewCounts={viewCounts} />
          <div className="text-center mt-6">
            <Link href="/news" className="text-sm text-gray-500 hover:text-black">
              ニュースをもっと見る →
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. 記事セクション（フィーチャー1本 + サブリスト）
      ===================================================== */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-4">
          {/* セクションヘッダ */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs font-bold tracking-widest text-white bg-black px-3 py-1 rounded-full">ARTICLE</span>
            <h2 className="text-xl font-bold">記事</h2>
          </div>

          {/* フィーチャー記事 */}
          {featuredArticle && (
            <Link
              href={`/articles/${featuredArticle.id}`}
              className="article-card-link"
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
              <div className="flex flex-col md:flex-row md:items-stretch">
                {/* サムネ（4:3, カード内で伸長） */}
                <div
                  className="relative w-full md:w-[45%] flex-shrink-0"
                  style={{ aspectRatio: "4/3" }}
                >
                  {getImageUrl(featuredArticle) ? (
                    <Image
                      src={getImageUrl(featuredArticle)}
                      alt={featuredArticle.title ?? ""}
                      fill
                      sizes="(min-width: 768px) 495px, 100vw"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                  ) : (
                    <CategoryPlaceholder category={normalizeCategory(featuredArticle.category)} />
                  )}
                </div>

                {/* テキストエリア */}
                <div
                  className="flex flex-col justify-center"
                  style={{ padding: "28px 32px" }}
                >
                  {/* バッジ行 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <span
                      style={{
                        fontSize: "10px", fontWeight: 700, color: "#fff",
                        background: "#111", borderRadius: "4px",
                        padding: "1px 5px", letterSpacing: "0.05em",
                      }}
                    >
                      ARTICLE
                    </span>
                    {normalizeCategory(featuredArticle.category) && (
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {normalizeCategory(featuredArticle.category)}
                      </span>
                    )}
                  </div>

                  {/* タイトル */}
                  <h3
                    style={{
                      fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                      fontWeight: 700,
                      lineHeight: 1.45,
                      letterSpacing: "-0.02em",
                      color: "#1d1d1f",
                      marginBottom: "14px",
                    }}
                  >
                    {featuredArticle.title}
                  </h3>

                  {/* リード文（descriptionがある場合のみ） */}
                  {featuredArticle.description && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#555",
                        lineHeight: 1.8,
                        marginBottom: "18px",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {featuredArticle.description}
                    </p>
                  )}

                  {/* 日付 + PV */}
                  <div style={{ display: "flex", gap: "10px", fontSize: "0.78rem", color: "#86868b", alignItems: "center" }}>
                    {featuredArticle.publishedAt && (
                      <span>{formatDateJST(featuredArticle.publishedAt)}</span>
                    )}
                    {(viewCounts[featuredArticle.id] ?? 0) > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {formatViews(viewCounts[featuredArticle.id] ?? 0)}
                      </span>
                    )}
                  </div>

                  {/* 続きを読む */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "20px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    続きを読む
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 7h9M7 2.5l4.5 4.5-4.5 4.5" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* サブリスト（フィーチャー以外の最大3件） */}
          {subArticles.length > 0 && (
            <div style={{ marginTop: "20px", paddingTop: "4px" }}>
              {subArticles.map((article, i) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  badge="ARTICLE"
                  viewCount={viewCounts[article.id] ?? 0}
                  index={i}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/articles" className="text-sm text-gray-500 hover:text-black">
              記事をもっと見る →
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. ランキング TOP5（実データ。データなしは非表示）
      ===================================================== */}
      {/* 人気サービス TOP 5 セクション UI非表示 */}
      {false && top5.length > 0 && (
        <section className="py-14" style={{ background: "#f5f5f7" }}>
          <div className="container">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#86868b" }}>Ranking</p>
                <h2 className="mt-1 font-bold" style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
                  人気サービス TOP 5
                </h2>
              </div>
              <Link
                href="/service-ranking"
                className="text-sm font-semibold hidden sm:inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: "#111111" }}
              >
                ランキング全体
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 7h9M7 2.5l4.5 4.5-4.5 4.5" />
                </svg>
              </Link>
            </div>

            <div
              className="rounded-3xl overflow-hidden bg-white"
              style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
            >
              {top5.map((svc, i) => (
                <Link
                  key={svc.id}
                  href="/service-ranking"
                  className="ranking-row flex items-center gap-4 px-5 py-4 bg-white"
                  style={{ borderBottom: i < top5.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                >
                  {/* ランク番号 */}
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{
                      background: i === 0 ? "#111111" : i === 1 ? "#666666" : i === 2 ? "#999999" : "#f0f0f0",
                      color: i < 3 ? "#fff" : "#666666",
                    }}
                  >
                    {i + 1}
                  </div>
                  {/* ロゴ or イニシャル */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: svc.logo_url ? "transparent" : "#333333" }}
                  >
                    {svc.logo_url ? (
                      <Image src={svc.logo_url} alt={svc.name} width={36} height={36} style={{ objectFit: "contain" }} />
                    ) : (
                      svc.name[0]
                    )}
                  </div>
                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: "#1d1d1f" }}>{svc.name}</span>
                      {svc.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#f0f0f0", color: "#666666" }}>
                          {svc.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span style={{ color: "#111111", fontSize: "11px" }}>
                        {"★".repeat(Math.floor(svc.avgScore / 2))}
                      </span>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: "#666666" }}>
                        {svc.avgScore.toFixed(1)}
                        <span className="font-normal text-xs" style={{ color: "#86868b" }}>/10</span>
                      </span>
                    </div>
                  </div>
                  <svg className="flex-shrink-0" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          5. 診断CTAバナー（FEATURES.aiDiagnosis が true のときのみ表示）
      ===================================================== */}
      {FEATURES.aiDiagnosis && (
        <section className="py-14">
          <div className="container">
            <div
              className="relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white"
              style={{ background: "#111111" }}
            >
              <div aria-hidden className="absolute -top-20 -left-20 w-64 h-64 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div aria-hidden className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
              <div className="relative">
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
                >
                  ✨ 無料でできる
                </span>
                <h2
                  className="font-bold leading-tight mb-4"
                  style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", letterSpacing: "-0.03em" }}
                >
                  どのサブスクが合う？<br />診断してみよう。
                </h2>
                <p className="mb-8 mx-auto text-sm sm:text-base" style={{ opacity: 0.8, maxWidth: "400px", lineHeight: 1.7 }}>
                  いくつかの質問に答えるだけで、あなたのライフスタイルに合ったサブスクが見つかります。
                </p>
                <Link
                  href="/diagnosis"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105"
                  style={{ background: "#fff", color: "#111111", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                >
                  診断スタート
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M8 3l5 5-5 5" />
                  </svg>
                </Link>
                <p className="mt-4 text-xs" style={{ opacity: 0.6 }}>約3分・無料・登録不要</p>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

// ============================================================
// カテゴリ別サムネプレースホルダー
// ============================================================
const CATEGORY_COLORS: Record<string, { bg: string; dot: string }> = {
  CHATGPT: { bg: "#f0faf6", dot: "#10a37f" },
  CLAUDE:  { bg: "#fdf3ef", dot: "#da7756" },
  GEMINI:  { bg: "#eef3ff", dot: "#4285f4" },
  XAI:     { bg: "#f5f5f5", dot: "#111111" },
};
const DEFAULT_CATEGORY_COLOR = { bg: "#f0f0f0", dot: "#aaaaaa" };

function CategoryPlaceholder({ category }: { category: string }) {
  const key = category.toUpperCase().replace(/\s/g, "");
  const { bg, dot } = CATEGORY_COLORS[key] ?? DEFAULT_CATEGORY_COLOR;
  return (
    <div style={{ width: "100%", height: "100%", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: dot, opacity: 0.25 }} />
    </div>
  );
}

// ============================================================
// ArticleCard（ページローカル）
// ============================================================
function ArticleCard({
  article,
  priority = false,
  viewCount = 0,
  index = 0,
  badge,
}: {
  article: Article;
  priority?: boolean;
  viewCount?: number;
  index?: number;
  badge?: string;
}) {
  const imgUrl   = getImageUrl(article);
  const category = normalizeCategory(article.category);
  const date     = article.publishedAt ? formatDateJST(article.publishedAt) : "";

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
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <CategoryPlaceholder category={category} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {(badge || category) && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            {badge && (
              <span style={badge === "NEWS" ? {
                fontSize: "10px", fontWeight: 700, color: "#111111",
                background: "#fff", border: "1px solid #111111",
                borderRadius: "4px", padding: "0px 4px", letterSpacing: "0.05em",
              } : {
                fontSize: "10px", fontWeight: 700, color: "#fff",
                background: "#111111",
                borderRadius: "4px", padding: "1px 5px", letterSpacing: "0.05em",
              }}>
                {badge}
              </span>
            )}
            {category && (
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                {category}
              </p>
            )}
          </div>
        )}
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            lineHeight: 1.4,
            minHeight: "calc(0.95rem * 1.4 * 2)",
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
          {viewCount > 0 && (
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
