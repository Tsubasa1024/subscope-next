import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "メールアドレスを確認してください | SUBSCOPE",
};

export default function VerifyEmailPage() {
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
        <div
          className="flex items-center justify-center rounded-full mx-auto mb-6"
          style={{ width: "72px", height: "72px", background: "#f5f5f7", fontSize: "2rem" }}
        >
          ✉️
        </div>

        <h1 className="font-bold mb-3" style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
          メールを確認してください
        </h1>
        <p className="text-sm mb-2" style={{ color: "#86868b", lineHeight: 1.7 }}>
          確認メールをお送りしました。
          <br />
          メール内のリンクをクリックして登録を完了してください。
        </p>
        <p className="text-xs mb-8" style={{ color: "#aaa" }}>
          メールが届かない場合は迷惑メールフォルダをご確認ください。
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-3.5 rounded-full font-semibold text-sm"
            style={{ background: "#111", color: "#fff" }}
          >
            ログインページへ
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center w-full py-3.5 rounded-full text-sm font-medium"
            style={{ background: "#fff", color: "#111", border: "1.5px solid #e5e5ea" }}
          >
            トップページへ
          </Link>
        </div>
      </div>
    </div>
  );
}
