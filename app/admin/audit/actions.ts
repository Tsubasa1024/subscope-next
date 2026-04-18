"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { logAdminAction } from "@/lib/audit";

function svcClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}

async function verifyAdmin(): Promise<string> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return user.id;
}

export async function restoreContent(
  targetType: string,
  targetId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const adminId = await verifyAdmin();
    const table = targetType === "review" ? "reviews" : "service_reviews";
    const supabase = svcClient();

    const { error } = await supabase
      .from(table)
      .update({ deleted_at: null, deleted_by: null, deletion_reason: null })
      .eq("id", targetId);

    if (error) return { error: `復元失敗: ${error.message}` };

    await logAdminAction(adminId, "content.restore", targetType, targetId, {});

    revalidatePath("/admin/audit");
    revalidatePath("/admin/comments");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "エラーが発生しました" };
  }
}
