"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "./actions";
import { createClient } from "@/lib/supabase/client";

async function signupWithGoogle() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
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

export default function SignupPage() {
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (!formData.get("agreed")) {
      setError("利用規約に同意してください");
      setLoading(false);
      return;
    }

    const result = await signup(formData);
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
          <h1 className="font-bold text-center mb-2" style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            無料で始める
          </h1>
          <p className="text-sm text-center mb-8" style={{ color: "#86868b" }}>
            登録すると、お気に入り・比較・診断が使えます
          </p>

          {/* Google 登録 */}
          <button
            type="button"
            onClick={signupWithGoogle}
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

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">ニックネーム</label>
              <input
                name="name"
                type="text"
                required
                maxLength={30}
                autoComplete="nickname"
                placeholder="ニックネームを入力"
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
              <label className="block text-sm font-semibold mb-1.5">パスワード</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="8文字以上"
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

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreed"
                name="agreed"
                value="1"
                className="mt-0.5 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="agreed" className="text-xs leading-relaxed cursor-pointer" style={{ color: "#6b7280" }}>
                <Link href="/terms" className="underline" style={{ color: "#1d1d1f" }}>利用規約</Link>と
                <Link href="/privacy" className="underline" style={{ color: "#1d1d1f" }}>プライバシーポリシー</Link>に同意します
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: loading ? "#999999" : "#111111",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading ? "登録中..." : "無料で登録"}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: "#86868b" }}>
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="font-semibold underline" style={{ color: "#1d1d1f" }}>
              ログイン
            </Link>
          </p>
          <p className="text-xs text-center mt-3" style={{ color: "#aaa" }}>
            クレジットカード不要・いつでもキャンセル可能
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
