"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReport } from "@/app/actions/report";
import type { ReportReason, ReportTargetType } from "@/types/admin";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "スパム" },
  { value: "harassment", label: "誹謗中傷・ハラスメント" },
  { value: "inappropriate", label: "不適切な内容" },
  { value: "copyright", label: "著作権侵害" },
  { value: "other", label: "その他" },
];

interface Props {
  targetType: ReportTargetType;
  targetId: string;
  isLoggedIn: boolean;
  alreadyReported: boolean;
}

export default function ReportButton({
  targetType,
  targetId,
  isLoggedIn,
  alreadyReported,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyReported);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (done) return;
    setError(null);
    setReason("spam");
    setDetail("");
    setOpen(true);
  }

  function handleSubmit() {
    if (reason === "other" && !detail.trim()) {
      setError("「その他」の場合は詳細を入力してください");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitReport(
        targetType,
        targetId,
        reason,
        detail.trim() || undefined
      );
      if ("success" in result) {
        setDone(true);
        setOpen(false);
      } else if (result.error === "already_reported") {
        setDone(true);
        setOpen(false);
      } else {
        setError("送信に失敗しました。もう一度お試しください。");
      }
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        title={done ? "通報済み" : isLoggedIn ? "通報する" : "ログインして通報"}
        disabled={done}
        style={{
          border: "none",
          background: "none",
          cursor: done ? "default" : "pointer",
          padding: "4px 6px",
          color: done ? "#c8c8cc" : "#aaaaaa",
          borderRadius: 6,
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          fontSize: 11,
          opacity: done ? 0.6 : 1,
          transition: "color 0.15s",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        {done ? "通報済み" : "通報"}
      </button>

      {open && (
        <div
          onClick={() => {
            if (!pending) setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              width: "min(480px, 90vw)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
                color: "#1d1d1f",
              }}
            >
              コンテンツを通報する
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#86868b",
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              ガイドライン違反のコンテンツを報告してください。通報内容は運営のみに通知されます。
            </p>

            <div style={{ marginBottom: 18 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 10,
                  color: "#1d1d1f",
                }}
              >
                通報理由
              </p>
              {REASONS.map(({ value, label }) => (
                <label
                  key={value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#333",
                  }}
                >
                  <input
                    type="radio"
                    name={`report-reason-${targetId}`}
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    style={{ accentColor: "#111" }}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "#1d1d1f",
                }}
              >
                詳細説明
                {reason === "other" && (
                  <span style={{ color: "#dc2626" }}> *必須</span>
                )}
                <span
                  style={{
                    fontWeight: 400,
                    color: "#86868b",
                    fontSize: 12,
                    marginLeft: 4,
                  }}
                >
                  （最大500文字）
                </span>
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value.slice(0, 500))}
                placeholder="詳細を入力してください（任意）"
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  border: "1px solid #e5e5e5",
                  resize: "vertical",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <p
                style={{
                  fontSize: 11,
                  color: "#86868b",
                  textAlign: "right",
                  marginTop: 2,
                }}
              >
                {detail.length}/500
              </p>
            </div>

            {error && (
              <p
                style={{ fontSize: 13, color: "#dc2626", marginBottom: 12 }}
              >
                {error}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                style={btnBase}
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={pending}
                style={{
                  ...btnBase,
                  background: "#dc2626",
                  color: "#fff",
                  opacity: pending ? 0.7 : 1,
                  cursor: pending ? "not-allowed" : "pointer",
                }}
              >
                {pending ? "送信中..." : "通報する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const btnBase: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  background: "#f0f0f2",
  color: "#444",
};
