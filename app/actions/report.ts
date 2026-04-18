"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { ReportReason, ReportTargetType } from "@/types/admin";

function svcClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function submitReport(
  targetType: ReportTargetType,
  targetId: string,
  reason: ReportReason,
  reasonDetail?: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  const { data: profile } = await supabase
    .from("users")
    .select("banned_at")
    .eq("id", user.id)
    .single();
  if (profile?.banned_at) return { error: "banned" };

  const table = targetType === "review" ? "reviews" : "service_reviews";
  const svc = svcClient();
  const { data: target } = await svc
    .from(table)
    .select("user_id")
    .eq("id", targetId)
    .single();
  if (target?.user_id === user.id) return { error: "own_content" };

  const { error } = await svc.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    reason_detail: reasonDetail ?? null,
  });

  if (error) {
    if (error.code === "23505") return { error: "already_reported" };
    return { error: error.message };
  }

  return { success: true };
}
