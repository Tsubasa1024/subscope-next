export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { AdminReportView, ReportStatus } from "@/types/admin";
import ReportDetailClient from "./ReportDetailClient";

export const metadata: Metadata = {
  title: "通報詳細 | Admin | SUBSCOPE",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function svcClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}

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

type ContentRow = {
  id: string;
  user_id: string;
  created_at: string;
  deleted_at: string | null;
  good_points?: string | null;
  bad_points?: string | null;
  score?: number | null;
  body?: string | null;
  users: { display_name: string | null; username: string | null } | null;
};

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = svcClient();

  const { data: reportData } = await supabase
    .from("admin_reports_view")
    .select("*")
    .eq("id", id)
    .single();

  if (!reportData) notFound();

  const report = reportData as AdminReportView;

  const table =
    report.target_type === "review" ? "reviews" : "service_reviews";
  const contentSelect =
    report.target_type === "service_review"
      ? "id, user_id, created_at, deleted_at, score, good_points, bad_points, users(display_name, username)"
      : "id, user_id, created_at, deleted_at, body, users(display_name, username)";

  const [{ data: contentData }, { data: otherReports }] = await Promise.all([
    supabase
      .from(table)
      .select(contentSelect)
      .eq("id", report.target_id)
      .maybeSingle(),
    supabase
      .from("admin_reports_view")
      .select("id, reporter_display_name, reporter_email, reason, status, created_at")
      .eq("target_type", report.target_type)
      .eq("target_id", report.target_id)
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const content = contentData as unknown as ContentRow | null;
  const others = (otherReports ?? []) as AdminReportView[];

  const fmtDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
      : "—";

  const statusC = STATUS_COLOR[report.status];

  return (
    <div>
      {/* Back link */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href={`/admin/comments?status=${report.status}`}
          style={{ fontSize: 13, color: "#86868b" }}
        >
          ← 通報一覧へ戻る
        </Link>
      </div>

      {/* Report info */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f" }}>
            通報詳細
          </h1>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              background: statusC.bg,
              color: statusC.color,
            }}
          >
            {STATUS_LABELS[report.status]}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px 24px",
            fontSize: 13,
          }}
        >
          <InfoRow label="通報ID" value={report.id} mono />
          <InfoRow
            label="通報日時"
            value={fmtDate(report.created_at)}
          />
          <InfoRow
            label="通報者"
            value={`${report.reporter_display_name ?? "(未設定)"} (${report.reporter_email})`}
          />
          <InfoRow
            label="対象タイプ"
            value={
              report.target_type === "service_review"
                ? "サービスレビュー"
                : "レビュー"
            }
          />
          <InfoRow
            label="通報理由"
            value={REASON_LABELS[report.reason] ?? report.reason}
          />
          <InfoRow label="対象ID" value={report.target_id} mono />
          {report.reason_detail && (
            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ color: "#86868b", marginRight: 8 }}>
                詳細説明:
              </span>
              <span style={{ color: "#1d1d1f" }}>{report.reason_detail}</span>
            </div>
          )}
        </div>

        {report.status !== "pending" && (
          <div
            style={{
              marginTop: 20,
              padding: "14px 16px",
              background: "#f5f5f7",
              borderRadius: 10,
              fontSize: 13,
            }}
          >
            <p style={{ fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>
              対応履歴
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "6px 24px",
              }}
            >
              <InfoRow
                label="処理者"
                value={report.resolver_display_name ?? report.resolved_by ?? "—"}
              />
              <InfoRow
                label="処理日時"
                value={fmtDate(report.resolved_at)}
              />
              {report.resolution_note && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ color: "#86868b", marginRight: 8 }}>
                    対応メモ:
                  </span>
                  <span style={{ color: "#1d1d1f" }}>
                    {report.resolution_note}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content preview */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>対象コンテンツ</h2>

        {!content ? (
          <p style={{ fontSize: 13, color: "#86868b" }}>
            コンテンツが見つかりません（既に完全削除された可能性があります）。
          </p>
        ) : content.deleted_at ? (
          <div>
            <div
              style={{
                padding: "10px 14px",
                background: "#fee2e2",
                borderRadius: 8,
                fontSize: 13,
                color: "#dc2626",
                marginBottom: 12,
              }}
            >
              このコンテンツは {fmtDate(content.deleted_at)} に削除されました。
            </div>
            <ContentBody content={content} targetType={report.target_type} />
          </div>
        ) : (
          <ContentBody content={content} targetType={report.target_type} />
        )}

        {content && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/admin/users/${content.user_id}`}
              style={linkBtnStyle}
            >
              投稿者の詳細を見る →
            </Link>
          </div>
        )}
      </div>

      {/* Other reports on same target */}
      {others.length > 0 && (
        <div style={cardStyle}>
          <h2 style={sectionTitle}>
            同じコンテンツへの他の通報（{others.length}件）
          </h2>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                {["通報日時", "通報者", "理由", "ステータス", ""].map((c) => (
                  <th
                    key={c}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#444",
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {others.map((o, i) => (
                <tr
                  key={o.id}
                  style={{
                    borderBottom:
                      i < others.length - 1 ? "1px solid #f0f0f2" : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "8px 12px",
                      whiteSpace: "nowrap",
                      color: "#666",
                    }}
                  >
                    {fmtDate(o.created_at)}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ fontSize: 12 }}>
                      {o.reporter_display_name ?? "(未設定)"}
                    </div>
                    <div style={{ fontSize: 11, color: "#86868b" }}>
                      {o.reporter_email}
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {REASON_LABELS[o.reason] ?? o.reason}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        background: STATUS_COLOR[o.status].bg,
                        color: STATUS_COLOR[o.status].color,
                      }}
                    >
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <Link
                      href={`/admin/comments/${o.id}`}
                      style={{ fontSize: 12, color: "#2563eb" }}
                    >
                      詳細 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      <div style={cardStyle}>
        <h2 style={{ ...sectionTitle, marginBottom: 16 }}>対応アクション</h2>
        <ReportDetailClient
          reportId={report.id}
          status={report.status}
          contentAuthorId={content?.user_id ?? null}
        />
      </div>
    </div>
  );
}

function ContentBody({
  content,
  targetType,
}: {
  content: ContentRow;
  targetType: string;
}) {
  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  return (
    <div>
      <div style={{ fontSize: 13, marginBottom: 10, color: "#666" }}>
        <span style={{ fontWeight: 600, color: "#1d1d1f" }}>
          {content.users?.display_name ?? "(未設定)"}
        </span>
        {content.users?.username && (
          <span style={{ color: "#86868b", marginLeft: 6 }}>
            @{content.users.username}
          </span>
        )}
        <span style={{ color: "#86868b", marginLeft: 12 }}>
          {fmtDate(content.created_at)}
        </span>
      </div>

      {targetType === "service_review" ? (
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          {content.score != null && (
            <p>
              <span style={{ fontWeight: 600 }}>スコア: </span>
              {content.score}/10
            </p>
          )}
          {content.good_points && (
            <p>
              <span style={{ fontWeight: 600, color: "#27ae60" }}>
                良い点:{" "}
              </span>
              {content.good_points}
            </p>
          )}
          {content.bad_points && (
            <p style={{ marginTop: 4 }}>
              <span style={{ fontWeight: 600, color: "#c0392b" }}>
                改善点:{" "}
              </span>
              {content.bad_points}
            </p>
          )}
          {!content.good_points && !content.bad_points && (
            <p style={{ color: "#86868b" }}>（テキストなし）</p>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 13, lineHeight: 1.7, color: "#333" }}>
          {content.body ?? <span style={{ color: "#86868b" }}>（本文なし）</span>}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span style={{ color: "#86868b", marginRight: 8 }}>{label}:</span>
      <span
        style={{
          color: "#1d1d1f",
          fontFamily: mono ? "monospace" : "inherit",
          fontSize: mono ? 11 : 13,
        }}
      >
        {value}
      </span>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  marginBottom: 20,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#1d1d1f",
  marginBottom: 16,
};

const linkBtnStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 16px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  background: "#f0f0f2",
  color: "#444",
  textDecoration: "none",
};
