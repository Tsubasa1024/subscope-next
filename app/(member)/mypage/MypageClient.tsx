"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PlanBadge from "@/components/PlanBadge";
import AvatarCropModal from "@/components/AvatarCropModal";
import { SAVE_LIMITS, PHASE1_SAVE_LIMIT } from "@/lib/constants";
import { FEATURES } from "@/lib/features";
import { validateUsername, USERNAME_MIN, USERNAME_MAX } from "@/lib/profile-validation";

interface SavedArticle {
  user_id: string;
  article_id: string;
  title: string;
  image_url: string | null;
  created_at: string;
}

interface Props {
  userId: string;
  email: string;
  name: string;
  currentPlan: "free" | "standard" | "pro";
  savedArticles: SavedArticle[];
  username: string | null;
  usernameChangedAt: string | null;
  bio: string | null;
  avatarUrl: string | null;
  notificationNewArticle: boolean;
  notificationReviewReply: boolean;
  profilePublic: boolean;
  isBanned?: boolean;
}

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  free:     { name: "Free",     price: "¥0" },
  standard: { name: "Standard", price: "¥580" },
  pro:      { name: "Pro",      price: "¥1,480" },
};
type Tab = "profile" | "saves" | "settings";
type Msg = { type: "success" | "error"; text: string } | null;

// canChangeUsername ロジックは lib/profile-validation.ts 側でコメントアウト済み。
// 将来悪用が確認された場合は同ファイルのコメントを復活させること。

/* ─── Toast ─── */
function Toast({ msg, onDone }: { msg: Msg; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: msg.type === "error" ? "#ff3b30" : "#1d1d1f",
      color: "#fff", padding: "12px 24px", borderRadius: 99,
      fontSize: "0.875rem", fontWeight: 600, zIndex: 9999,
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)", whiteSpace: "nowrap",
    }}>
      {msg.text}
    </div>
  );
}

/* ─── Toggle Switch ─── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
        background: checked ? "#111111" : "#d1d1d6",
        position: "relative", flexShrink: 0, transition: "background 0.2s",
        minHeight: 44, minWidth: 44,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 21 : 3,
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

/* ─── Section Label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86868b", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
      {children}
    </p>
  );
}

/* ─── Card ─── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

/* ─── Collapsible Section ─── */
function CollapsibleSection({ title, children, defaultOpen = false }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", background: "none", border: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 600, color: "#111",
          minHeight: 44,
        }}
      >
        {title}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div style={{
        maxHeight: open ? "1000px" : "0",
        overflow: "hidden",
        transition: "max-height 0.3s ease",
        borderTop: open ? "1px solid rgba(0,0,0,0.06)" : "none",
      }}>
        {children}
      </div>
    </Card>
  );
}

/* ─── Spinner ─── */
function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14,
      border: "2px solid rgba(255,255,255,0.35)",
      borderTop: "2px solid #fff", borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
    }} />
  );
}

