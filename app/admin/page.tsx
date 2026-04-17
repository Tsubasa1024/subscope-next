export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = { title: "Admin Dashboard | SUBSCOPE" };

const STAT_CARDS = [
  { label: "総ユーザー数",    unit: "人" },
  { label: "有料会員数",      unit: "人" },
  { label: "今月のMRR",       unit: "円" },
  { label: "今月の新規記事数", unit: "件" },
];

export default async function AdminDashboard() {
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );

  const { count: serviceCount } = await adminSupabase
    .from("services")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          ダッシュボード
        </h1>
      </div>

      {/* Phase 1 統計カード（実数はPhase 3） */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {STAT_CARDS.map(({ label, unit }) => (
          <StatCard key={label} label={label} unit={unit} />
        ))}
      </div>

      {/* 登録サービス数（実値あり） */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            borderLeft: "4px solid #4CAF82",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "#86868b", marginBottom: 8 }}>登録サービス数</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 700 }}>{serviceCount ?? "—"}</p>
        </div>
      </div>

      {/* クイックリンク */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>クイックアクセス</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "サービスを追加する",  href: "/admin/services/new" },
            { label: "ランキングを更新する", href: "/admin/rankings" },
            { label: "診断を管理する",      href: "/admin/diagnosis" },
            { label: "ユーザーを管理する",  href: "/admin/users" },
            { label: "監査ログを確認する",  href: "/admin/audit" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              style={{
                display: "block",
                padding: "12px 16px",
                borderRadius: 12,
                background: "#f5f5f7",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#1d1d1f",
              }}
            >
              {label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, unit }: { label: string; unit: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ fontSize: "0.78rem", color: "#86868b", marginBottom: 8 }}>{label}</p>
      {/* Skeleton */}
      <div
        style={{
          height: 36,
          width: 72,
          background: "#e5e5e5",
          borderRadius: 6,
          marginBottom: 8,
        }}
      />
      <p style={{ fontSize: "0.72rem", color: "#aaaaaa" }}>
        前月比 <span style={{ display: "inline-block", width: 36, height: 11, background: "#e5e5e5", borderRadius: 3, verticalAlign: "middle" }} /> {unit}
      </p>
      <p style={{ fontSize: "0.68rem", color: "#bbbbbb", marginTop: 4 }}>Phase 3 で実装</p>
    </div>
  );
}
