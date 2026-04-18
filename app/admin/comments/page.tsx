export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { AdminReportView, ReportStatus } from "@/types/admin";

export const metadata: Metadata = { title: "通報管理 | Admin | SUBSCOPE" };

const PAGE_SIZE = 20;

const REASON_LABELS: Record<string, string> = {
  spam: "スパム",
  harassment: "誹謗中傷・ハラスメント",
  inappropriate: "不適切な内容",
  copyright: "著作権侵害",
  other: "その他",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "未対応",
  resolved: "解決済み",
  rejected: "却下",
};

const STATUS_COLOR: Record<ReportStatus, { bg: string; color: string }> = {
  pending: { bg: "#fef3c7", color: "#92400e" },
  resolved: { bg: "#dcfce7", color: "#166534" },
  rejected: { bg: "#f3f4f6", color: "#6b7280" },
};

function svcClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

async function fetchReports(status: ReportStatus, page: number) {
  const supabase = svcClient();
  const from = (page - 1) * PAGE_SIZE;

  const { data, count, error } = await supabase
    .from("admin_reports_view")
    .select("*", { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    console.error("[admin/comments] fetch error:", error);
    return { reports: [], total: 0 };
  }

  return { reports: (data ?? []) as AdminReportView[], total: count ?? 0 };
}

async function fetchCounts() {
  const supabase = svcClient();
  const statuses: ReportStatus[] = ["pending", "resolved", "rejected"];
  const results = await Promise.all(
    statuses.map((s) =>
      supabase
        .from("admin_reports_view")
        .select("id", { count: "exact", head: true })
        .eq("status", s)
    )
  );
  return Object.fromEntries(
    statuses.map((s, i) => [s, results[i].count ?? 0])
  ) as Record<ReportStatus, number>;
}

function buildUrl(overrides: Record<string, string>) {
  const p = new URLSearchParams(overrides);
  return `?${p.toString()}`;
}

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = (sp.status ?? "pending") as ReportStatus;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const [{ reports, total }, counts] = await Promise.all([
    fetchReports(status, page),
    fetchCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          通報管理
        </h1>
        <p style={{ color: "#86868b", fontSize: "0.875rem", marginTop: 4 }}>
          ユーザーからの通報を確認・対応できます
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["pending", "resolved", "rejected"] as ReportStatus[]).map((s) => (
          <a
            key={s}
            href={buildUrl({ status: s, page: "1" })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 600,
              background: status === s ? "#1d1d1f" : "#f0f0f2",
              color: status === s ? "#fff" : "#444",
              textDecoration: "none",
            }}
          >
            {STATUS_LABELS[s]}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 20,
                height: 20,
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                background: status === s ? "rgba(255,255,255,0.25)" : "#e0e0e0",
                color: status === s ? "#fff" : "#666",
                padding: "0 5px",
              }}
            >
              {counts[s]}
            </span>
          </a>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ background: "#f5f5f7", borderBottom: "1px solid #e5e5e5" }}>
              {[
                "通報日時",
                "通報者",
                "対象",
                "理由",
                "詳細",
                "ステータス",
                "",
              ].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#1d1d1f",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "48px",
                    textAlign: "center",
                    color: "#86868b",
                  }}
                >
                  {STATUS_LABELS[status]}の通報はありません
                </td>
              </tr>
            ) : (
              reports.map((r, i) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom:
                      i < reports.length - 1 ? "1px solid #e5e5e5" : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "10px 14px",
                      color: "#666",
                      whiteSpace: "nowrap",
                      fontSize: 12,
                    }}
                  >
                    {new Date(r.created_at).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div
                      style={{ fontWeight: 500, color: "#1d1d1f", fontSize: 12 }}
                    >
                      {r.reporter_display_name ?? "(未設定)"}
                    </div>
                    <div style={{ fontSize: 11, color: "#86868b" }}>
                      {r.reporter_email}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        background:
                          r.target_type === "service_review"
                            ? "#dbeafe"
                            : "#fce7f3",
                        color:
                          r.target_type === "service_review"
                            ? "#1e40af"
                            : "#9d174d",
                      }}
                    >
                      {r.target_type === "service_review"
                        ? "サービスレビュー"
                        : "レビュー"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {REASON_LABELS[r.reason] ?? r.reason}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      color: "#666",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={r.reason_detail ?? ""}
                  >
                    {r.reason_detail ?? "—"}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        background: STATUS_COLOR[r.status].bg,
                        color: STATUS_COLOR[r.status].color,
                      }}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Link
                      href={`/admin/comments/${r.id}`}
                      style={{
                        fontSize: 12,
                        color: "#2563eb",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      詳細 →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 24,
          }}
        >
          {page > 1 && (
            <a
              href={buildUrl({ status, page: String(page - 1) })}
              style={pagerStyle}
            >
              ← 前へ
            </a>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <a
                key={p}
                href={buildUrl({ status, page: String(p) })}
                style={{
                  ...pagerStyle,
                  background: p === page ? "#1d1d1f" : "#fff",
                  color: p === page ? "#fff" : "#444",
                }}
              >
                {p}
              </a>
            ))}
          {page < totalPages && (
            <a
              href={buildUrl({ status, page: String(page + 1) })}
              style={pagerStyle}
            >
              次へ →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const pagerStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  fontSize: 13,
  background: "#fff",
  color: "#444",
  textDecoration: "none",
  border: "1px solid #e5e5e5",
  fontWeight: 500,
};
