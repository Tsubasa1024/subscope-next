import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import Link from "next/link";
import type { Role } from "@/types/admin";

async function getPendingReportCount(): Promise<number> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("users")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if ((profile?.role as Role) !== "admin") redirect("/");

  const pendingReports = await getPendingReportCount();

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "#1d1d1f",
          color: "#ffffff",
          padding: "24px 0",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "0 24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#fff",
            }}
          >
            SUBSCOPE
          </Link>
          <p
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.4)",
              marginTop: 4,
              letterSpacing: "0.1em",
            }}
          >
            ADMIN
          </p>
        </div>

        <nav style={{ padding: "12px 0", flex: 1 }}>
          {[
            { href: "/admin",           label: "ダッシュボード" },
            { href: "/admin/services",  label: "サービス管理" },
            { href: "/admin/rankings",  label: "ランキング管理" },
            { href: "/admin/diagnosis", label: "診断管理" },
            { href: "/admin/users",     label: "ユーザー管理" },
            { href: "/admin/articles",  label: "記事分析" },
            { href: "/admin/billing",   label: "課金管理" },
            { href: "/admin/comments",  label: "通報管理", badge: pendingReports > 0 ? pendingReports : 0 },
            { href: "/admin/audit",     label: "監査ログ" },
          ].map(({ href, label, badge }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 24px",
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.7)",
                transition: "color 0.15s",
              }}
            >
              <span>{label}</span>
              {badge ? (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 20,
                  height: 20,
                  borderRadius: 99,
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "0 5px",
                }}>
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Footer: admin name + back link */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
              marginBottom: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {profile?.display_name ?? user.email}
          </p>
          <Link
            href="/"
            style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}
          >
            ← サイトへ戻る
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          marginLeft: 240,
          flex: 1,
          padding: 40,
          background: "#f5f5f7",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
