"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PlanBadge from "@/components/PlanBadge";
import type { ServiceRow, UserSubscriptionRow } from "./page";

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
  userSubscriptions: UserSubscriptionRow[];
  allServices: ServiceRow[];
}

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  free:     { name: "Free",     price: "¥0" },
  standard: { name: "Standard", price: "¥580" },
  pro:      { name: "Pro",      price: "¥1,480" },
};
const SAVE_LIMITS: Record<string, number | null> = { free: 5, standard: 15, pro: null };
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

type Tab = "profile" | "saves" | "settings";
type Msg = { type: "success" | "error"; text: string } | null;

function canChangeUsername(changedAt: string | null) {
  if (!changedAt) return { ok: true, nextDate: null };
  const next = new Date(changedAt);
  next.setMonth(next.getMonth() + 1);
  return { ok: new Date() >= next, nextDate: new Date() >= next ? null : next };
}

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
      {msg.type === "success" ? "✓ " : "✕ "}{msg.text}
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
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
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
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "#86868b", fontSize: "0.75rem" }}>▼</span>
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
  savedArticles, username: initialUsername, usernameChangedAt,
  bio: initialBio, avatarUrl: initialAvatarUrl,
  notificationNewArticle: initNotifArticle,
  notificationReviewReply: initNotifReply,
  userSubscriptions: initialSubs, allServices,
}: Props) {
  const router  = useRef(useRouter()).current;
  const fileRef = useRef<HTMLInputElement>(null);

  /* tabs */
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  /* avatar */
  const [avatarUrl, setAvatarUrl]       = useState(initialAvatarUrl);
  const [avatarHover, setAvatarHover]   = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  /* bio */
  const [bio, setBio]           = useState(initialBio ?? "");
  const [savingBio, setSavingBio] = useState(false);

  /* toast */
  const [toast, setToast] = useState<Msg>(null);
  const showToast = (msg: Msg) => setToast(msg);

  /* subscriptions */
  const [subs, setSubs]               = useState<UserSubscriptionRow[]>(initialSubs);
  const [showSubPicker, setShowSubPicker] = useState(false);

  /* account settings */
  const [newEmail, setNewEmail]     = useState("");
  const [emailSent, setEmailSent]   = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSaving, setPassSaving]   = useState(false);

  const [notifArticle, setNotifArticle] = useState(initNotifArticle);
  const [notifReply, setNotifReply]     = useState(initNotifReply);

  /* delete */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting]               = useState(false);

  /* derived */
  const { ok: canEditUsername, nextDate: usernameNextDate } = canChangeUsername(usernameChangedAt);
  const palette = ["#111111","#333333","#555555","#777777","#444444","#666666","#888888","#999999"];
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (Math.imul(31, h) + userId.charCodeAt(i)) | 0;
  const avatarColor    = palette[Math.abs(h) % palette.length];
  const displayName    = name || email.split("@")[0] || "ユーザー";
  const planInfo       = PLAN_LABELS[currentPlan];
  const saveLimit      = SAVE_LIMITS[currentPlan];
  const saveCount      = savedArticles.length;
  const remaining      = saveLimit !== null ? saveLimit - saveCount : null;
  const subscribedIds  = new Set(subs.map((s) => s.service_id));
  const availableServices = allServices.filter((s) => !subscribedIds.has(s.id));

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
    if (!trimmed || !USERNAME_RE.test(trimmed) || trimmed.length < 3 || trimmed.length > 20) {
      showToast({ type: "error", text: "英数字・アンダースコアで3〜20文字にしてください" }); return;
    }
    if (!canEditUsername) return;
    setSavingUsername(true);
    const supabase = createClient();
    const { error } = await supabase.from("users")
      .update({ username: trimmed, username_changed_at: new Date().toISOString() }).eq("id", userId);
    setSavingUsername(false);
    if (error) {
      showToast({ type: "error", text: error.code === "23505" ? "このユーザーネームは既に使われています" : error.message });
    } else {
      setUsername(trimmed); setEditingUsername(false);
      showToast({ type: "success", text: "ユーザーネームを更新しました" });
      router.refresh();
    }
  }

  async function handleSaveBio() {
    if (bio.length > 200) { showToast({ type: "error", text: "200文字以内で入力してください" }); return; }
    setSavingBio(true);
    const supabase = createClient();
    const { error } = await supabase.from("users").update({ bio: bio.trim() || null }).eq("id", userId);
    setSavingBio(false);
    if (error) { showToast({ type: "error", text: error.message }); }
    else { showToast({ type: "success", text: "自己紹介を更新しました" }); }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { showToast({ type: "error", text: "jpg・png・webp のみ対応しています" }); return; }
    if (file.size > 2 * 1024 * 1024) { showToast({ type: "error", text: "2MB 以下のファイルを選択してください" }); return; }
    setUploadingAvatar(true);
    const supabase  = createClient();
    const ext       = file.name.split(".").pop() ?? "jpg";
    const filePath  = `avatars/${userId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { showToast({ type: "error", text: uploadError.message }); setUploadingAvatar(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateError } = await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", userId);
    setUploadingAvatar(false);
    if (updateError) { showToast({ type: "error", text: updateError.message }); return; }
    setAvatarUrl(publicUrl);
    showToast({ type: "success", text: "プロフィール画像を更新しました" });
  }

  async function handleAddSub(service: ServiceRow) {
    const supabase = createClient();
    const { data, error } = await supabase.from("user_subscriptions")
      .insert({ user_id: userId, service_id: service.id, is_active: true })
      .select("id, service_id, services(id, name, slug, logo_url)").single();
    if (!error && data) {
      setSubs((prev) => [...prev, data as unknown as UserSubscriptionRow]);
      showToast({ type: "success", text: `${service.name} を追加しました` });
    }
    setShowSubPicker(false);
  }

  async function handleRemoveSub(subId: string, subName: string) {
    const supabase = createClient();
    const { error } = await supabase.from("user_subscriptions").delete().eq("id", subId);
    if (!error) {
      setSubs((prev) => prev.filter((s) => s.id !== subId));
      showToast({ type: "success", text: `${subName} を削除しました` });
    }
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

      <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>

        {/* ── Sticky tab bar ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(245,245,247,0.92)", backdropFilter: "blur(12px)",
          padding: "8px 16px 8px",
          boxShadow: "0 1px 0 rgba(0,0,0,0.07)",
        }}>
          <div style={{ display: "flex", maxWidth: 480, margin: "0 auto", gap: 4 }}>
            {(["profile", "saves", "settings"] as Tab[]).map((tab) => {
              const labels: Record<Tab, string> = {
                profile: "👤 プロフィール",
                saves: "🔖 保存した記事",
                settings: "⚙️ 設定",
              };
              const active = activeTab === tab;
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
                    minHeight: 44,
                  }}
                >
                  {labels[tab]}
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
                  {uploadingAvatar ? <Spinner /> : avatarHover ? <span style={{ fontSize: "1.6rem" }}>📷</span> : null}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarChange} />

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <p style={{ fontWeight: 700, fontSize: "1.15rem" }}>{displayName}</p>
                <PlanBadge plan={currentPlan} />
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
                          {savingName ? <Spinner /> : "✓"}
                        </button>
                        <button onClick={() => { setEditingName(false); setEditName(name); }} style={iconBtn("#86868b")}>
                          ✗
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, fontSize: "0.9rem" }}>{name || "未設定"}</span>
                        <button onClick={() => { setEditingName(true); setEditName(name); }} style={iconBtn()}>✏️</button>
                      </>
                    )}
                  </div>

                  {/* ユーザーネーム */}
                  <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: 90, flexShrink: 0 }}>ユーザー名</span>
                    {editingUsername ? (
                      <>
                        <span style={{ fontSize: "0.9rem", color: "#86868b", flexShrink: 0 }}>@</span>
                        <input
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          maxLength={20}
                          autoFocus
                          disabled={!canEditUsername}
                          style={{ ...inlineInput, color: canEditUsername ? "#111" : "#86868b" }}
                        />
                        <button onClick={handleSaveUsername} disabled={savingUsername || !canEditUsername} style={iconBtn("#34c759")}>
                          {savingUsername ? <Spinner /> : "✓"}
                        </button>
                        <button onClick={() => { setEditingUsername(false); setEditUsername(username); }} style={iconBtn()}>
                          ✗
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1, fontSize: "0.9rem", color: username ? "#111" : "#86868b" }}>
                          {username ? `@${username}` : "未設定"}
                        </span>
                        <button onClick={() => { setEditingUsername(true); setEditUsername(username); }} style={iconBtn()}>✏️</button>
                      </>
                    )}
                  </div>
                  {!canEditUsername && usernameNextDate && (
                    <p style={{ padding: "4px 20px 14px", fontSize: "0.78rem", color: "#86868b" }}>
                      次回変更可能日: {usernameNextDate.toLocaleDateString("ja-JP")}
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

                {/* 使っているサブスク */}
                <SectionLabel>使っているサブスク</SectionLabel>
                <Card style={{ padding: "20px" }}>
                  {subs.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                      {subs.map((sub) => (
                        <span key={sub.id} style={{
                          display: "inline-flex", alignItems: "center", gap: "8px",
                          background: "#f5f5f7", border: "1px solid #e0e0e0", borderRadius: "16px",
                          padding: "8px 14px", fontSize: "0.85rem", fontWeight: 500,
                        }}>
                          {sub.services?.logo_url && (
                            <img src={sub.services.logo_url} alt="" style={{ width: 22, height: 22, borderRadius: 6, objectFit: "contain" }} />
                          )}
                          {sub.services?.name ?? "Unknown"}
                          <button
                            onClick={() => handleRemoveSub(sub.id, sub.services?.name ?? "")}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 0 2px", fontSize: "0.85rem", color: "#86868b", lineHeight: 1 }}
                            aria-label="削除"
                          >✕</button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Inline service picker */}
                  {showSubPicker ? (
                    <div style={{ animation: "fadeIn 0.2s ease" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                        {availableServices.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => handleAddSub(service)}
                            style={{
                              display: "flex", alignItems: "center", gap: "12px",
                              padding: "12px 14px", borderRadius: "12px",
                              border: "1px solid #e5e5e5", background: "#fff",
                              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                              fontSize: "0.9rem", fontWeight: 500, minHeight: 44,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f7"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                          >
                            {service.logo_url && (
                              <img src={service.logo_url} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "contain" }} />
                            )}
                            {service.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowSubPicker(false)}
                        style={{ fontSize: "0.85rem", color: "#86868b", background: "none", border: "none", cursor: "pointer" }}
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    availableServices.length > 0 ? (
                      <button
                        onClick={() => setShowSubPicker(true)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          padding: "10px 18px", borderRadius: "12px",
                          border: "1.5px dashed #bbb", background: "#f9f9f9",
                          cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
                          color: "#111", fontFamily: "inherit", minHeight: 44,
                        }}
                      >
                        + サブスクを追加
                      </button>
                    ) : subs.length === 0 ? (
                      <p style={{ fontSize: "0.85rem", color: "#86868b" }}>登録できるサブスクがありません</p>
                    ) : null
                  )}
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
                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                          <p style={{ fontSize: "0.82rem", color: "#ff3b30", fontWeight: 600 }}>保存上限に達しています</p>
                          <Link href="/pricing" style={{ padding: "6px 14px", borderRadius: 99, background: "#111", color: "#fff", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>
                            アップグレード →
                          </Link>
                        </div>
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
                      <Link key={article.article_id} href={`/articles/${article.article_id}`} style={{ textDecoration: "none" }}>
                        <div
                          style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", transition: "opacity 0.15s" }}
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
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ════════ アカウント設定タブ ════════ */}
            {activeTab === "settings" && (
              <>
                {/* メールアドレス */}
                <CollapsibleSection title="📧 メールアドレス変更">
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
                </CollapsibleSection>

                {/* パスワード */}
                <CollapsibleSection title="🔑 パスワード変更">
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
                </CollapsibleSection>

                {/* 通知設定 */}
                <CollapsibleSection title="🔔 通知設定" defaultOpen>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", minHeight: 44 }}>
                    <div>
                      <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>新着記事の通知</p>
                      <p style={{ fontSize: "0.78rem", color: "#86868b", marginTop: "2px" }}>新しい記事が公開されたときに通知</p>
                    </div>
                    <Toggle checked={notifArticle} onChange={(v) => { setNotifArticle(v); handleToggleNotif("notification_new_article", v); }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", minHeight: 44 }}>
                    <div>
                      <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>レビュー返信の通知</p>
                      <p style={{ fontSize: "0.78rem", color: "#86868b", marginTop: "2px" }}>あなたのレビューにコメントがついたときに通知</p>
                    </div>
                    <Toggle checked={notifReply} onChange={(v) => { setNotifReply(v); handleToggleNotif("notification_review_reply", v); }} />
                  </div>
                </CollapsibleSection>

                {/* プラン */}
                <CollapsibleSection title="💳 ご利用プラン">
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <PlanBadge plan={currentPlan} />
                      <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{planInfo.name} プラン</span>
                      <span style={{ fontSize: "0.85rem", color: "#86868b" }}>{planInfo.price} / 月</span>
                    </div>
                    {currentPlan === "free" && (
                      <div style={{
                        background: "#f0f7ff", borderRadius: 12, padding: "12px 14px",
                        marginBottom: "14px", fontSize: "0.85rem", color: "#1d6fa4", lineHeight: 1.6,
                      }}>
                        📦 Standardにアップグレードすると保存上限15件・レビュー投稿が使えます
                      </div>
                    )}
                    <Link href="/pricing" style={{
                      display: "block", textAlign: "center", padding: "13px",
                      borderRadius: "12px", background: "#111111",
                      fontSize: "0.9rem", fontWeight: 600, color: "#fff", textDecoration: "none",
                    }}>
                      プランを変更する →
                    </Link>
                  </div>
                </CollapsibleSection>

                {/* 危険ゾーン */}
                <CollapsibleSection title="⚠️ アカウント操作">
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%", padding: "13px", borderRadius: "12px",
                        background: "transparent", color: "#111",
                        border: "1.5px solid rgba(0,0,0,0.15)",
                        fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit", minHeight: 44,
                      }}
                    >
                      ログアウト
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#ff3b30", fontSize: "0.82rem",
                        fontFamily: "inherit", padding: "4px", textAlign: "center",
                      }}
                    >
                      アカウントを削除する
                    </button>
                  </div>
                </CollapsibleSection>
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
    </>
  );
}
