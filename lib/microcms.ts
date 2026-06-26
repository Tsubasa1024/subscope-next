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

/** 記事一覧を取得 */
export async function getArticles(
  limit = 100,
  contentType?: "news" | "article"
) {
  const filters = contentType
    ? `contentType[equals]${contentType}`
    : undefined;
  const res = await client.getList<Article>({
    endpoint: "articles",
    queries: { limit, orders: "-publishedAt", ...(filters && { filters }) },
    customRequestInit: ISR,
  });
  return res;
}

export async function getNewsList(limit = 10) {
  const res = await client.getList<Article>({
    endpoint: "articles",
    queries: { limit, orders: "-publishedAt" },
    customRequestInit: ISR,
  });
  return res;
}

export async function getArticlesList(limit = 10) {
  const res = await client.getList<Article>({
    endpoint: "articles",
    queries: { limit, orders: "-publishedAt" },
    customRequestInit: ISR,
  });
  return res;
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
