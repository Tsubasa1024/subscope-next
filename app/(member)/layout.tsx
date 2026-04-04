import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderWithData from "@/components/HeaderWithData";
import Footer from "@/components/Footer";

/**
 * 認証ガード：未ログインはログインページへリダイレクト。
 * ログイン済みユーザーのみ children をレンダリング。
 */
export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <HeaderWithData />
      {children}
      <Footer />
    </>
  );
}
