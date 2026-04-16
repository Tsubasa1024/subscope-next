export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import MypageClient from "./MypageClient";

export default async function MypagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { data: profile },
    { data: savedArticles },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("plan, username, username_changed_at, bio, avatar_url, notification_new_article, notification_review_reply, profile_public")
      .eq("id", user.id)
      .single(),
    supabase
      .from("article_saves")
      .select("user_id, article_id, title, image_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <MypageClient
      userId={user.id}
      email={user.email ?? ""}
      name={user.user_metadata?.full_name ?? ""}
      currentPlan={(profile?.plan ?? "free") as "free" | "standard" | "pro"}
      savedArticles={savedArticles ?? []}
      username={profile?.username ?? null}
      usernameChangedAt={profile?.username_changed_at ?? null}
      bio={profile?.bio ?? null}
      avatarUrl={profile?.avatar_url ?? null}
      notificationNewArticle={profile?.notification_new_article ?? true}
      notificationReviewReply={profile?.notification_review_reply ?? true}
      profilePublic={(profile as unknown as { profile_public: boolean | null })?.profile_public ?? true}
    />
  );
}
