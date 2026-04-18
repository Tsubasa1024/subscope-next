"use client";

import { useState, useTransition } from "react";
import { restoreContent } from "@/app/admin/audit/actions";

interface Props {
  targetType: string;
  targetId: string;
}

export default function RestoreButton({ targetType, targetId }: Props) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
        復元済み
      </span>
    );
  }

  function handleClick() {
    setConfirm(true);
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await restoreContent(targetType, targetId);
      if ("success" in result) {
        setDone(true);
        setConfirm(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          padding: "3px 10px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          border: "1px solid #16a34a",
          background: "transparent",
          color: "#16a34a",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        復元
      </button>

      {confirm && (
        <div
          onClick={() => { if (!pending) setConfirm(false); }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
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
              width: "min(400px, 90vw)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
              コンテンツを復元しますか？
            </h2>
            <p style={{ fontSize: 13, color: "#86868b", marginBottom: 20, lineHeight: 1.6 }}>
              ソフトデリートされたコンテンツを復元します。一般ユーザーに再度表示されるようになります。
            </p>
            {error && (
              <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 12 }}>
                {error}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirm(false)}
                disabled={pending}
                style={btnBase}
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                disabled={pending}
                style={{
                  ...btnBase,
                  background: "#16a34a",
                  color: "#fff",
                  opacity: pending ? 0.7 : 1,
                  cursor: pending ? "not-allowed" : "pointer",
                }}
              >
                {pending ? "処理中..." : "復元する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const btnBase: React.CSSProperties = {
  padding: "9px 18px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  background: "#f0f0f2",
  color: "#444",
};
