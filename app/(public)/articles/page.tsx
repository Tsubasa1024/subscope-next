import type { Metadata } from "next";
import { getArticles, normalizeCategory } from "@/lib/microcms";
import AllArticlesClient from "./AllArticlesClient";

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

  const articles = await getArticles(100).catch(() => []);

  const categories = Array.from(
    new Set(articles.map((a) => normalizeCategory(a.category)).filter(Boolean))
  );

  return (
    <AllArticlesClient
      articles={articles}
      categories={categories}
      initialCategory={category ?? "すべて"}
      initialSearch={q ?? ""}
    />
  );
}
