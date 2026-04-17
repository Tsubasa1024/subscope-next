export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { AdminUserView } from "@/types/admin";

export const metadata: Metadata = { title: "ユーザー管理 | Admin | SUBSCOPE" };

const PAGE_SIZE = 20;

type SortKey = "created_desc" | "created_asc" | "plan" | "last_sign_in_desc";
type FilterKey = "all" | "banned" | "paid" | "free";

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; filter?: string }>;
}

async function fetchUsers(params: {
  page: number;
  q: string;
  sort: SortKey;
  filter: FilterKey;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = supabase.from("admin_users_view").select("*", { count: "exact" }) as any;

  if (params.filter === "banned")  query = query.not("banned_at", "is", null);
  if (params.filter === "paid")    query = query.in("plan", ["standard", "pro"]);
  if (params.filter === "free")    query = query.eq("plan", "free");

  if (params.q) {
    const escaped = params.q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `email.ilike.%${escaped}%,display_name.ilike.%${escaped}%,username.ilike.%${escaped}%`
    );
  }

  if (params.sort === "created_asc")       query = query.order("created_at", { ascending: true });
  else if (params.sort === "plan")         query = query.order("plan", { ascending: true });
  else if (params.sort === "last_sign_in_desc") query = query.order("last_sign_in_at", { ascending: false, nullsFirst: false });
  else                                     query = query.order("created_at", { ascending: false });

  const from = (params.page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) { console.error("[admin/users] fetch error:", error); return { users: [], total: 0 }; }
  return { users: (data ?? []) as AdminUserView[], total: count ?? 0 };
}

const PLAN_COLOR: Record<string, string> = {
  free:     "#888888",
  standard: "#2563eb",
  pro:      "#7c3aed",
};

function buildUrl(base: URLSearchParams, overrides: Record<string, string>) {
  const next = new URLSearchParams(base);
  for (const [k, v] of Object.entries(overrides)) {
    if (v) next.set(k, v); else next.delete(k);
  }
  return `?${next.toString()}`;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10));
  const q      = sp.q?.trim() ?? "";
  const sort   = (sp.sort ?? "created_desc") as SortKey;
  const filter = (sp.filter ?? "all") as FilterKey;

  const { users, total } = await fetchUsers({ page, q, sort, filter });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const base = new URLSearchParams({ ...(q && { q }), sort, filter });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em" }}>ユーザー管理</h1>
        <p style={{ color: "#86868b", fontSize: "0.875rem", marginTop: 4 }}>
          合計 {total} 件 / {page} ページ目（全 {totalPages} ページ）
        </p>
      </div>

      {/* Search + Filter + Sort */}
      <form method="GET" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="メール / 名前 / ユーザー名で検索"
          style={{
            flex: "1 1 240px", padding: "9px 14px", borderRadius: 10, fontSize: 13,
            border: "1px solid #e5e5e5", background: "#fff", outline: "none",
          }}
        />
        <input type="hidden" name="sort"   value={sort} />
        <input type="hidden" name="filter" value={filter} />
        <button type="submit" style={{
          padding: "9px 20px", borderRadius: 10, background: "#1d1d1f", color: "#fff",
          fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
        }}>
          検索
        </button>
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Filter tabs */}
        {(["all", "banned", "paid", "free"] as FilterKey[]).map((f) => (
          <a key={f} href={buildUrl(base, { filter: f, page: "1" })} style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
            background: filter === f ? "#1d1d1f" : "#f0f0f2",
            color: filter === f ? "#fff" : "#444",
            textDecoration: "none",
          }}>
            {{ all: "すべて", banned: "BAN済み", paid: "有料", free: "無料" }[f]}
          </a>
        ))}
        <div style={{ flex: 1 }} />
        {/* Sort */}
        <select
          name="sort"
          defaultValue={sort}
          onChange={undefined}
          form="sort-form"
          style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 12,
            border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer",
          }}
        >
          <option value="created_desc">登録日（新しい順）</option>
          <option value="created_asc">登録日（古い順）</option>
          <option value="plan">プラン順</option>
          <option value="last_sign_in_desc">最終ログイン順</option>
        </select>
        <form id="sort-form" method="GET">
          {q && <input type="hidden" name="q" value={q} />}
          <input type="hidden" name="filter" value={filter} />
          <button type="submit" style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 12,
            border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer",
          }}>並び替え</button>
        </form>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f5f5f7", borderBottom: "1px solid #e5e5e5" }}>
              {["ユーザー", "メール", "プラン", "ロール", "最終ログイン", "登録日", "状態", ""].map((col) => (
                <th key={col} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#1d1d1f", whiteSpace: "nowrap" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#86868b" }}>
                  該当ユーザーが見つかりません
                </td>
              </tr>
            ) : users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #e5e5e5" : "none" }}>
                {/* Avatar + name */}
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {u.avatar_url ? (
                      <Image
                        src={u.avatar_url} alt="" width={32} height={32}
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "#e5e5e5", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 13, color: "#999",
                      }}>
                        {(u.display_name ?? u.email)[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 500, color: "#1d1d1f" }}>
                        {u.display_name ?? "(未設定)"}
                      </div>
                      {u.username && (
                        <div style={{ fontSize: 11, color: "#86868b" }}>@{u.username}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", color: "#444", fontSize: 12 }}>{u.email}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 8px", borderRadius: 99,
                    fontSize: 11, fontWeight: 600, background: `${PLAN_COLOR[u.plan]}18`,
                    color: PLAN_COLOR[u.plan] ?? "#888",
                  }}>
                    {u.plan}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#666" }}>{u.role}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#86868b", whiteSpace: "nowrap" }}>
                  {u.last_sign_in_at
                    ? new Date(u.last_sign_in_at).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
                    : "—"}
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#86868b", whiteSpace: "nowrap" }}>
                  {new Date(u.created_at).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  {u.banned_at ? (
                    <span style={{
                      display: "inline-block", padding: "2px 8px", borderRadius: 99,
                      fontSize: 11, fontWeight: 600, background: "#fee2e2", color: "#dc2626",
                    }}>
                      BAN
                    </span>
                  ) : (
                    <span style={{
                      display: "inline-block", padding: "2px 8px", borderRadius: 99,
                      fontSize: 11, fontWeight: 600, background: "#dcfce7", color: "#16a34a",
                    }}>
                      正常
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <Link href={`/admin/users/${u.id}`} style={{
                    fontSize: 12, color: "#2563eb", fontWeight: 500, whiteSpace: "nowrap",
                  }}>
                    詳細 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {page > 1 && (
            <a href={buildUrl(base, { page: String(page - 1) })} style={pagerStyle}>← 前へ</a>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <a key={p} href={buildUrl(base, { page: String(p) })} style={{
                ...pagerStyle,
                background: p === page ? "#1d1d1f" : "#fff",
                color: p === page ? "#fff" : "#444",
              }}>
                {p}
              </a>
            ))}
          {page < totalPages && (
            <a href={buildUrl(base, { page: String(page + 1) })} style={pagerStyle}>次へ →</a>
          )}
        </div>
      )}
    </div>
  );
}

const pagerStyle: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 8, fontSize: 13,
  background: "#fff", color: "#444", textDecoration: "none",
  border: "1px solid #e5e5e5", fontWeight: 500,
};
