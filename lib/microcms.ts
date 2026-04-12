import "server-only";
import { createClient } from "microcms-js-sdk";
import type { Article } from "./utils";

export type { Article } from "./utils";
export { normalizeCategory, getImageUrl } from "./utils";

// ============================================================
// microCMS クライアント（サーバーサイド専用）
// ============================================================
export const client = createClient({
  serviceDomain: "subscope",
  apiKey: process.env.MICROCMS_API_KEY ?? "",
});

// ============================================================
// データ取得関数（すべて ISR revalidate: 60）
// ============================================================
const ISR = { next: { revalidate: 60 } } as const;

/** 記事一覧を取得（最大100件） */
export async function getArticles(limit = 100) {
  const data = await client.getList<Article>({
    endpoint: "articles",
    queries: { limit, depth: 2, orders: "-publishedAt" },
    customRequestInit: ISR,
  });
  return data.contents;
}

/** 記事詳細を取得 */
export async function getArticle(id: string) {
  return client.getListDetail<Article>({
    endpoint: "articles",
    contentId: id,
    queries: { depth: 2 },
    customRequestInit: ISR,
  });
}

/** 全記事のIDを取得（generateStaticParams用） */
export async function getAllArticleIds() {
  return client.getAllContentIds({
    endpoint: "articles",
    customRequestInit: ISR,
  });
}

/** サービス名で関連記事を取得（最大6件） */
export async function getArticlesByService(serviceName: string, limit = 6) {
  return client.getList<Article>({
    endpoint: "articles",
    queries: {
      filters: `service[equals]${serviceName}`,
      limit,
      orders: "-publishedAt",
    },
    customRequestInit: ISR,
  });
}
