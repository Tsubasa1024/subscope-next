"use client";

import { useState, useTransition } from "react";
import { banUser, unbanUser, deleteUser } from "./actions";

type ActionType = "ban" | "unban" | "delete";

interface Props {
  userId: string;
  isBanned: boolean;
}

interface ModalState {
  open: boolean;
  type: ActionType;
}

export default function UserDetailClient({ userId, isBanned }: Props) {
  const [modal, setModal] = useState<ModalState>({ open: false, type: "ban" });
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openModal(type: ActionType) {
    setReason("");
    setError(null);
    setModal({ open: true, type });
  }

  function closeModal() {
    if (pending) return;
    setModal((m) => ({ ...m, open: false }));
    setReason("");
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    const needsReason = modal.type !== "unban";
    if (needsReason && !reason.trim()) {
      setError("理由を入力してください");
      return;
    }
    startTransition(async () => {
      try {
        if (modal.type === "ban")    await banUser(userId, reason);
        if (modal.type === "unban")  await unbanUser(userId);
        if (modal.type === "delete") await deleteUser(userId, reason);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      }
    });
  }

  const META: Record<ActionType, { label: string; color: string; confirmText: string; needsReason: boolean }> = {
    ban:    { label: "BAN実行",   color: "#dc2626", confirmText: "BANする",     needsReason: true },
    unban:  { label: "BAN解除",   color: "#16a34a", confirmText: "解除する",    needsReason: false },
    delete: { label: "強制退会",  color: "#dc2626", confirmText: "退会させる",  needsReason: true },
  };

  return (
    <>
      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {isBanned ? (
          <button onClick={() => openModal("unban")} style={{ ...btnStyle, background: "#16a34a", color: "#fff" }}>
            BAN解除
          </button>
        ) : (
          <button onClick={() => openModal("ban")} style={{ ...btnStyle, background: "#dc2626", color: "#fff" }}>
            BANする
          </button>
        )}
        <button
          onClick={() => openModal("delete")}
          style={{ ...btnStyle, background: "#fff", color: "#dc2626", border: "1px solid #dc2626" }}
        >
          強制退会
        </button>
      </div>

      {/* Modal */}
      {modal.open && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 16, padding: 32,
              width: "min(480px, 90vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: META[modal.type].color }}>
              {META[modal.type].label}の確認
            </h2>

            {modal.type === "delete" && (
              <p style={{
                fontSize: 13, color: "#dc2626", background: "#fee2e2",
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              }}>
                この操作は取り消せません。アカウントが完全に削除されます。
              </p>
            )}

            {META[modal.type].needsReason && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#1d1d1f" }}>
                  理由 <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={modal.type === "ban" ? "BAN理由を入力..." : "退会理由を入力..."}
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                    border: error ? "1px solid #dc2626" : "1px solid #e5e5e5",
                    resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            {error && (
              <p style={{ fontSize: 13, color: "#dc2626", marginBottom: 12 }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={closeModal}
                disabled={pending}
                style={{ ...btnStyle, background: "#f0f0f2", color: "#444" }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={pending}
                style={{
                  ...btnStyle,
                  background: META[modal.type].color,
                  color: "#fff",
                  opacity: pending ? 0.7 : 1,
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

const btnStyle: React.CSSProperties = {
  padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
  border: "none", cursor: "pointer", fontFamily: "inherit",
};
