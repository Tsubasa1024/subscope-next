export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { AdminUserView, AuditLog } from "@/types/admin";
import UserDetailClient from "./UserDetailClient";

export const metadata: Metadata = { title: "ユーザー詳細 | Admin | SUBSCOPE" };

interface PageProps {
  params: Promise<{ id: string }>;
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = serviceClient();

  const [
    { data: user },
    { count: reviewCount },
    { count: serviceReviewCount },
    { count: favoriteCount },
    { data: auditLogs },
    { data: bannedByUser },
  ] = await Promise.all([
    supabase.from("admin_users_view").select("*").eq("id", id).single(),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase.from("service_reviews").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase.from("favorites").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase
      .from("audit_logs")
      .select("*, admin:users!admin_id(display_name)")
      .eq("target_type", "user")
      .eq("target_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    Promise.resolve({ data: null }),
  ]);

  if (!user) notFound();

  const u = user as AdminUserView;

  // Fetch banned_by user name if banned
  let bannedByName: string | null = null;
  if (u.banned_by) {
    const { data } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", u.banned_by)
      .single();
    bannedByName = data?.display_name ?? null;
  }

  const logs = (auditLogs ?? []) as AuditLog[];

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "—";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/admin/users" style={{ fontSize: 13, color: "#86868b" }}>← ユーザー一覧</Link>
      </div>

      {/* Basic info */}
      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {u.avatar_url ? (
            <Image
              src={u.avatar_url} alt="" width={64} height={64}
              style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "#e5e5e5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, color: "#999", flexShrink: 0,
            }}>
              {(u.display_name ?? u.email)[0]?.toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {u.display_name ?? "(未設定)"}
              {u.username && <span style={{ fontSize: 14, color: "#86868b", fontWeight: 400, marginLeft: 8 }}>@{u.username}</span>}
            </h1>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>{u.email}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag label={u.plan} color={u.plan === "free" ? "#888" : u.plan === "pro" ? "#7c3aed" : "#2563eb"} />
              <Tag label={u.role} color="#444" />
              {u.banned_at && <Tag label="BAN中" color="#dc2626" />}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 24px", marginTop: 20, fontSize: 13 }}>
          <InfoRow label="ユーザーID" value={u.id} mono />
          <InfoRow label="登録日" value={fmtDate(u.created_at)} />
          <InfoRow label="最終ログイン" value={fmtDate(u.last_sign_in_at)} />
          <InfoRow label="メール確認" value={u.email_confirmed_at ? "確認済み" : "未確認"} />
          {u.stripe_customer_id && (
            <InfoRow label="Stripe ID" value={u.stripe_customer_id} mono />
          )}
        </div>

        <UserDetailClient userId={u.id} isBanned={!!u.banned_at} />
      </div>

      {/* BAN info */}
      {u.banned_at && (
        <div style={{ ...cardStyle, borderLeft: "4px solid #dc2626" }}>
          <h2 style={sectionTitle}>BAN情報</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 24px", fontSize: 13 }}>
            <InfoRow label="BAN日時" value={fmtDate(u.banned_at)} />
            <InfoRow label="BAN実行者" value={bannedByName ?? u.banned_by ?? "—"} />
            <InfoRow label="BAN理由" value={u.banned_reason ?? "—"} />
          </div>
        </div>
      )}

      {/* Activity summary */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>アクティビティ</h2>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "レビュー数",          count: reviewCount ?? 0 },
            { label: "サービスレビュー数",  count: serviceReviewCount ?? 0 },
            { label: "お気に入り数",        count: favoriteCount ?? 0 },
          ].map(({ label, count }) => (
            <div key={label} style={{
              flex: 1, background: "#f5f5f7", borderRadius: 12,
              padding: "16px 20px", textAlign: "center",
            }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#1d1d1f" }}>{count}</p>
              <p style={{ fontSize: 12, color: "#86868b", marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit logs */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>このユーザーへの操作履歴（最新20件）</h2>
        {logs.length === 0 ? (
          <p style={{ fontSize: 13, color: "#86868b" }}>操作履歴なし</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                {["日時", "管理者", "アクション", "メタデータ"].map((col) => (
                  <th key={col} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#444" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? "1px solid #f0f0f2" : "none" }}>
                  <td style={{ padding: "8px 12px", whiteSpace: "nowrap", color: "#666" }}>
                    {fmtDate(log.created_at)}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {log.admin?.display_name ?? log.admin_id.slice(0, 8) + "…"}
                  </td>
                  <td style={{ padding: "8px 12px", fontWeight: 500 }}>{log.action}</td>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11, color: "#666" }}
                    title={log.metadata ? JSON.stringify(log.metadata, null, 2) : ""}>
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span style={{ color: "#86868b", marginRight: 8 }}>{label}:</span>
      <span style={{ color: "#1d1d1f", fontFamily: mono ? "monospace" : "inherit", fontSize: mono ? 11 : 13 }}>
        {value}
      </span>
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 600, background: `${color}18`, color,
    }}>
      {label}
    </span>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 16, padding: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 15, fontWeight: 700, color: "#1d1d1f", marginBottom: 16,
};