export default function MypageClient({
  userId, email, name: initialName, currentPlan,
  savedArticles: initialSavedArticles, username: initialUsername, usernameChangedAt,
  bio: initialBio, avatarUrl: initialAvatarUrl,
  notificationNewArticle: initNotifArticle,
  notificationReviewReply: initNotifReply,
  profilePublic: initProfilePublic,
  isBanned = false,
}: Props) {
  // DEBUG: Props受け取り時ログ（ブラウザコンソール）
  console.log("[MypageClient] props受け取り:", {
    initialUsername,
    initialBio,
    userId,
    email,
  });

  const router  = useRef(useRouter()).current;
  const fileRef = useRef<HTMLInputElement>(null);

  /* tabs */
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  /* avatar */
  const [avatarUrl, setAvatarUrl]         = useState(initialAvatarUrl);
  const [avatarHover, setAvatarHover]     = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropSrc, setCropSrc]             = useState<string | null>(null);

  /* name inline edit */
  const [name, setName]             = useState(initialName);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName]     = useState(initialName);
  const [savingName, setSavingName] = useState(false);

  /* username inline edit */
  const [username, setUsername]             = useState(initialUsername ?? "");
  const [editingUsername, setEditingUsername] = useState(false);
  const [editUsername, setEditUsername]     = useState(initialUsername ?? "");
  const [savingUsername, setSavingUsername] = useState(false);
  type CheckStatus = "idle" | "checking" | "ok" | "error";
  const [usernameCheck, setUsernameCheck]   = useState<{ status: CheckStatus; error?: string }>({ status: "idle" });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync username state when server sends fresh props (e.g. after router.refresh()
  // completes, or when the component remounts from a cached RSC payload that was
  // stale at tab-switch time). Guard against overwriting an in-progress edit.
  useEffect(() => {
    // DEBUG: initialUsername prop が変わったときのログ
    console.log("[MypageClient] useEffect[initialUsername]発火:", {
      initialUsername,
      editingUsername,
    });
    if (!editingUsername) {
      setUsername(initialUsername ?? "");
      setEditUsername(initialUsername ?? "");
    }
  }, [initialUsername]); // eslint-disable-line react-hooks/exhaustive-deps

  /* bio */
  const [bio, setBio]           = useState(initialBio ?? "");
  const [savingBio, setSavingBio] = useState(false);

  /* toast */
  const [toast, setToast] = useState<Msg>(null);
  const showToast = (msg: Msg) => setToast(msg);

  /* saved articles */
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>(initialSavedArticles);
  const [unsaving, setUnsaving]           = useState<string | null>(null);

  /* account settings */
  const [newEmail, setNewEmail]     = useState("");
  const [emailSent, setEmailSent]   = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSaving, setPassSaving]   = useState(false);

  const [notifArticle, setNotifArticle]       = useState(initNotifArticle);
  const [notifReply, setNotifReply]           = useState(initNotifReply);
  const [profilePublic, setProfilePublic]     = useState(initProfilePublic);

  /* delete */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting]               = useState(false);

  /* debounce: username リアルタイム重複チェック */
  const checkUsername = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();

    // 空 or 変更なし
    if (!trimmed || trimmed === username) {
      setUsernameCheck({ status: "idle" });
      return;
    }

    // フロントバリデーション
    const localResult = validateUsername(trimmed);
    if (!localResult.ok) {
      setUsernameCheck({ status: "error", error: localResult.error });
      return;
    }

    setUsernameCheck({ status: "checking" });
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(trimmed)}&excludeId=${userId}`
        );
        const json = await res.json() as { available: boolean; error?: string };
        if (json.available) {
          setUsernameCheck({ status: "ok" });
        } else {
          setUsernameCheck({ status: "error", error: json.error ?? "使用できません" });
        }
      } catch {
        setUsernameCheck({ status: "idle" });
      }
    }, 400);
  }, [username, userId]); // eslint-disable-line react-hooks/exhaustive-deps
  const palette = ["#111111","#333333","#555555","#777777","#444444","#666666","#888888","#999999"];
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (Math.imul(31, h) + userId.charCodeAt(i)) | 0;
  const avatarColor    = palette[Math.abs(h) % palette.length];
  const displayName    = name || email.split("@")[0] || "ユーザー";
  const planInfo       = PLAN_LABELS[currentPlan];
  const saveLimit      = FEATURES.tieredSaves ? (SAVE_LIMITS[currentPlan] ?? PHASE1_SAVE_LIMIT) : PHASE1_SAVE_LIMIT;
  const saveCount      = savedArticles.length;
  const remaining      = saveLimit !== null ? saveLimit - saveCount : null;

  /* ── handlers ── */
  async function handleSaveName() {
    if (!editName.trim()) { showToast({ type: "error", text: "ニックネームを入力してください" }); return; }
    setSavingName(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: editName.trim() } });
    setSavingName(false);
    if (error) { showToast({ type: "error", text: error.message }); }
    else { setName(editName.trim()); setEditingName(false); showToast({ type: "success", text: "ニックネームを更新しました" }); }
  }

  async function handleSaveUsername() {
    const trimmed = editUsername.trim();

    // フロント側バリデーション
    const localResult = validateUsername(trimmed);
    if (!localResult.ok) {
      showToast({ type: "error", text: localResult.error }); return;
    }
    if (usernameCheck.status === "error") {
      showToast({ type: "error", text: usernameCheck.error ?? "使用できません" }); return;
    }

    setSavingUsername(true);
    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: trimmed }),
    });
    const json = await res.json() as { ok?: boolean; error?: string; nextChangeAt?: string };
    setSavingUsername(false);

    if (!res.ok) {
      showToast({ type: "error", text: json.error ?? "更新に失敗しました" });
    } else {
      setUsername(trimmed);
      setEditingUsername(false);
      setUsernameCheck({ status: "idle" });
      showToast({ type: "success", text: "ユーザー名を更新しました" });
      router.refresh();
    }
  }

  async function handleSaveBio() {
    if (bio.length > 200) { showToast({ type: "error", text: "200文字以内で入力してください" }); return; }
    setSavingBio(true);
    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    const json = await res.json() as { ok?: boolean; error?: string };
    setSavingBio(false);
    if (!res.ok) { showToast({ type: "error", text: json.error ?? "更新に失敗しました" }); }
    else { showToast({ type: "success", text: "自己紹介を更新しました" }); }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected after cancel
    e.target.value = "";
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { showToast({ type: "error", text: "jpg・png・webp のみ対応しています" }); return; }
    if (file.size > 2 * 1024 * 1024) { showToast({ type: "error", text: "2MB 以下のファイルを選択してください" }); return; }
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
  }

  async function handleCropConfirm(blob: Blob) {
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("avatar", blob, "avatar.jpg");
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) { showToast({ type: "error", text: json.error ?? "アップロードに失敗しました" }); return; }
      setAvatarUrl(json.avatarUrl);
      setCropSrc(null);
      showToast({ type: "success", text: "プロフィール画像を更新しました" });
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) { showToast({ type: "error", text: "メールアドレスを入力してください" }); return; }
    setEmailSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setEmailSaving(false);
    if (error) { showToast({ type: "error", text: error.message }); }
    else { setEmailSent(true); }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPass.length < 8) { showToast({ type: "error", text: "8文字以上のパスワードを入力してください" }); return; }
    if (newPass !== confirmPass) { showToast({ type: "error", text: "パスワードが一致しません" }); return; }
    setPassSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setPassSaving(false);
    if (error) { showToast({ type: "error", text: error.message }); }
    else { showToast({ type: "success", text: "パスワードを変更しました" }); setNewPass(""); setConfirmPass(""); }
  }

  async function handleToggleNotif(field: "notification_new_article" | "notification_review_reply", value: boolean) {
    const supabase = createClient();
    await supabase.from("users").update({ [field]: value }).eq("id", userId);
    showToast({ type: "success", text: "通知設定を更新しました" });
  }

  async function handleUnsave(articleId: string) {
    if (unsaving) return;
    setUnsaving(articleId);
    const prev = savedArticles;
    setSavedArticles((a) => a.filter((x) => x.article_id !== articleId));
    const supabase = createClient();
    const { error } = await supabase
      .from("article_saves")
      .delete()
      .eq("user_id", userId)
      .eq("article_id", articleId);
    if (error) {
      setSavedArticles(prev);
      showToast({ type: "error", text: "保存解除に失敗しました" });
    }
    setUnsaving(null);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const res = await fetch("/api/delete-account", { method: "DELETE" });
    if (res.ok) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/");
    } else {
      const json = await res.json();
      showToast({ type: "error", text: json.error ?? "削除に失敗しました" });
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  /* ── shared styles ── */
  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", padding: "16px 20px",
    gap: "12px", borderBottom: "1px solid rgba(0,0,0,0.06)", minHeight: 44,
  };

  const inlineInput: React.CSSProperties = {
    flex: 1, fontSize: "0.9rem", border: "none",
    borderBottom: "2px solid #111111", outline: "none",
    background: "transparent", padding: "4px 0",
  };

  const iconBtn = (color = "#86868b"): React.CSSProperties => ({
    background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem",
    color, minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center",
  });

  const primaryBtn = (loading: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "13px 20px", borderRadius: "12px",
    background: loading ? "#999" : "#1d1d1f", color: "#fff",
    border: "none", fontSize: "0.9rem", fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", minHeight: 44,
  });

  const underlineInput: React.CSSProperties = {
    width: "100%", fontSize: "0.9rem", border: "none",
    borderBottom: "2px solid #e0e0e0", outline: "none",
    background: "transparent", padding: "4px 0", boxSizing: "border-box",
  };

  /* ═══════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Toast msg={toast} onDone={() => setToast(null)} />

      <div style={{ minHeight: "100vh", background: "#f5f5f7", paddingTop: "var(--header-h)" }}>
        {isBanned && (
          <div style={{
            background: "#fee2e2", color: "#dc2626", padding: "10px 20px",
            fontSize: 13, fontWeight: 500, textAlign: "center",
          }}>
            アカウントが停止されています。レビューや評価などの投稿操作は行えません。
          </div>
        )}

        {/* ── Sticky tab bar ── */}
        <div style={{
          position: "sticky", top: "var(--header-h)", zIndex: 100,
          background: "rgba(245,245,247,0.92)", backdropFilter: "blur(12px)",
          padding: "8px 16px 8px",
          boxShadow: "0 1px 0 rgba(0,0,0,0.07)",
        }}>
          <div style={{ display: "flex", maxWidth: 480, margin: "0 auto", gap: 4 }}>
            {(["profile", "saves", "settings"] as Tab[]).map((tab) => {
              const active = activeTab === tab;
              const tabIcons: Record<Tab, React.ReactNode> = {
                profile: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                ),
                saves: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 3h14a1 1 0 0 1 1 1v17l-7-3-7 3V4a1 1 0 0 1 1-1z"/>
                  </svg>
                ),
                settings: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                ),
              };
              const tabLabels: Record<Tab, string> = {
                profile: "プロフィール",
                saves: "保存した記事",
                settings: "設定",
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: "9px 4px", borderRadius: 12, border: "none",
                    background: active ? "#111111" : "transparent",
                    color: active ? "#fff" : "#86868b",
                    fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "background 0.2s, color 0.2s",
                    minHeight: 44, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 4,
                  }}
                >
                  {tabIcons[tab]}
                  {tabLabels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        <main style={{ display: "flex", justifyContent: "center", padding: "20px 16px 80px" }}>
          <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* ── アバターカード ── */}
            <Card style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => !uploadingAvatar && fileRef.current?.click()}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{
                    width: 96, height: 96, borderRadius: "50%", background: avatarColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2.4rem", fontWeight: 700, color: "#fff",
                  }}>
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
                {/* camera overlay */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: (avatarHover || uploadingAvatar) ? "rgba(0,0,0,0.45)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}>
                  {uploadingAvatar ? <Spinner /> : avatarHover ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                  ) : null}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarChange} />

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <p style={{ fontWeight: 700, fontSize: "1.15rem" }}>{displayName}</p>
                {FEATURES.subscription && <PlanBadge plan={currentPlan} />}
              </div>
              {username && <p style={{ fontSize: "0.85rem", color: "#86868b" }}>@{username}</p>}
              <p style={{ fontSize: "0.85rem", color: "#86868b" }}>{email}</p>
            </Card>

            {/* ════════ プロフィールタブ ════════ */}
            {activeTab === "profile" && (
              <>
                <SectionLabel>アカウント情報</SectionLabel>
                <Card>
                  {/* ニックネーム */}
                  <div style={rowStyle}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: 90, flexShrink: 0 }}>ニックネーム</span>
                    {editingName ? (
                      <>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          maxLength={30}
                          autoFocus
                          autoComplete="nickname"
                          style={inlineInput}
                        />
                        <button onClick={handleSaveName} disabled={savingName} style={iconBtn("#34c759")}>
                          {savingName ? <Spinner /> : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                        <button onClick={() => { setEditingName(false); setEditName(name); }} style={iconBtn()}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, fontSize: "0.9rem" }}>{name || "未設定"}</span>
                        <button onClick={() => { setEditingName(true); setEditName(name); }} style={iconBtn()}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* ユーザーネーム */}
                  <div style={{ ...rowStyle, borderBottom: "none", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: 90, flexShrink: 0 }}>ユーザー名</span>
                    {editingUsername ? (
                      <>
                        <span style={{ fontSize: "0.9rem", color: "#86868b", flexShrink: 0 }}>@</span>
                        <input
                          value={editUsername}
                          onChange={(e) => {
                            setEditUsername(e.target.value);
                            checkUsername(e.target.value);
                          }}
                          maxLength={USERNAME_MAX}
                          autoFocus
                          placeholder={`${USERNAME_MIN}〜${USERNAME_MAX}文字、英数字・_・-`}
                          style={{ ...inlineInput, color: "#111" }}
                        />
                        {/* check status icon */}
                        {usernameCheck.status === "checking" && (
                          <span style={{ fontSize: "0.75rem", color: "#86868b" }}>確認中...</span>
                        )}
                        {usernameCheck.status === "ok" && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                        <button
                          onClick={handleSaveUsername}
                          disabled={savingUsername || usernameCheck.status === "error" || usernameCheck.status === "checking"}
                          style={iconBtn(savingUsername || usernameCheck.status !== "ok" ? "#86868b" : "#34c759")}
                        >
                          {savingUsername ? <Spinner /> : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                        <button onClick={() => { setEditingUsername(false); setEditUsername(username); setUsernameCheck({ status: "idle" }); }} style={iconBtn()}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, fontSize: "0.9rem", color: username ? "#111" : "#86868b" }}>
                          {username ? `@${username}` : "未設定"}
                        </span>
                        <button onClick={() => { setEditingUsername(true); setEditUsername(username); setUsernameCheck({ status: "idle" }); }} style={iconBtn()}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  {/* check error message */}
                  {editingUsername && usernameCheck.status === "error" && (
                    <p style={{ padding: "2px 20px 8px", fontSize: "0.78rem", color: "#ff3b30" }}>
                      {usernameCheck.error}
                    </p>
                  )}

                </Card>

                {/* 自己紹介 */}
                <SectionLabel>自己紹介</SectionLabel>
                <Card>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="自己紹介を入力（200文字以内）"
                      maxLength={200}
                      rows={4}
                      style={{
                        width: "100%", fontSize: "0.9rem", border: "none", outline: "none",
                        background: "transparent", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                      }}
                    />
                    <p style={{ fontSize: "0.75rem", color: bio.length > 180 ? "#ff9500" : "#86868b", textAlign: "right" }}>
                      {bio.length} / 200
                    </p>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <button onClick={handleSaveBio} disabled={savingBio} style={primaryBtn(savingBio)}>
                      {savingBio ? <><Spinner /> 保存中...</> : "自己紹介を保存"}
                    </button>
                  </div>
                </Card>

              </>
            )}

            {/* ════════ 保存した記事タブ ════════ */}
            {activeTab === "saves" && (
              <>
                {/* 上限プログレスバー */}
                <Card style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>保存済み記事</span>
                    <span style={{ fontSize: "0.85rem", color: "#86868b" }}>
                      {saveCount}{saveLimit !== null ? ` / ${saveLimit} 件` : " 件"}
                    </span>
                  </div>
                  {saveLimit !== null && (
                    <>
                      <div style={{ height: 6, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${Math.min((saveCount / saveLimit) * 100, 100)}%`,
                          background: remaining !== null && remaining <= 0
                            ? "#ff3b30"
                            : remaining !== null && remaining <= 1
                            ? "#ff9500"
                            : "#111111",
                          borderRadius: 99, transition: "width 0.4s ease",
                        }} />
                      </div>
                      {remaining !== null && remaining <= 1 && remaining > 0 && (
                        <p style={{ fontSize: "0.82rem", color: "#ff9500", fontWeight: 600, marginTop: "8px" }}>
                          あと {remaining} 件保存できます
                        </p>
                      )}
                      {remaining !== null && remaining <= 0 && (
                        <p style={{ fontSize: "0.82rem", color: "#ff3b30", fontWeight: 600, marginTop: "10px" }}>
                          保存上限に達しました
                        </p>
                      )}
                    </>
                  )}
                </Card>

                {savedArticles.length === 0 ? (
                  <Card style={{ padding: "40px 24px", textAlign: "center", color: "#86868b", fontSize: "0.9rem" }}>
                    まだ保存した記事はありません
                  </Card>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {savedArticles.map((article) => (
                      <div key={article.article_id} style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex", alignItems: "center" }}>
                        <Link href={`/articles/${article.article_id}`} style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
                          <div
                            style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", transition: "opacity 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.75"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                          >
                            {article.image_url && (
                              <img src={article.image_url} alt="" style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {article.title}
                              </p>
                              <p style={{ fontSize: "0.75rem", color: "#86868b", marginTop: "4px" }}>
                                {new Date(article.created_at).toLocaleDateString("ja-JP")} 保存
                              </p>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        </Link>
                        <button
                          onClick={() => handleUnsave(article.article_id)}
                          disabled={unsaving === article.article_id}
                          style={{
                            flexShrink: 0, padding: "14px 16px", background: "none", border: "none",
                            borderLeft: "1px solid rgba(0,0,0,0.06)", cursor: "pointer",
                            color: "#ff3b30", fontSize: "0.78rem", fontWeight: 600,
                            fontFamily: "inherit", opacity: unsaving === article.article_id ? 0.4 : 1,
                          }}
                          aria-label="保存解除"
                        >
                          解除
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 今後のアップデート予定 */}
                <SectionLabel>今後のアップデート予定</SectionLabel>
                <Card style={{ padding: "20px 24px" }}>
                  <p style={{ fontSize: "0.8rem", color: "#86868b", marginBottom: "14px", lineHeight: 1.6 }}>
                    以下の機能を順次リリース予定です。お楽しみに。
                  </p>
                  {[
                    { label: "コメント機能",       desc: "記事へのコメント・意見交換" },
                    { label: "AI診断機能",         desc: "あなたに合ったサブスクを診断" },
                    { label: "保存数アップ（無制限）", desc: "記事をもっとたくさん保存" },
                    { label: "その他予定機能",     desc: "新機能を続々追加予定" },
                  ].map(({ label, desc }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 0",
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1d1d1f" }}>{label}</p>
                        <p style={{ fontSize: "0.75rem", color: "#86868b", marginTop: "2px" }}>{desc}</p>
                      </div>
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px",
                        borderRadius: 99, background: "#f0f0f0", color: "#86868b",
                        flexShrink: 0, marginLeft: "12px",
                      }}>
                        準備中
                      </span>
                    </div>
                  ))}
                </Card>
              </>
            )}

            {/* ════════ アカウント設定タブ ════════ */}
            {activeTab === "settings" && (
              <>
                {/* メールアドレス */}
                <SectionLabel>メールアドレス変更</SectionLabel>
                <Card>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontSize: "0.85rem", color: "#86868b" }}>
                    現在: {email}
                  </div>
                  {emailSent ? (
                    <div style={{ padding: "16px 20px", fontSize: "0.875rem", color: "#34c759" }}>
                      確認メールを送信しました。受信箱をご確認ください。
                    </div>
                  ) : (
                    <form onSubmit={handleEmailChange}>
                      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <input
                          type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="新しいメールアドレス"
                          style={underlineInput}
                          onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#111"; }}
                          onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#e0e0e0"; }}
                        />
                      </div>
                      <div style={{ padding: "16px 20px" }}>
                        <button type="submit" disabled={emailSaving} style={primaryBtn(emailSaving)}>
                          {emailSaving ? <><Spinner /> 送信中...</> : "変更メールを送信"}
                        </button>
                      </div>
                    </form>
                  )}
                </Card>

                {/* パスワード */}
                <SectionLabel>パスワード変更</SectionLabel>
                <Card>
                  <form onSubmit={handlePasswordChange}>
                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <input
                        type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
                        placeholder="新しいパスワード（8文字以上）" minLength={8}
                        style={underlineInput}
                        onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#111"; }}
                        onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#e0e0e0"; }}
                      />
                      <input
                        type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="確認（もう一度入力）"
                        style={underlineInput}
                        onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#111"; }}
                        onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#e0e0e0"; }}
                      />
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                      <button type="submit" disabled={passSaving} style={primaryBtn(passSaving)}>
                        {passSaving ? <><Spinner /> 変更中...</> : "パスワードを変更"}
                      </button>
                    </div>
                  </form>
                </Card>

                {/* 通知設定 */}
                <SectionLabel>通知設定</SectionLabel>
                <Card>
                  <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={notifArticle}
                        onChange={async (e) => {
                          setNotifArticle(e.target.checked);
                          const supabase = createClient();
                          await supabase.from("users").update({ notification_new_article: e.target.checked }).eq("id", userId);
                        }}
                        style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#111111" }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>新着記事の通知</p>
                        <p style={{ fontSize: "0.8rem", color: "#86868b" }}>新しい記事が公開されたときに通知メールを受け取る</p>
                      </div>
                    </label>
                  </div>
                  <div style={{ padding: "18px 20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={notifReply}
                        onChange={async (e) => {
                          setNotifReply(e.target.checked);
                          const supabase = createClient();
                          await supabase.from("users").update({ notification_review_reply: e.target.checked }).eq("id", userId);
                        }}
                        style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#111111" }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>レビュー返信の通知</p>
                        <p style={{ fontSize: "0.8rem", color: "#86868b" }}>あなたのレビューにコメントがついたときに通知メールを受け取る</p>
                      </div>
                    </label>
                  </div>
                </Card>

                {/* プロフィール公開設定 */}
                <SectionLabel>プロフィール公開設定</SectionLabel>
                <Card>
                  <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={profilePublic}
                        onChange={async (e) => {
                          setProfilePublic(e.target.checked);
                          const supabase = createClient();
                          await supabase.from("users").update({ profile_public: e.target.checked }).eq("id", userId);
                        }}
                        style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#111111" }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>プロフィールを公開する</p>
                        <p style={{ fontSize: "0.8rem", color: "#86868b" }}>オフにするとプロフィールページが非公開になります</p>
                      </div>
                    </label>
                  </div>
                </Card>

                {/* アカウント操作 */}
                <SectionLabel>アカウント操作</SectionLabel>
                <Card>
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%", padding: "13px", borderRadius: "12px",
                        background: "transparent", color: "#111",
                        border: "1.5px solid rgba(0,0,0,0.15)",
                        fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit", minHeight: 44,
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      ログアウト
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#ff3b30", fontSize: "0.82rem",
                        fontFamily: "inherit", padding: "4px", textAlign: "center",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                      アカウントを削除する
                    </button>
                  </div>
                </Card>
              </>
            )}

          </div>
        </main>

        <footer style={{ padding: "24px", textAlign: "center", fontSize: "0.8rem", color: "#86868b" }}>
          <Link href="/privacy">プライバシーポリシー</Link>{" · "}<Link href="/terms">利用規約</Link>
        </footer>
      </div>

      {/* ── アカウント削除モーダル ── */}
      {showDeleteModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "360px", padding: "28px 24px", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "10px" }}>アカウントを削除しますか？</p>
            <p style={{ fontSize: "0.85rem", color: "#86868b", marginBottom: "24px", lineHeight: 1.6 }}>
              この操作は取り消せません。すべてのデータが失われます。
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  width: "100%", padding: "13px", borderRadius: "10px",
                  background: deleting ? "#999" : "#ff3b30", color: "#fff",
                  border: "none", fontSize: "0.9rem", fontWeight: 600,
                  cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
                  minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {deleting ? <><Spinner /> 削除中...</> : "削除する"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{ width: "100%", padding: "13px", borderRadius: "10px", background: "#f5f5f7", color: "#111", border: "none", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", minHeight: 44 }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar crop modal */}
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          loading={uploadingAvatar}
        />
      )}
    </>
  );
}
