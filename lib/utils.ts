import type { MicroCMSImage, MicroCMSListContent } from "microcms-js-sdk";

// ============================================================
// 型定義（クライアントコンポーネントでも使用可）
// ============================================================
export type Category =
  | string
  | { id: string; name: string }
  | Array<{ id: string; name: string }>;

export type Article = MicroCMSListContent & {
  title: string;
  description?: string;
  service?: string;
  eyecatch?: MicroCMSImage;
  thumbnail?: MicroCMSImage;
  image?: MicroCMSImage;
  heroImage?: MicroCMSImage;
  category?: Category;
  tags?: Array<{ id: string; name: string } | string>;
  content?: string;  // microCMS のリッチエディタフィールド名
  isPR?: boolean;    // アフィリエイト記事フラグ（ステマ規制対応）
};

// ============================================================
// ユーティリティ関数（SDKに依存しない純粋関数）
// ============================================================

/** カテゴリーを文字列に正規化 */
export function normalizeCategory(category: Category | undefined): string {
  if (!category) return "";
  if (typeof category === "string") return category.trim();
  if (Array.isArray(category)) {
    const first = category[0];
    if (!first) return "";
    return typeof first === "string" ? first : first.name || first.id || "";
  }
  return (category.name || category.id || "").trim();
}

/** views 数を 1.2k 形式にフォーマット */
export function formatViews(n: number): string {
  if (n >= 1000) return `${+((n / 1000).toFixed(1))}k`;
  return `${n}`;
}

/** 記事のサムネイルURLを取得 */
export function getImageUrl(article: Article): string {
  return (
    article.eyecatch?.url ||
    article.thumbnail?.url ||
    article.image?.url ||
    article.heroImage?.url ||
    ""
  );
}
