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

// ============================================================
// プランデータ（login と共通）
// ============================================================
const PLANS = [
  {
    name: "Free",
    price: "¥0",
    period: "",
    color: "#666666",
    bg: "#f5f5f5",
    border: "#e5e5e5",
    features: ["お気に入り 3件", "記事 冒頭のみ", "比較 2件まで"],
  },
  {
    name: "Standard",
    price: "¥580",
    period: "/月",
    color: "#111111",
    bg: "#f5f5f5",
    border: "#333333",
    badge: "人気",
    features: ["お気に入り 20件", "全記事 読み放題", "比較 3件・広告非表示"],
  },
  {
    name: "Pro",
    price: "¥1,480",
    period: "/月",
    color: "#111111",
    bg: "#f5f5f5",
    border: "#e5e5e5",
    features: ["全機能 無制限", "比較 5件・API利用", "データエクスポート"],
  },
];

// ============================================================
// Page
// ============================================================
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f5f5f7" }}
    >
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
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 items-start">

          {/* ===== LEFT: プラン案内 ===== */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="mb-5">
              <h2 className="font-bold text-lg" style={{ letterSpacing: "-0.02em" }}>
                登録後すぐ使える
              </h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                無料プランで今すぐスタート。後からいつでもアップグレード可能です。
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-2xl p-4"
                  style={{ background: plan.bg, border: `1.5px solid ${plan.border}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: plan.color }}>
                        {plan.name}
                      </span>
                      {plan.badge && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: plan.color }}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-bold" style={{ color: plan.color }}>
                      {plan.price}
                      <span className="text-xs font-normal" style={{ color: "#6b7280" }}>
                        {plan.period}
                      </span>
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "#374151" }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* 「まずは無料で始める」強調CTA（登録ページでは「ログイン」リンクに） */}
            <p className="mt-4 text-center text-sm" style={{ color: "#6b7280" }}>
              すでにアカウントをお持ちの方は{" "}
              <Link href="/login" className="font-semibold underline" style={{ color: "#1d1d1f" }}>
                ログイン
              </Link>
            </p>
          </div>

          {/* ===== RIGHT: 登録フォーム ===== */}
          <div
            className="flex-1 w-full"
            style={{
              background: "#fff",
              borderRadius: "28px",
              padding: "36px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.07)",
            }}
          >
            <h1
              className="font-bold text-center mb-2"
              style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}
            >
              無料で始める
            </h1>
            <p className="text-sm text-center mb-7" style={{ color: "#86868b" }}>
              登録すると、お気に入り・比較・診断が使えます
            </p>

            {error && (
              <div
                className="text-sm p-3 rounded-xl mb-4"
                style={{ background: "#fff0f0", color: "#c0392b" }}
              >
                {error}
              </div>
            )}

            {/* Google 登録 */}
            <button
              type="button"
              onClick={signupWithGoogle}
              className="w-full border border-gray-200 rounded-full py-3 px-6 flex items-center gap-3 hover:bg-gray-50 transition-colors mb-5"
              style={{ background: "#fff", cursor: "pointer", fontFamily: "inherit" }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700 flex-1 text-center">Googleで続ける</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">またはメールで</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

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
                {loading ? "登録中..." : "無料で会員登録"}
              </button>
            </form>

            {/* まずは無料で始めるCTA */}
            <div
              className="mt-6 p-4 rounded-2xl text-center"
              style={{ background: "#f5f5f5", border: "1px solid #e5e5e5" }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "#111111" }}>
                まずは無料で始められます
              </p>
              <p className="text-xs" style={{ color: "#666666" }}>
                クレジットカード不要・いつでもキャンセル可能
              </p>
            </div>
          </div>
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
