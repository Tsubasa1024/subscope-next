"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  categories: { name: string } | null;
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#86868b",
  borderBottom: "1px solid #f0f0f2",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: "0.875rem",
  borderBottom: "1px solid #f5f5f7",
  verticalAlign: "middle",
};

export function ServiceTable({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(services);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function toggleActive(id: string, current: boolean) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current }),
      });
      if (!res.ok) throw new Error("更新に失敗しました");
      setRows((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !current } : s))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteService(id: string, name: string) {
    if (!confirm(`「${name}」を削除してもよいですか？`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      setRows((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
      setDeletingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: "60px",
          textAlign: "center",
          color: "#86868b",
          fontSize: "0.875rem",
        }}
      >
        サービスがまだ登録されていません
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#fafafa" }}>
          <tr>
            <th style={thStyle}>サービス名</th>
            <th style={thStyle}>スラッグ</th>
            <th style={thStyle}>カテゴリ</th>
            <th style={thStyle}>注目</th>
            <th style={{ ...thStyle, textAlign: "center" }}>有効</th>
            <th style={{ ...thStyle, textAlign: "right" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((service) => (
            <tr key={service.id} style={{ transition: "background 0.15s" }}>
              <td style={tdStyle}>
                <span style={{ fontWeight: 500 }}>{service.name}</span>
              </td>
              <td style={tdStyle}>
                <code
                  style={{
                    fontSize: "0.78rem",
                    background: "#f0f0f2",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                  }}
                >
                  {service.slug}
                </code>
              </td>
              <td style={tdStyle}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: service.categories ? "#1d1d1f" : "#86868b",
                  }}
                >
                  {service.categories?.name ?? "—"}
                </span>
              </td>
              <td style={tdStyle}>
                {service.is_featured && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      background: "#fff3cd",
                      color: "#856404",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontWeight: 500,
                    }}
                  >
                    注目
                  </span>
                )}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                <button
                  onClick={() => toggleActive(service.id, service.is_active)}
                  disabled={loadingId === service.id}
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: loadingId === service.id ? "wait" : "pointer",
                    background: service.is_active ? "#4CAF82" : "#d1d1d6",
                    position: "relative",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                  title={service.is_active ? "無効にする" : "有効にする"}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: service.is_active ? "22px" : "2px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </td>
              <td style={{ ...tdStyle, textAlign: "right" }}>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <Link
                    href={`/admin/services/${service.id}/edit`}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      background: "#f0f0f2",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: "#1d1d1f",
                      textDecoration: "none",
                    }}
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => deleteService(service.id, service.name)}
                    disabled={deletingId === service.id}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      background: deletingId === service.id ? "#f0f0f2" : "#fff0f0",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: "#e53e3e",
                      border: "none",
                      cursor: deletingId === service.id ? "wait" : "pointer",
                    }}
                  >
                    {deletingId === service.id ? "削除中..." : "削除"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
