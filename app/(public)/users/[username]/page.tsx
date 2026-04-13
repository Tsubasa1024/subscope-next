export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlanBadge from "@/components/PlanBadge";

type Props = { params: Promise<{ username: string }> };

type UserRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: "free" | "standard" | "pro";
  username: string | null;
};

type SubRow = {
  service_id: string;
  services: { id: string; name: string; slug: string; logo_url: string | null } | null;
};

function hashColor(id: string): string {
  const palette = ["#111111","#333333","#555555","#777777","#444444","#666666","#888888","#999999"];
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return palette[Math.abs(h) % palette.length];
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase
    .from("users")
    .select("id, display_name, avatar_url, plan, username")
    .eq("username", username)
    .maybeSingle();

  if (!userData) notFound();

  const user = userData as UserRow;

  const [{ data: subsData }, { count: reviewCount }] = await Promise.all([
    supabase
      .from("user_subscriptions")
      .select("service_id, services(id, name, slug, logo_url)")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("service_reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const subs = (subsData ?? []) as unknown as SubRow[];
  const avatarColor = hashColor(user.id);
  const displayName = user.display_name || username;
  const initial = displayName[0]?.toUpperCase() ?? "?";

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "20px",
    padding: "6px 12px",
    fontSize: "0.8rem",
    fontWeight: 500,
    textDecoration: "none",
    color: "#111",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      <main style={{ display: "flex", justifyContent: "center", padding: "40px 16px 60px" }}>
        <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* プロフィールカード */}
          <div style={{
            background: "#fff", borderRadius: "20px", padding: "32px 24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: avatarColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", fontWeight: 700, color: "#fff",
            }}>
              {initial}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>{displayName}</p>
              <PlanBadge plan={user.plan} />
            </div>
            <p style={{ fontSize: "0.85rem", color: "#86868b" }}>@{username}</p>
            <div style={{ display: "flex", gap: "20px", marginTop: "4px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: "1rem" }}>{subs.length}</p>
                <p style={{ fontSize: "0.75rem", color: "#86868b" }}>サブスク</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: "1rem" }}>{reviewCount ?? 0}</p>
                <p style={{ fontSize: "0.75rem", color: "#86868b" }}>レビュー</p>
              </div>
            </div>
          </div>

          {/* 使っているサブスク */}
          {subs.length > 0 && (
            <>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86868b", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
                使っているサブスク
              </p>
              <div style={{
                background: "#fff", borderRadius: "20px", padding: "20px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {subs.map((sub) =>
                    sub.services ? (
                      <Link
                        key={sub.service_id}
                        href={`/service-ranking/${sub.services.slug}`}
                        style={badgeStyle}
                      >
                        {sub.services.logo_url && (
                          <img
                            src={sub.services.logo_url}
                            alt=""
                            style={{ width: 16, height: 16, borderRadius: 3, objectFit: "contain" }}
                          />
                        )}
                        {sub.services.name}
                      </Link>
                    ) : null
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </main>

      <footer style={{ padding: "24px", textAlign: "center", fontSize: "0.8rem", color: "#86868b" }}>
        <Link href="/privacy">プライバシーポリシー</Link>
        {" · "}
        <Link href="/terms">利用規約</Link>
      </footer>
    </div>
  );
}
