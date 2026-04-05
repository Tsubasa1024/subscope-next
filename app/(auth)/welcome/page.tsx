import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登録完了 | SUBSCOPE",
};

const FREE_FEATURES = [
  "記事 読み放題",
  "いいね 無制限",
  "保存 5件まで",
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#f5f5f7" }}>
      <div
        className="w-full max-w-md text-center"
        style={{
          background: "#fff",
          borderRadius: "32px",
          padding: "48px 40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.07)",
        }}
      >
        {/* アイコン */}
        <div
          className="flex items-center justify-center rounded-full mx-auto mb-6"
          style={{ width: "72px", height: "72px", background: "#111", fontSize: "2rem" }}
        >
          🎉
        </div>

        <h1 className="font-bold mb-2" style={{ fontSize: "1.8rem", letterSpacing: "-0.03em" }}>
          登録完了！
        </h1>
        <p className="text-sm mb-8" style={{ color: "#86868b" }}>
          SUBSCOPEへようこそ。無料プランで今すぐ使い始められます。
        </p>

        {/* 現在のプラン */}
        <div
          className="rounded-2xl p-5 mb-6 text-left"
          style={{ background: "#f5f5f7", border: "1.5px solid #e5e5ea" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm">現在のプラン: Free</p>
            <span className="text-sm font-bold">¥0</span>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#374151" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="7" fill="#111" />
                  <path d="M4 7l2.5 2.5 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="flex items-center justify-center w-full py-3.5 rounded-full font-semibold text-sm"
            style={{ background: "#111", color: "#fff" }}
          >
            プランをアップグレード →
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center w-full py-3.5 rounded-full font-semibold text-sm"
            style={{ background: "#fff", color: "#111", border: "1.5px solid #e5e5ea" }}
          >
            まず使ってみる
          </Link>
        </div>
      </div>

      <p className="text-xs mt-6" style={{ color: "#aaa" }}>
        いつでもマイページからプランを変更できます
      </p>
    </div>
  );
}
