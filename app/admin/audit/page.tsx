export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import type { AuditLog } from "@/types/admin";

export const metadata: Metadata = { title: "監査ログ | Admin | SUBSCOPE" };

async function getAuditLogs(): Promise<AuditLog[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*, admin:users!admin_id(display_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[admin/audit] fetch error:", error);
    return [];
  }

  return (data ?? []) as AuditLog[];
}

export default async function AuditLogPage() {
  const logs = await getAuditLogs();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          監査ログ
        </h1>
        <p style={{ color: "#86868b", marginTop: 4, fontSize: "0.875rem" }}>
          最新 50 件
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f5f5f7", borderBottom: "1px solid #e5e5e5" }}>
              {["日時", "管理者", "アクション", "対象タイプ", "対象ID", "メタデータ"].map(
                (col) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1d1d1f",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "40px 16px",
                    textAlign: "center",
                    color: "#86868b",
                    fontSize: "0.875rem",
                  }}
                >
                  監査ログはまだありません
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: i < logs.length - 1 ? "1px solid #e5e5e5" : "none",
                  }}
                >
                  <td style={{ padding: "10px 16px", color: "#444444", whiteSpace: "nowrap" }}>
                    {new Date(log.created_at).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {log.admin?.display_name ?? log.admin_id.slice(0, 8) + "…"}
                  </td>
                  <td style={{ padding: "10px 16px", fontWeight: 500 }}>{log.action}</td>
                  <td style={{ padding: "10px 16px", color: "#86868b" }}>{log.target_type}</td>
                  <td
                    style={{
                      padding: "10px 16px",
                      color: "#86868b",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {log.target_id ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#444444",
                      maxWidth: 260,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={log.metadata ? JSON.stringify(log.metadata, null, 2) : ""}
                  >
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
