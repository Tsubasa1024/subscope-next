import { createClient } from "@/lib/supabase/server";
import MypageClient from "./MypageClient";

export default async function MypagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // layout の認証ガードで user は必ず存在するが型安全のため確認
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  return (
    <MypageClient
      userId={user.id}
      email={user.email ?? ""}
      name={user.user_metadata?.full_name ?? ""}
      currentPlan={(profile?.plan ?? "free") as "free" | "standard" | "pro"}
    />
  );
}
