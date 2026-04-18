"use server";

import { redirect } from "next/navigation";
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

async function markReportResolved(
  supabase: ReturnType<typeof svcClient>,
  reportId: string,
  adminId: string,
  status: "resolved" | "rejected",
  note: string
) {
  const { error } = await supabase
    .from("reports")
    .update({
      status,
      resolved_by: adminId,
      resolved_at: new Date().toISOString(),
      resolution_note: note.trim() || null,
    })
    .eq("id", reportId);
  if (error) throw new Error(`通報ステータス更新失敗: ${error.message}`);
}

export async function deleteContent(reportId: string, note: string) {
  const adminId = await verifyAdmin();
  if (!note.trim()) throw new Error("対応メモを入力してください");

  const supabase = svcClient();

  const { data: report } = await supabase
    .from("reports")
    .select("target_type, target_id, status")
    .eq("id", reportId)
    .single();
  if (!report) throw new Error("通報が見つかりません");
  if (report.status !== "pending") throw new Error("この通報は既に処理済みです");

  const table =
    report.target_type === "review" ? "reviews" : "service_reviews";

  const { error: delErr } = await supabase
    .from(table)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: adminId,
      deletion_reason: note.trim(),
    })
    .eq("id", report.target_id);
  if (delErr) throw new Error(`コンテンツ削除失敗: ${delErr.message}`);

  await markReportResolved(supabase, reportId, adminId, "resolved", note);

  await logAdminAction(
    adminId,
    "content.delete",
    report.target_type,
    report.target_id,
    { reason: note.trim(), report_id: reportId }
  );

  revalidatePath("/admin/comments");
  revalidatePath(`/admin/comments/${reportId}`);
  redirect(`/admin/comments/${reportId}`);
}

export async function rejectReport(reportId: string, note: string) {
  const adminId = await verifyAdmin();
  if (!note.trim()) throw new Error("対応メモを入力してください");

  const supabase = svcClient();

  const { data: report } = await supabase
    .from("reports")
    .select("status")
    .eq("id", reportId)
    .single();
  if (!report) throw new Error("通報が見つかりません");
  if (report.status !== "pending") throw new Error("この通報は既に処理済みです");

  await markReportResolved(supabase, reportId, adminId, "rejected", note);

  await logAdminAction(adminId, "report.reject", "report", reportId, {
    note: note.trim(),
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/admin/comments/${reportId}`);
  redirect(`/admin/comments/${reportId}`);
}

export async function banUserFromReport(reportId: string, reason: string) {
  const adminId = await verifyAdmin();
  if (!reason.trim()) throw new Error("BAN理由を入力してください");

  const supabase = svcClient();

  const { data: report } = await supabase
    .from("reports")
    .select("target_type, target_id, status")
    .eq("id", reportId)
    .single();
  if (!report) throw new Error("通報が見つかりません");
  if (report.status !== "pending") throw new Error("この通報は既に処理済みです");

  const table =
    report.target_type === "review" ? "reviews" : "service_reviews";
  const { data: content } = await supabase
    .from(table)
    .select("user_id")
    .eq("id", report.target_id)
    .single();
  if (!content) throw new Error("対象コンテンツが見つかりません");

  const targetUserId = content.user_id as string;
  if (targetUserId === adminId) throw new Error("自分自身をBANすることはできません");

  const { data: targetProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", targetUserId)
    .single();
  if (targetProfile?.role === "admin") throw new Error("管理者をBANすることはできません");

  const { error: banErr } = await supabase
    .from("users")
    .update({
      banned_at: new Date().toISOString(),
      banned_reason: reason.trim(),
      banned_by: adminId,
    })
    .eq("id", targetUserId);
  if (banErr) throw new Error(`BAN失敗: ${banErr.message}`);

  await logAdminAction(adminId, "ban_user", "user", targetUserId, {
    reason: reason.trim(),
    via_report: reportId,
  });

  await markReportResolved(supabase, reportId, adminId, "resolved", reason);

  await logAdminAction(adminId, "report.resolve", "report", reportId, {
    action: "ban_user",
    note: reason.trim(),
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/admin/comments/${reportId}`);
  revalidatePath("/admin/users");
  redirect(`/admin/comments/${reportId}`);
}
