"use client";

import Link from "next/link";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  /** "login": ログイン/新規登録ボタン（デフォルト）, "upgrade": プランを見るボタン */
  mode?: "login" | "upgrade";
}

export default function LoginPromptModal({
  isOpen,
  onClose,
  message,
  mode = "login",
}: LoginPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 text-center"
        style={{ background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
          aria-label="閉じる"
        >
          ✕
        </button>

        {/* アイコン */}
        <div
          className="flex items-center justify-center rounded-full mx-auto mb-5"
          style={{ width: "56px", height: "56px", background: "#f5f5f7", fontSize: "1.6rem" }}
        >
          {mode === "upgrade" ? "🔒" : "👤"}
        </div>

        {/* メッセージ */}
        <p className="font-semibold mb-2" style={{ fontSize: "1rem", color: "#111", letterSpacing: "-0.01em" }}>
          {message}
        </p>
        <p className="text-sm mb-7" style={{ color: "#86868b", lineHeight: 1.6 }}>
          {mode === "upgrade"
            ? "プランをアップグレードして全機能をお楽しみください。"
            : "アカウントをお持ちでない方は無料で登録できます。"}
        </p>

        {/* ボタン */}
        {mode === "upgrade" ? (
          <div className="flex flex-col gap-2">
            <Link
              href="/pricing"
              onClick={onClose}
              className="flex items-center justify-center w-full py-3 rounded-full font-semibold text-sm"
              style={{ background: "#111", color: "#fff" }}
            >
              プランを見る →
            </Link>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full text-sm font-medium"
              style={{ background: "none", border: "1.5px solid #e5e5ea", cursor: "pointer", fontFamily: "inherit", color: "#555" }}
            >
              キャンセル
            </button>
          </div>
        ) : (
          // ログイン・新規登録ボタン UI非表示
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full text-sm font-medium"
            style={{ background: "none", border: "1.5px solid #e5e5ea", cursor: "pointer", fontFamily: "inherit", color: "#555" }}
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
}
