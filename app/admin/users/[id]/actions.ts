"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { logAdminAction } from "@/lib/audit";

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}

async function verifyAdmin(): Promise<string> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return user.id;
}

export async function banUser(userId: string, reason: string) {
  const adminId = await verifyAdmin();
  if (userId === adminId) throw new Error("自分自身をBANすることはできません");
  if (!reason.trim()) throw new Error("理由を入力してください");

  const supabase = serviceClient();
  const { error } = await supabase
    .from("users")
    .update({ banned_at: new Date().toISOString(), banned_reason: reason.trim(), banned_by: adminId })
    .eq("id", userId);

  if (error) throw new Error(`BAN失敗: ${error.message}`);

  await logAdminAction(adminId, "ban_user", "user", userId, { reason: reason.trim() });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}`);
}

export async function unbanUser(userId: string) {
  const adminId = await verifyAdmin();
  if (userId === adminId) throw new Error("自分自身を対象にすることはできません");

  const supabase = serviceClient();
  const { error } = await supabase
    .from("users")
    .update({ banned_at: null, banned_reason: null, banned_by: null })
    .eq("id", userId);

  if (error) throw new Error(`BAN解除失敗: ${error.message}`);

  await logAdminAction(adminId, "unban_user", "user", userId, {});

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}`);
}

export async function deleteUser(userId: string, reason: string) {
  const adminId = await verifyAdmin();
  if (userId === adminId) throw new Error("自分自身を削除することはできません");
  if (!reason.trim()) throw new Error("理由を入力してください");

  const supabase = serviceClient();

  // 削除前に audit 記録（削除後は情報取得不可）
  const { data: targetUser } = await supabase
    .from("users")
    .select("email, display_name, username")
    .eq("id", userId)
    .single();

  await logAdminAction(adminId, "delete_user", "user", userId, {
    reason: reason.trim(),
    email: targetUser?.email ?? null,
    display_name: targetUser?.display_name ?? null,
    username: targetUser?.username ?? null,
  });

  // public.users を先に削除（CASCADE がない場合の保険）
  await supabase.from("users").delete().eq("id", userId);

  // auth.users を削除（CASCADE がある場合は上記が先に走るが問題なし）
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw new Error(`ユーザー削除失敗: ${authError.message}`);

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
