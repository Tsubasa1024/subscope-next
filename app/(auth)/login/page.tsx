"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { createClient } from "@/lib/supabase/client";

async function loginWithGoogle() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` },
  });
}

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

export default function LoginPage() {
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f7" }}>
      {/* ヘッダー */}
      <header
        className="text-center py-4"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Link href="/" style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f" }}>
          SUBSCOPE
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div
          className="w-full max-w-md"
          style={{
            background: "#fff",
            borderRadius: "28px",
            padding: "40px 36px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.07)",
          }}
        >
          <h1 className="font-bold text-center mb-8" style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            SUBSCOPEにログイン
          </h1>

          {/* Google ログイン */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full border border-gray-200 rounded-full py-3.5 px-6 flex items-center gap-3 hover:bg-gray-50 transition-colors mb-6"
            style={{ background: "#fff", cursor: "pointer", fontFamily: "inherit" }}
          >
            <GoogleLogo />
            <span className="text-sm font-semibold text-gray-700 flex-1 text-center">Googleで続ける</span>
          </button>

          {/* 区切り線 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {error && (
            <div className="text-sm p-3 rounded-xl mb-4" style={{ background: "#fff0f0", color: "#c0392b" }}>
              {error}
            </div>
          )}

          <form action={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">メールアドレス</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="example@mail.com"
                className="w-full text-sm outline-none"
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  background: "#fafafa",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold">パスワード</label>
                <Link href="/forgot-password" className="text-xs hover:opacity-70 transition-opacity" style={{ color: "#111111" }}>
                  パスワードを忘れた方
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="パスワードを入力"
                className="w-full text-sm outline-none"
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  background: "#fafafa",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: loading ? "#9ca3af" : "#1d1d1f",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: "#86868b" }}>
            アカウントをお持ちでない方は{" "}
            <Link href="/signup" className="font-semibold underline" style={{ color: "#1d1d1f" }}>
              新規登録
            </Link>
          </p>
        </div>
      </main>

      <footer className="py-5 text-center text-xs" style={{ color: "#86868b" }}>
        <Link href="/privacy">プライバシーポリシー</Link>
        {" · "}
        <Link href="/terms">利用規約</Link>
      </footer>
    </div>
  );
}
