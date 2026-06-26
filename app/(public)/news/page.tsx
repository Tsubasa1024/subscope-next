import type { Metadata } from "next";
import { Suspense } from "react";
import { getNewsList } from "@/lib/microcms";
import AllArticlesClient from "../articles/AllArticlesClient";
import { fetchAllViewCounts } from "@/lib/viewCounts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ニュース",
  description:
    "ChatGPT・Claude・Geminiなど最新AIツールのニュースをお届けします。",
  alternates: { canonical: "https://www.subscope.jp/news" },
};

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, q } = await searchParams;

  const [newsRes, viewCounts] = await Promise.all([
    getNewsList(100).catch(() => ({ contents: [] })),
    fetchAllViewCounts().catch((): Record<string, number> => ({})),
  ]);
  const articles = newsRes.contents;

  const CATEGORY_ORDER = ["ChatGPT", "Claude", "Gemini", "xAI", "その他"];

  return (
    <Suspense>
      <AllArticlesClient
        articles={articles}
        categories={CATEGORY_ORDER}
        initialCategory={category ?? "すべて"}
        initialSearch={q ?? ""}
        viewCounts={viewCounts}
      />
    </Suspense>
  );
}
