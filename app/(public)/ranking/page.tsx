import type { Metadata } from "next";
import { getArticles } from "@/lib/microcms";
import RankingClient from "./RankingClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ランキング",
  description:
    "SUBSCOPEで人気の記事をランキング形式でまとめるページ。迷ったらまずここから。",
  alternates: { canonical: "https://www.subscope.jp/ranking" },
};

export default async function RankingPage() {
  const articles = await getArticles(20).catch(() => []);

  return <RankingClient articles={articles} />;
}
