import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getArticles, getImageUrl, normalizeCategory } from "@/lib/microcms";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "SUBSCOPE｜サブスクリプションメディア",
  description:
    "SUBSCOPEは、サブスクリプションサービスの使い心地や魅力を実体験をもとに発信し、あなたに最適なサブスクが見つかるメディアです。",
  alternates: { canonical: "https://www.subscope.jp/" },
};

// ============================================================
// カテゴリナビデータ
// ============================================================
const CATEGORY_NAV = [
  { label: "すべて",       href: "/articles" },
  { label: "AI",           href: "/articles?category=AI" },
  { label: "動画",         href: "/articles?category=動画" },
  { label: "音楽",         href: "/articles?category=音楽" },
  { label: "読書",         href: "/articles?category=読書" },
  { label: "フィットネス", href: "/articles?category=フィットネス" },
  { label: "学習",         href: "/articles?category=学習" },
  { label: "ビジネス",     href: "/articles?category=ビジネス" },
  { label: "その他",       href: "/articles?category=その他" },
];

// ランキングダミーデータ（DBと連携するまで）
const RANKINGS = [
  { rank: 1, name: "Netflix",          category: "動画",      rating: 4.8, price: "¥1,490〜/月", color: "#111111" },
  { rank: 2, name: "Spotify",          category: "音楽",      rating: 4.7, price: "¥980/月",     color: "#333333" },
  { rank: 3, name: "Amazon Prime",     category: "動画・買物", rating: 4.6, price: "¥600/月",     color: "#555555" },
  { rank: 4, name: "Kindle Unlimited", category: "読書",      rating: 4.5, price: "¥980/月",     color: "#777777" },
  { rank: 5, name: "Adobe CC",         category: "ビジネス",  rating: 4.3, price: "¥6,480/月",   color: "#999999" },
];

