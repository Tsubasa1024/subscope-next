import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderWithData from "@/components/HeaderWithData";
import Footer from "@/components/Footer";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("banned_at, banned_reason")
    .eq("id", user.id)
    .single();

  const isBanned = !!profile?.banned_at;

  return (
    <>
      <HeaderWithData />
      {isBanned && (
        <div style={{
          position: "sticky", top: 0, zIndex: 500,
          background: "#dc2626", color: "#fff",
          padding: "12px 24px", fontSize: 13, fontWeight: 500,
          textAlign: "center",
        }}>
          アカウントが停止されています。
          {profile?.banned_reason && (
            <> 理由: <strong>{profile.banned_reason}</strong></>
          )}
        </div>
      )}
      {children}
      <Footer />
    </>
  );
}
