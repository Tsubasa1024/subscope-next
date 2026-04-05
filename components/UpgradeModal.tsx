"use client";

import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string; // 例: 「コメント機能」
}

const STANDARD_HIGHLIGHTS = [
  "保存 15件まで",
  "コメント機能",
  "広告非表示・プレミアム記事",
];

export default function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
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
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", color: "#999" }}
          aria-label="閉じる"
        >
          ✕
        </button>

        {/* アイコン */}
        <div
          className="flex items-center justify-center rounded-full mx-auto mb-5"
          style={{ width: "56px", height: "56px", background: "#f5f5f7", fontSize: "1.6rem" }}
        >
          🔒
        </div>

        {/* タイトル */}
        <p className="font-bold mb-1" style={{ fontSize: "1.05rem", color: "#111", letterSpacing: "-0.01em" }}>
          {feature}はStandard以上で使えます
        </p>
        <p className="text-sm mb-6" style={{ color: "#86868b" }}>
          ¥580/月でアップグレード
        </p>

        {/* Standardの主要機能 */}
        <ul className="text-left mb-7 space-y-2">
          {STANDARD_HIGHLIGHTS.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "#374151" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="8" cy="8" r="8" fill="#111" />
                <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {/* ボタン */}
        <div className="flex flex-col gap-2">
          <Link
            href="/pricing"
            onClick={onClose}
            className="flex items-center justify-center w-full py-3 rounded-full font-semibold text-sm"
            style={{ background: "#111", color: "#fff" }}
          >
            アップグレードする →
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full text-sm font-medium"
            style={{ background: "none", border: "1.5px solid #e5e5ea", cursor: "pointer", fontFamily: "inherit", color: "#555" }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
