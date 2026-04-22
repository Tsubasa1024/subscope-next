import type { Metadata } from "next";
import { Suspense } from "react";
import { getArticles } from "@/lib/microcms";
import AllArticlesClient from "./AllArticlesClient";
import { fetchAllViewCounts } from "@/lib/viewCounts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "すべての記事",
  description:
    "SUBSCOPEが発信するすべての記事一覧。サブスクリプション選びに役立つ情報をまとめてチェック。",
  alternates: { canonical: "https://www.subscope.jp/articles" },
};

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, q } = await searchParams;

  const [articles, viewCounts] = await Promise.all([
    getArticles(100).catch(() => []),
    fetchAllViewCounts().catch((): Record<string, number> => ({})),
  ]);

  const CATEGORY_ORDER = ["AI", "動画", "音楽", "読書", "フィットネス", "学習", "ビジネス", "その他"];
  const categories = CATEGORY_ORDER;

  return (
    <Suspense>
      <AllArticlesClient
        articles={articles}
        categories={categories}
        initialCategory={category ?? "すべて"}
        initialSearch={q ?? ""}
        viewCounts={viewCounts}
      />
    </Suspense>
  );
}
