import { getArticles } from "@/lib/microcms";
import Header from "./Header";

/**
 * サーバーコンポーネント：記事データをフェッチして Header に渡す。
 * (public) layout から呼び出し、各ページで重複インポート不要にする。
 */
export default async function HeaderWithData() {
  const articles = await getArticles(100).catch(() => []);
  return <Header articles={articles} />;
}
