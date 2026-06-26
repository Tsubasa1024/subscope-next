import type { Metadata } from "next";
import { Suspense } from "react";
import { getArticles, getNewsList, getArticlesList } from "@/lib/microcms";
import AllArticlesClient from "./AllArticlesClient";
import { fetchAllViewCounts } from "@/lib/viewCounts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "記事一覧",
  description:
    "SUBSCOPEが発信するニュース・記事の一覧。最新AIツールの情報をまとめてチェック。",
  alternates: { canonical: "https://www.subscope.jp/articles" },
};

type SearchParams = Promise<{ category?: string; q?: string; type?: string }>;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, q, type } = await searchParams;

  const fetchFn =
    type === "news"    ? getNewsList(100) :
    type === "article" ? getArticlesList(100) :
                         getArticles(100);

  const [articlesRes, viewCounts] = await Promise.all([
    fetchFn.catch(() => ({ contents: [] })),
    fetchAllViewCounts().catch((): Record<string, number> => ({})),
  ]);
  const articles = articlesRes.contents;

  const CATEGORY_ORDER = ["ChatGPT", "Claude", "Gemini", "xAI", "その他"];

  return (
    <Suspense>
      <AllArticlesClient
        articles={articles}
        categories={CATEGORY_ORDER}
        initialCategory={category ?? "すべて"}
        initialSearch={q ?? ""}
        initialType={type ?? "all"}
        viewCounts={viewCounts}
      />
    </Suspense>
  );
}
