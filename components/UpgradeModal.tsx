"use client";

import Link from "next/link";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  standard: "Standard",
  pro: "Pro",
};

const NEXT_PLAN_SAVES: Record<string, { name: string; saves: string }> = {
  free:     { name: "Standard", saves: "15件" },
  standard: { name: "Pro",      saves: "無制限" },
  pro:      { name: "Pro",      saves: "無制限" },
};

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  limit: number;
}

export default function UpgradeModal({ isOpen, onClose, currentPlan, limit }: UpgradeModalProps) {
  if (!isOpen) return null;

  const planLabel = PLAN_LABELS[currentPlan] ?? currentPlan;
  const next = NEXT_PLAN_SAVES[currentPlan] ?? { name: "上位プラン", saves: "より多く" };

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
          🔖
        </div>

        {/* タイトル */}
        <p className="font-bold mb-1" style={{ fontSize: "1.05rem", color: "#111", letterSpacing: "-0.01em" }}>
          保存上限に達しました
        </p>
        <p className="text-sm mb-2" style={{ color: "#86868b" }}>
          現在のプラン: <strong style={{ color: "#111" }}>{planLabel}</strong>（最大 {limit} 件）
        </p>
        <p className="text-sm mb-6" style={{ color: "#86868b" }}>
          {next.name} プランにアップグレードすると<br />
          <strong style={{ color: "#111" }}>{next.saves}</strong>保存できます
        </p>

        {/* ボタン */}
        <div className="flex flex-col gap-2">
          <Link
            href="/pricing"
            onClick={onClose}
            className="flex items-center justify-center w-full py-3 rounded-full font-semibold text-sm"
            style={{ background: "#111", color: "#fff", textDecoration: "none" }}
          >
            プランを見る →
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
