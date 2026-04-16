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
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.5)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative", background: "#fff", borderRadius: "24px",
          padding: "40px 32px", maxWidth: "380px", width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            width: "32px", height: "32px", borderRadius: "50%",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "inherit", color: "#999", fontSize: "1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="閉じる"
        >
          ✕
        </button>

        {/* アイコン */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "#f5f5f7", display: "inline-flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>

        {/* タイトル */}
        <h2 style={{
          fontSize: "1.2rem", fontWeight: 700, textAlign: "center",
          marginBottom: "8px", letterSpacing: "-0.02em", color: "#111",
        }}>
          保存上限に達しました
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#86868b", textAlign: "center", marginBottom: "6px", lineHeight: 1.6 }}>
          現在のプラン: <strong style={{ color: "#111" }}>{planLabel}</strong>（最大 {limit} 件）
        </p>
        <p style={{ fontSize: "0.875rem", color: "#86868b", textAlign: "center", marginBottom: "28px", lineHeight: 1.6 }}>
          {next.name} プランにアップグレードすると<br />
          <strong style={{ color: "#111" }}>{next.saves}</strong>保存できます
        </p>

        {/* ボタン */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            href="/pricing"
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", padding: "14px", borderRadius: "14px",
              background: "#111", color: "#fff", textDecoration: "none",
              fontSize: "0.9rem", fontWeight: 600,
            }}
          >
            プランを見る →
          </Link>
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "13px", borderRadius: "14px",
              background: "transparent", color: "#555",
              border: "1.5px solid rgba(0,0,0,0.12)",
              fontSize: "0.9rem", fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
