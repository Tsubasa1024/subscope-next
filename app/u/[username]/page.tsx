export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getArticle } from "@/lib/microcms";
import UserProfileClient from "./UserProfileClient";
import type { Profile, SubRow, CommentRow } from "./UserProfileClient";

type Props = { params: Promise<{ username: string }> };

function calcBadges(createdAt: string, subsCount: number, commentCount: number): string[] {
  const badges: string[] = [];
  const months = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months < 3) badges.push("新規");
  else if (months < 12) badges.push("継続ユーザー");
  else badges.push("ベテラン");
  if (subsCount >= 10) badges.push("サブスクマスター");
  else if (subsCount >= 6) badges.push("ヘビーユーザー");
  else if (subsCount >= 3) badges.push("活用中");
  if (commentCount >= 20) badges.push("トップレビュアー");
  else if (commentCount >= 5) badges.push("レビュアー");
  return badges;
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profileData } = await supabase
    .from("users")
    .select("id, display_name, avatar_url, plan, username, bio, created_at, profile_public, show_subscriptions")
    .eq("username", username)
    .maybeSingle();

  if (!profileData) notFound();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isSelf = authUser?.id === profileData.id;

  const profile = profileData as unknown as Profile;

  const [subsResult, commentsResult, countResult] = await Promise.all([
    supabase
      .from("user_subscriptions")
      .select("service_id, plan_id, services(id, name, slug, logo_url, categories(id, name)), plans(id, name, price, billing_cycle)")
      .eq("user_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("article_comments")
      .select("id, article_id, content, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("article_comments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id),
  ]);

  const subs = (subsResult.data ?? []) as unknown as SubRow[];
  const rawComments = commentsResult.data ?? [];
  const commentCount = countResult.count ?? 0;

  // 記事タイトルをmicroCMSから並列取得
  const articleIds = [...new Set(rawComments.map((c) => c.article_id as string))];
  const articleResults = await Promise.allSettled(articleIds.map((id) => getArticle(id)));
  const articleTitles: Record<string, string> = {};
  articleIds.forEach((id, i) => {
    const r = articleResults[i];
    if (r.status === "fulfilled") articleTitles[id] = r.value.title ?? id;
  });

  const recentComments: CommentRow[] = rawComments.map((c) => ({
    id: c.id as string,
    article_id: c.article_id as string,
    content: c.content as string,
    created_at: c.created_at as string,
    articleTitle: articleTitles[c.article_id as string] ?? null,
  }));

  const badges = calcBadges(profile.created_at, subs.length, commentCount);

  return (
    <UserProfileClient
      profile={profile}
      subs={subs}
      recentComments={recentComments}
      commentCount={commentCount}
      badges={badges}
      isSelf={isSelf}
    />
  );
}
