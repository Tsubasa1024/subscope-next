"use client";

import { useRef, useState } from "react";
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

export default function MypageClient({
  userId, email, name: initialName, currentPlan,
  savedArticles, username: initialUsername, usernameChangedAt,
  bio: initialBio, avatarUrl: initialAvatarUrl,
  notificationNewArticle: initNotifArticle,
  notificationReviewReply: initNotifReply,
  userSubscriptions: initialSubs, allServices,
}: Props) {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  /* tabs */
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  /* profile */
  const [name,    setName]    = useState(initialName);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [bio,     setBio]     = useState(initialBio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  /* profile loading */
  const [savingName,     setSavingName]     = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingBio,      setSavingBio]      = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /* profile messages */
  const [nameMsg,     setNameMsg]     = useState<Msg>(null);
  const [usernameMsg, setUsernameMsg] = useState<Msg>(null);
  const [bioMsg,      setBioMsg]      = useState<Msg>(null);
  const [avatarMsg,   setAvatarMsg]   = useState<Msg>(null);

  /* subscriptions */
  const [subs,      setSubs]      = useState<UserSubscriptionRow[]>(initialSubs);
  const [showModal, setShowModal] = useState(false);

  /* account settings */
  const [newEmail,    setNewEmail]    = useState("");
  const [emailSent,   setEmailSent]   = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg,    setEmailMsg]    = useState<Msg>(null);

  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSaving,  setPassSaving]  = useState(false);
  const [passMsg,     setPassMsg]     = useState<Msg>(null);

  const [notifArticle, setNotifArticle] = useState(initNotifArticle);
  const [notifReply,   setNotifReply]   = useState(initNotifReply);

  /* delete */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting,        setDeleting]        = useState(false);

  /* derived */
  const { ok: canEditUsername, nextDate: usernameNextDate } = canChangeUsername(usernameChangedAt);
  const palette = ["#111111","#333333","#555555","#777777","#444444","#666666","#888888","#999999"];
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (Math.imul(31, h) + userId.charCodeAt(i)) | 0;
  const avatarColor = palette[Math.abs(h) % palette.length];
  const displayName = name || email.split("@")[0] || "ユーザー";
  const planInfo    = PLAN_LABELS[currentPlan];
  const saveLimit   = SAVE_LIMITS[currentPlan];
  const saveCount   = savedArticles.length;
  const remaining   = saveLimit !== null ? saveLimit - saveCount : null;
  const subscribedIds     = new Set(subs.map((s) => s.service_id));
  const availableServices = allServices.filter((s) => !subscribedIds.has(s.id));

  /* ── handlers ── */
  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setNameMsg({ type: "error", text: "ニックネームを入力してください" }); return; }
    setSavingName(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSavingName(false);
    setNameMsg(error ? { type: "error", text: error.message } : { type: "success", text: "更新しました" });
  }

  async function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || !USERNAME_RE.test(trimmed) || trimmed.length < 3 || trimmed.length > 20) {
      setUsernameMsg({ type: "error", text: "英数字・アンダースコアで3〜20文字にしてください" }); return;
    }
    if (!canEditUsername) return;
    setSavingUsername(true);
    const supabase = createClient();
    const { error } = await supabase.from("users")
      .update({ username: trimmed, username_changed_at: new Date().toISOString() }).eq("id", userId);
    setSavingUsername(false);
    if (error) {
      setUsernameMsg({ type: "error", text: error.code === "23505" ? "このユーザーネームは既に使われています" : error.message });
    } else {
      setUsernameMsg({ type: "success", text: "更新しました" });
      router.refresh();
    }
  }

  async function handleSaveBio(e: React.FormEvent) {
    e.preventDefault();
    if (bio.length > 200) { setBioMsg({ type: "error", text: "200文字以内で入力してください" }); return; }
    setSavingBio(true);
    const supabase = createClient();
    const { error } = await supabase.from("users").update({ bio: bio.trim() || null }).eq("id", userId);
    setSavingBio(false);
    setBioMsg(error ? { type: "error", text: error.message } : { type: "success", text: "更新しました" });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setAvatarMsg({ type: "error", text: "jpg・png・webp のみ対応しています" }); return; }
    if (file.size > 2 * 1024 * 1024) { setAvatarMsg({ type: "error", text: "2MB 以下のファイルを選択してください" }); return; }

    setUploadingAvatar(true);
    setAvatarMsg(null);
    const supabase  = createClient();
    const ext       = file.name.split(".").pop() ?? "jpg";
    const filePath  = `avatars/${userId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { setAvatarMsg({ type: "error", text: uploadError.message }); setUploadingAvatar(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateError } = await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", userId);
    setUploadingAvatar(false);
    if (updateError) { setAvatarMsg({ type: "error", text: updateError.message }); return; }
    setAvatarUrl(publicUrl);
    setAvatarMsg({ type: "success", text: "プロフィール画像を更新しました" });
  }

  async function handleAddSub(service: ServiceRow) {
    const supabase = createClient();
    const { data, error } = await supabase.from("user_subscriptions")
      .insert({ user_id: userId, service_id: service.id, is_active: true })
      .select("id, service_id, services(id, name, slug, logo_url)").single();
    if (!error && data) setSubs((prev) => [...prev, data as unknown as UserSubscriptionRow]);
    setShowModal(false);
  }

  async function handleRemoveSub(subId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("user_subscriptions").delete().eq("id", subId);
    if (!error) setSubs((prev) => prev.filter((s) => s.id !== subId));
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) { setEmailMsg({ type: "error", text: "メールアドレスを入力してください" }); return; }
    setEmailSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setEmailSaving(false);
    if (error) { setEmailMsg({ type: "error", text: error.message }); }
    else { setEmailSent(true); setEmailMsg(null); }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPass.length < 8) { setPassMsg({ type: "error", text: "8文字以上のパスワードを入力してください" }); return; }
    if (newPass !== confirmPass) { setPassMsg({ type: "error", text: "パスワードが一致しません" }); return; }
    setPassSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setPassSaving(false);
    if (error) { setPassMsg({ type: "error", text: error.message }); }
    else { setPassMsg({ type: "success", text: "パスワードを変更しました" }); setNewPass(""); setConfirmPass(""); }
  }

  async function handleToggleNotif(field: "notification_new_article" | "notification_review_reply", value: boolean) {
    const supabase = createClient();
    await supabase.from("users").update({ [field]: value }).eq("id", userId);
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
      alert(json.error ?? "削除に失敗しました");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  /* ── styles ── */
  const tabStyle = (tab: Tab): React.CSSProperties => ({
    flex: 1, padding: "10px 0", background: "none", border: "none",
    borderBottom: activeTab === tab ? "2px solid #111111" : "2px solid transparent",
    fontFamily: "inherit", fontSize: "0.85rem",
    fontWeight: activeTab === tab ? 700 : 500,
    color: activeTab === tab ? "#111111" : "#86868b",
    cursor: "pointer", transition: "color 0.15s, border-color 0.15s",
  });

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "#fff", border: "1px solid #e0e0e0", borderRadius: "20px",
    padding: "6px 12px", fontSize: "0.8rem", fontWeight: 500,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1, fontSize: "0.9rem", border: "none", outline: "none", background: "transparent",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", padding: "16px 20px",
    gap: "12px", borderBottom: "1px solid rgba(0,0,0,0.06)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.85rem", fontWeight: 600, minWidth: "90px",
  };

  const msgStyle = (type: "success" | "error"): React.CSSProperties => ({
    padding: "12px 20px", fontSize: "0.875rem",
    color: type === "error" ? "#ff3b30" : "#34c759",
    background: type === "error" ? "#fff5f5" : "#f0fff4",
  });

  const saveBtn = (loading: boolean): React.CSSProperties => ({
    width: "100%", padding: "14px", borderRadius: "14px", background: loading ? "#999" : "#1d1d1f",
    color: "#fff", border: "none", fontSize: "0.9rem", fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
  });

  /* ═══════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      <main style={{ display: "flex", justifyContent: "center", padding: "40px 16px 60px" }}>
        <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ── アバターカード ── */}
          <Card style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", background: avatarColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2rem", fontWeight: 700, color: "#fff",
                }}>
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              {uploadingAvatar && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "#fff", fontSize: "0.7rem" }}>...</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarChange} />
            <button
              onClick={() => fileRef.current?.click()}
              style={{ fontSize: "0.8rem", color: "#86868b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              画像を変更
            </button>
            {avatarMsg && <p style={{ fontSize: "0.8rem", color: avatarMsg.type === "error" ? "#ff3b30" : "#34c759" }}>{avatarMsg.text}</p>}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>{displayName}</p>
              <PlanBadge plan={currentPlan} />
            </div>
            {initialUsername && <p style={{ fontSize: "0.85rem", color: "#86868b" }}>@{initialUsername}</p>}
            <p style={{ fontSize: "0.85rem", color: "#86868b" }}>{email}</p>
          </Card>

          {/* ── タブ ── */}
          <div style={{ display: "flex", background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <button style={tabStyle("profile")} onClick={() => setActiveTab("profile")}>プロフィール</button>
            <button style={tabStyle("saves")} onClick={() => setActiveTab("saves")}>保存した記事</button>
            <button style={tabStyle("settings")} onClick={() => setActiveTab("settings")}>アカウント設定</button>
          </div>

          {/* ════════ プロフィールタブ ════════ */}
          {activeTab === "profile" && (
            <>
              {/* ── ニックネーム ── */}
              <SectionLabel>アカウント情報</SectionLabel>
              <form onSubmit={handleSaveName}>
                <Card>
                  <div style={rowStyle}>
                    <span style={labelStyle}>ニックネーム</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoComplete="nickname" style={inputStyle} />
                  </div>
                  {nameMsg && <div style={msgStyle(nameMsg.type)}>{nameMsg.text}</div>}
                  <div style={{ padding: "16px 20px" }}>
                    <button type="submit" disabled={savingName} style={saveBtn(savingName)}>
                      {savingName ? "保存中..." : "変更を保存"}
                    </button>
                  </div>
                </Card>
              </form>

              {/* ── ユーザーネーム ── */}
              <SectionLabel>ユーザーネーム</SectionLabel>
              <form onSubmit={handleSaveUsername}>
                <Card>
                  <div style={rowStyle}>
                    <span style={{ fontSize: "0.9rem", color: "#86868b" }}>@</span>
                    <input
                      value={username} onChange={(e) => setUsername(e.target.value)}
                      disabled={!canEditUsername} placeholder="username" maxLength={20}
                      style={{ ...inputStyle, color: canEditUsername ? "#111" : "#86868b" }}
                    />
                  </div>
                  {!canEditUsername && usernameNextDate && (
                    <p style={{ padding: "10px 20px", fontSize: "0.8rem", color: "#86868b" }}>
                      次回変更可能日: {usernameNextDate.toLocaleDateString("ja-JP")}
                    </p>
                  )}
                  {usernameMsg && <div style={msgStyle(usernameMsg.type)}>{usernameMsg.text}</div>}
                  <div style={{ padding: "16px 20px" }}>
                    <button type="submit" disabled={savingUsername || !canEditUsername} style={saveBtn(savingUsername || !canEditUsername)}>
                      {savingUsername ? "保存中..." : canEditUsername ? "ユーザーネームを保存" : "変更不可（1ヶ月制限）"}
                    </button>
                  </div>
                </Card>
              </form>

              {/* ── 自己紹介 ── */}
              <SectionLabel>自己紹介</SectionLabel>
              <form onSubmit={handleSaveBio}>
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
                  {bioMsg && <div style={msgStyle(bioMsg.type)}>{bioMsg.text}</div>}
                  <div style={{ padding: "16px 20px" }}>
                    <button type="submit" disabled={savingBio} style={saveBtn(savingBio)}>
                      {savingBio ? "保存中..." : "自己紹介を保存"}
                    </button>
                  </div>
                </Card>
              </form>

              {/* ── 使っているサブスク ── */}
              <SectionLabel>使っているサブスク</SectionLabel>
              <Card style={{ padding: "20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {subs.map((sub) => (
                    <span key={sub.id} style={badgeStyle}>
                      {sub.services?.name ?? "Unknown"}
                      <button onClick={() => handleRemoveSub(sub.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 0 2px", fontSize: "0.9rem", color: "#86868b", lineHeight: 1 }} aria-label="削除">✕</button>
                    </span>
                  ))}
                  {availableServices.length > 0 && (
                    <button onClick={() => setShowModal(true)} style={{ ...badgeStyle, background: "#f5f5f7", cursor: "pointer", border: "1px dashed #ccc", color: "#111", fontFamily: "inherit" }}>
                      + サブスクを追加
                    </button>
                  )}
                  {subs.length === 0 && availableServices.length === 0 && (
                    <p style={{ fontSize: "0.85rem", color: "#86868b" }}>サブスクがありません</p>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* ════════ 保存した記事タブ ════════ */}
          {activeTab === "saves" && (
            <>
              <Card style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>保存済み記事</span>
                  <span style={{ fontSize: "0.9rem", color: "#86868b" }}>{saveCount}{saveLimit !== null ? `/${saveLimit}` : ""} 件</span>
                </div>
                {saveLimit !== null && remaining !== null && remaining <= 1 && remaining > 0 && (
                  <p style={{ fontSize: "0.82rem", color: "#ff9500", fontWeight: 600, marginTop: "4px" }}>あと {remaining} 件保存できます</p>
                )}
                {saveLimit !== null && remaining !== null && remaining <= 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <p style={{ fontSize: "0.82rem", color: "#ff3b30", fontWeight: 600, marginBottom: "10px" }}>保存上限に達しています</p>
                    <Link href="/pricing" style={{ display: "inline-block", padding: "8px 18px", borderRadius: "99px", background: "#111111", color: "#fff", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none" }}>
                      プランをアップグレード →
                    </Link>
                  </div>
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
                        style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", transition: "opacity 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        {article.image_url && <img src={article.image_url} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{article.title}</p>
                          <p style={{ fontSize: "0.75rem", color: "#86868b", marginTop: "4px" }}>{new Date(article.created_at).toLocaleDateString("ja-JP")}</p>
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
              {/* ── メールアドレス変更 ── */}
              <SectionLabel>メールアドレス</SectionLabel>
              <Card>
                <div style={rowStyle}>
                  <span style={labelStyle}>現在</span>
                  <span style={{ fontSize: "0.9rem", color: "#86868b" }}>{email}</span>
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
                        style={{ width: "100%", fontSize: "0.9rem", border: "none", outline: "none", background: "transparent", boxSizing: "border-box" }}
                      />
                    </div>
                    {emailMsg && <div style={msgStyle(emailMsg.type)}>{emailMsg.text}</div>}
                    <div style={{ padding: "16px 20px" }}>
                      <button type="submit" disabled={emailSaving} style={saveBtn(emailSaving)}>
                        {emailSaving ? "送信中..." : "変更メールを送信"}
                      </button>
                    </div>
                  </form>
                )}
              </Card>

              {/* ── パスワード変更 ── */}
              <SectionLabel>パスワード</SectionLabel>
              <form onSubmit={handlePasswordChange}>
                <Card>
                  <div style={rowStyle}>
                    <span style={labelStyle}>新しいパスワード</span>
                    <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="8文字以上" minLength={8} style={inputStyle} />
                  </div>
                  <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={labelStyle}>確認</span>
                    <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="もう一度入力" style={inputStyle} />
                  </div>
                  {passMsg && <div style={msgStyle(passMsg.type)}>{passMsg.text}</div>}
                  <div style={{ padding: "16px 20px" }}>
                    <button type="submit" disabled={passSaving} style={saveBtn(passSaving)}>
                      {passSaving ? "変更中..." : "パスワードを変更"}
                    </button>
                  </div>
                </Card>
              </form>

              {/* ── 通知設定 ── */}
              <SectionLabel>通知設定</SectionLabel>
              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>新着記事の通知</p>
                    <p style={{ fontSize: "0.78rem", color: "#86868b", marginTop: "2px" }}>新しい記事が公開されたときに通知</p>
                  </div>
                  <Toggle
                    checked={notifArticle}
                    onChange={(v) => { setNotifArticle(v); handleToggleNotif("notification_new_article", v); }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px" }}>
                  <div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>レビューへの返信通知</p>
                    <p style={{ fontSize: "0.78rem", color: "#86868b", marginTop: "2px" }}>あなたのレビューに返信があったときに通知</p>
                  </div>
                  <Toggle
                    checked={notifReply}
                    onChange={(v) => { setNotifReply(v); handleToggleNotif("notification_review_reply", v); }}
                  />
                </div>
              </Card>

              {/* ── プラン ── */}
              <SectionLabel>ご利用プラン</SectionLabel>
              <Card style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <PlanBadge plan={currentPlan} />
                  <span style={{ fontWeight: 700, fontSize: "1rem" }}>{planInfo.name} プラン</span>
                  <span style={{ fontSize: "0.8rem", color: "#86868b" }}>{planInfo.price} / 月</span>
                </div>
                <Link href="/pricing" style={{
                  display: "block", textAlign: "center", padding: "12px",
                  borderRadius: "12px", border: "1.5px solid #111",
                  fontSize: "0.9rem", fontWeight: 600, color: "#111", textDecoration: "none",
                }}>
                  プランを変更する →
                </Link>
              </Card>

              {/* ── 危険ゾーン ── */}
              <SectionLabel>危険ゾーン</SectionLabel>
              <div style={{ background: "#fff5f5", border: "1px solid #ff3b30", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={handleLogout}
                  style={{ width: "100%", padding: "13px", borderRadius: "12px", background: "transparent", color: "#111", border: "1.5px solid rgba(0,0,0,0.2)", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  ログアウト
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ff3b30", fontSize: "0.85rem", fontFamily: "inherit", padding: "4px", textAlign: "center" }}
                >
                  アカウントを削除
                </button>
              </div>
            </>
          )}

        </div>
      </main>

      <footer style={{ padding: "24px", textAlign: "center", fontSize: "0.8rem", color: "#86868b" }}>
        <Link href="/privacy">プライバシーポリシー</Link>{" · "}<Link href="/terms">利用規約</Link>
      </footer>

      {/* ── アカウント削除モーダル ── */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => !deleting && setShowDeleteModal(false)}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "360px", padding: "28px 24px", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "10px" }}>アカウントを削除しますか？</p>
            <p style={{ fontSize: "0.85rem", color: "#86868b", marginBottom: "24px", lineHeight: 1.6 }}>本当にアカウントを削除しますか？この操作は取り消せません。</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={handleDeleteAccount} disabled={deleting} style={{ width: "100%", padding: "13px", borderRadius: "10px", background: deleting ? "#999" : "#ff3b30", color: "#fff", border: "none", fontSize: "0.9rem", fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {deleting ? "削除中..." : "削除する"}
              </button>
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting} style={{ width: "100%", padding: "13px", borderRadius: "10px", background: "#f5f5f7", color: "#111", border: "none", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── サブスク追加モーダル ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "420px", maxHeight: "80vh", overflowY: "auto", padding: "24px", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>サブスクを選択</p>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#86868b" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {availableServices.map((service) => (
                <button key={service.id} onClick={() => handleAddSub(service)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: "0.9rem", fontWeight: 500 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f7")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  {service.logo_url && <img src={service.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "contain" }} />}
                  {service.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
