"use client";

import { useState, useTransition } from "react";
import { deleteContent, rejectReport, banUserFromReport } from "./actions";

type ActionType = "delete" | "reject" | "ban";

interface Props {
  reportId: string;
  status: string;
  contentAuthorId: string | null;
}

const META: Record<
  ActionType,
  {
    label: string;
    confirmText: string;
    color: string;
    placeholder: string;
    description: string;
  }
> = {
  delete: {
    label: "コンテンツを削除",
    confirmText: "削除する",
    color: "#dc2626",
    placeholder: "削除理由を入力...",
    description: "コンテンツをソフトデリートします。投稿者には通知されません。",
  },
  reject: {
    label: "通報を却下",
    confirmText: "却下する",
    color: "#6b7280",
    placeholder: "却下理由を入力...",
    description: "この通報を問題なしとして却下します。",
  },
  ban: {
    label: "投稿者をBAN",
    confirmText: "BANする",
    color: "#7c3aed",
    placeholder: "BAN理由を入力...",
    description: "投稿者のアカウントをBANし、通報を解決済みにします。",
  },
};

export default function ReportDetailClient({
  reportId,
  status,
  contentAuthorId,
}: Props) {
  const [modal, setModal] = useState<{
    open: boolean;
    type: ActionType;
  }>({ open: false, type: "delete" });
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isPending = status === "pending";

  function openModal(type: ActionType) {
    setNote("");
    setError(null);
    setModal({ open: true, type });
  }

  function closeModal() {
    if (pending) return;
    setModal((m) => ({ ...m, open: false }));
    setNote("");
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    if (!note.trim()) {
      setError("対応メモを入力してください");
      return;
    }
    startTransition(async () => {
      try {
        if (modal.type === "delete") await deleteContent(reportId, note);
        if (modal.type === "reject") await rejectReport(reportId, note);
        if (modal.type === "ban") await banUserFromReport(reportId, note);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      }
    });
  }

  if (!isPending) {
    return (
      <p style={{ fontSize: 13, color: "#86868b" }}>
        この通報は既に処理済みです。
      </p>
    );
  }

  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => openModal("delete")}
          style={{ ...btnBase, background: "#dc2626", color: "#fff" }}
        >
          コンテンツを削除
        </button>
        <button
          onClick={() => openModal("reject")}
          style={{ ...btnBase, background: "#f0f0f2", color: "#444" }}
        >
          通報を却下
        </button>
        {contentAuthorId && (
          <button
            onClick={() => openModal("ban")}
            style={{ ...btnBase, background: "#7c3aed", color: "#fff" }}
          >
            投稿者をBAN
          </button>
        )}
      </div>

      {modal.open && (
        <div
          onClick={closeModal}
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
              padding: 32,
              width: "min(480px, 90vw)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
                color: META[modal.type].color,
              }}
            >
              {META[modal.type].label}の確認
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#86868b",
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              {META[modal.type].description}
            </p>

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
                対応メモ <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={META[modal.type].placeholder}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  border: error ? "1px solid #dc2626" : "1px solid #e5e5e5",
                  resize: "vertical",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 12 }}>
                {error}
              </p>
            )}

            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={closeModal}
                disabled={pending}
                style={{ ...btnBase, background: "#f0f0f2", color: "#444" }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={pending}
                style={{
                  ...btnBase,
                  background: META[modal.type].color,
                  color: "#fff",
                  opacity: pending ? 0.7 : 1,
                  cursor: pending ? "not-allowed" : "pointer",
                }}
              >
                {pending ? "処理中..." : META[modal.type].confirmText}
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
};
