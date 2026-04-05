import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登録完了 | SUBSCOPE",
};

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

        <h1 className="font-bold mb-3" style={{ fontSize: "1.8rem", letterSpacing: "-0.03em" }}>
          登録完了！
        </h1>
        <p className="font-semibold mb-2" style={{ fontSize: "1.1rem", color: "#111" }}>
          SUBSCOPEへようこそ
        </p>
        <p className="text-sm mb-8" style={{ color: "#86868b", lineHeight: 1.7 }}>
          無料プランで今すぐ使い始められます。
          <br />
          必要に応じてプランをアップグレードできます。
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-full py-3.5 rounded-full font-semibold text-sm"
            style={{ background: "#111", color: "#fff" }}
          >
            まず使ってみる →
          </Link>
          <Link
            href="/pricing"
            className="flex items-center justify-center w-full py-3.5 rounded-full font-semibold text-sm"
            style={{ background: "#fff", color: "#111", border: "1.5px solid #e5e5ea" }}
          >
            プランを見る →
          </Link>
        </div>
      </div>

      <p className="text-xs mt-6" style={{ color: "#aaa" }}>
        いつでもマイページからプランを変更できます
      </p>
    </div>
  );
}
