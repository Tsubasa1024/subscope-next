import type { Metadata } from "next";
import { Suspense } from "react";
import { getNewsList, getArticlesList } from "@/lib/microcms";
import AllArticlesClient from "./AllArticlesClient";
import { fetchAllViewCounts } from "@/lib/viewCounts";
import type { Article } from "@/lib/utils";

// ISR: searchParams（type/category/q）はクライアント側でフィルタするため
// サーバーでは読まず、静的レンダリング + 60秒再生成を維持する
export const revalidate = 60;

export const metadata: Metadata = {
  title: "記事一覧",
  description:
    "SUBSCOPEが発信するニュース・記事の一覧。最新AIツールの情報をまとめてチェック。",
  alternates: { canonical: "https://www.subscope.jp/articles" },
};

export default async function ArticlesPage() {
  const [newsRes, articlesRes, viewCounts] = await Promise.all([
    getNewsList(100).catch(() => ({ contents: [] as Article[] })),
    getArticlesList(100).catch(() => ({ contents: [] as Article[] })),
    fetchAllViewCounts().catch((): Record<string, number> => ({})),
  ]);

  // ニュース・記事を統合して公開日降順に（typeフィルタはクライアント側）
  const merged = new Map<string, Article>();
  for (const a of [...newsRes.contents, ...articlesRes.contents]) {
    merged.set(a.id, a);
  }
  const articles = [...merged.values()].sort((a, b) =>
    (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")
  );

  const CATEGORY_ORDER = ["ChatGPT", "Claude", "Gemini", "xAI", "その他"];

  return (
    <Suspense>
      <AllArticlesClient
        articles={articles}
        categories={CATEGORY_ORDER}
        viewCounts={viewCounts}
      />
    </Suspense>
  );
}