// ============================================================
// Page
// ============================================================
export default async function TopPage() {
  const articles = await getArticles(13).catch(() => []);
  const featured = articles[0] ?? null;
  const grid     = articles.slice(1, 13); // 最大12件

  return (
    <div style={{ paddingTop: "var(--header-h)" }}>

      {/* =====================================================
          1. 注目記事（ファーストビュー・画面幅いっぱい）
      ===================================================== */}
      {featured && (
        <Link
          href={`/articles/${featured.id}`}
          className="group block relative w-full overflow-hidden"
          style={{
            minHeight: "460px",
            height: "clamp(460px, 55vw, 620px)",
            background: "#111",
          }}
        >
          {/* 背景画像 */}
          {getImageUrl(featured) && (
            <Image
              src={getImageUrl(featured)}
              alt={featured.title ?? ""}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ opacity: 0.78 }}
              priority
            />
          )}

          {/* グラデーションオーバーレイ */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.0) 100%)",
            }}
          />

          {/* テキスト（コンテナ幅に収める） */}
          <div
            className="absolute inset-x-0 bottom-0 text-white"
            style={{ maxWidth: "var(--container-width)", margin: "0 auto", padding: "0 24px 40px" }}
          >
            {/* バッジ行 */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                ✦ 注目記事
              </span>
              {normalizeCategory(featured.category) && (
                <span className="text-xs font-semibold opacity-75">
                  {normalizeCategory(featured.category)}
                </span>
              )}
              {featured.publishedAt && (
                <span className="text-xs opacity-50 ml-auto">
                  {featured.publishedAt.slice(0, 10)}
                </span>
              )}
            </div>

            {/* タイトル */}
            <h1
              className="font-bold leading-snug"
              style={{
                fontSize: "clamp(1.4rem, 3.5vw, 2.4rem)",
                letterSpacing: "-0.025em",
                textShadow: "0 2px 16px rgba(0,0,0,0.6)",
                maxWidth: "760px",
              }}
            >
              {featured.title}
            </h1>

            {/* 説明文 */}
            {featured.description && (
              <p
                className="mt-3 opacity-75 hidden sm:block"
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.65,
                  maxWidth: "560px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {featured.description}
              </p>
            )}

            {/* 続きを読む */}
            <span className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              続きを読む
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 7h9M7 2.5l4.5 4.5-4.5 4.5" />
              </svg>
            </span>
          </div>
        </Link>
      )}

      {/* =====================================================
          2. カテゴリナビ（横スクロール）
      ===================================================== */}
      <section
        className="sticky z-40"
        style={{
          top: "var(--header-h)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="container">
          <div
            className="flex justify-center gap-1 overflow-x-auto py-3"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CATEGORY_NAV.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-gray-100"
                style={{ color: "#1d1d1f", whiteSpace: "nowrap" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          3. 記事グリッド（最新12件）
      ===================================================== */}
      <section className="container" style={{ paddingTop: "32px", paddingBottom: "8px" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
            最新記事
          </h2>
          <Link
            href="/articles"
            className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: "#111111" }}
          >
            すべて見る
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 7h9M7 2.5l4.5 4.5-4.5 4.5" />
            </svg>
          </Link>
        </div>

        {grid.length === 0 ? (
          /* スケルトン */
          <div className="articles-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="aspect-video bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="articles-grid">
            {grid.map((article, i) => (
              <ArticleCard key={article.id} article={article} priority={i < 3} />
            ))}
          </div>
        )}

        {/* もっと見るボタン */}
        <div className="text-center mt-10 mb-4">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{
              background: "#1d1d1f",
              color: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            }}
          >
            もっと見る
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 7h9M7 2.5l4.5 4.5-4.5 4.5" />
            </svg>
          </Link>
        </div>
      </section>

      {/* =====================================================
          4. ランキング TOP5
      ===================================================== */}
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
              href="/ranking"
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
            {RANKINGS.map(({ rank, name, category, rating, price, color }, i) => (
              <div
                key={name}
                className="ranking-row flex items-center gap-4 px-5 py-4 bg-white cursor-pointer"
                style={{ borderBottom: i < RANKINGS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
              >
                {/* ランク番号 */}
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{
                    background: rank <= 3
                      ? (rank === 1 ? "#111111" : rank === 2 ? "#666666" : "#999999")
                      : "#f0f0f0",
                    color: rank <= 3 ? "#fff" : "#666666",
                  }}
                >
                  {rank}
                </div>
                {/* カラーアイコン */}
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: color }}
                >
                  {name[0]}
                </div>
                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: "#1d1d1f" }}>{name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#f0f0f0", color: "#666666" }}>{category}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span style={{ color: "#111111", fontSize: "11px" }}>{"★".repeat(Math.floor(rating))}</span>
                    <span className="text-xs font-semibold" style={{ color: "#666666" }}>{rating}</span>
                  </div>
                </div>
                {/* 料金 */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold" style={{ color: "#1d1d1f" }}>{price}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#86868b" }}>月額</p>
                </div>
                <svg className="flex-shrink-0" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-3" style={{ color: "#86868b" }}>
            ※ 現在はダミーデータです。
          </p>
        </div>
      </section>

      {/* =====================================================
          5. 診断CTAバナー
      ===================================================== */}
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

    </div>
  );
}

// ============================================================
// ArticleCard（ページローカル）
// ============================================================
function ArticleCard({
  article,
  priority = false,
}: {
  article: Awaited<ReturnType<typeof getArticles>>[number];
  priority?: boolean;
}) {
  const imgUrl   = getImageUrl(article);
  const category = normalizeCategory(article.category);
  const date     = article.publishedAt ? article.publishedAt.slice(0, 10) : "";

  return (
    <Link
      href={`/articles/${article.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ border: "1px solid rgba(0,0,0,0.06)" }}
    >
      {/* サムネイル */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 flex-shrink-0">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={article.title ?? ""}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        {category && (
          <span
            className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
          >
            {category}
          </span>
        )}
      </div>

      {/* テキスト */}
      <div className="flex flex-col flex-1 p-4">
        {article.service && (
          <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#86868b" }}>
            {article.service}
          </p>
        )}
        <h3
          className="font-bold leading-snug text-sm flex-1"
          style={{
            color: "#1d1d1f",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </h3>
        {article.description && (
          <p
            className="text-xs mt-2 leading-relaxed"
            style={{
              color: "#666666",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.description}
          </p>
        )}
        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
        >
          <span className="text-xs" style={{ color: "#86868b" }}>{date}</span>
          <span
            className="text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            style={{ color: "#111111" }}
          >
            続きを読む
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6h8M6 2l4 4-4 4" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
