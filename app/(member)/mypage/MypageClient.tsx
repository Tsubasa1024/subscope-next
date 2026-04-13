"use client";

import { useState } from "react";
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
  userSubscriptions: UserSubscriptionRow[];
  allServices: ServiceRow[];
}

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  free:     { name: "Free",     price: "¥0" },
  standard: { name: "Standard", price: "¥580" },
  pro:      { name: "Pro",      price: "¥1,480" },
};

const SAVE_LIMITS: Record<string, number | null> = {
  free: 5,
  standard: 15,
  pro: null,
};

type Tab = "profile" | "saves";
type Msg = { type: "success" | "error"; text: string } | null;

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

function canChangeUsername(changedAt: string | null): { ok: boolean; nextDate: Date | null } {
  if (!changedAt) return { ok: true, nextDate: null };
  const last = new Date(changedAt);
  const next = new Date(last);
  next.setMonth(next.getMonth() + 1);
  const ok = new Date() >= next;
  return { ok, nextDate: ok ? null : next };
}

export default function MypageClient({
  userId,
  email,
  name: initialName,
  currentPlan,
  savedArticles,
  username: initialUsername,
  usernameChangedAt,
  userSubscriptions: initialSubs,
  allServices,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab]        = useState<Tab>("profile");
  const [name, setName]                  = useState(initialName);
  const [username, setUsername]          = useState(initialUsername ?? "");
  const [saving, setSaving]              = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [message, setMessage]            = useState<Msg>(null);
  const [usernameMsg, setUsernameMsg]    = useState<Msg>(null);
  const [subs, setSubs]                  = useState<UserSubscriptionRow[]>(initialSubs);
  const [showModal, setShowModal]        = useState(false);

  const { ok: canEditUsername, nextDate: usernameNextDate } = canChangeUsername(usernameChangedAt);

  const palette = ["#111111","#333333","#555555","#777777","#444444","#666666","#888888","#999999"];
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (Math.imul(31, h) + userId.charCodeAt(i)) | 0;
  }
  const avatarColor = palette[Math.abs(h) % palette.length];
  const displayName = name || email.split("@")[0] || "ユーザー";
  const planInfo = PLAN_LABELS[currentPlan];
  const saveLimit = SAVE_LIMITS[currentPlan];
  const saveCount = savedArticles.length;
  const remaining = saveLimit !== null ? saveLimit - saveCount : null;

  // 登録済みサービスIDセット（モーダルで除外用）
  const subscribedIds = new Set(subs.map((s) => s.service_id));
  const availableServices = allServices.filter((s) => !subscribedIds.has(s.id));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "ニックネームを入力してください" });
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "プロフィールを更新しました" });
    }
  }

  async function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameMsg({ type: "error", text: "ユーザーネームを入力してください" });
      return;
    }
    if (!USERNAME_RE.test(trimmed)) {
      setUsernameMsg({ type: "error", text: "英数字・アンダースコアのみ使用できます" });
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 20) {
      setUsernameMsg({ type: "error", text: "3〜20文字で入力してください" });
      return;
    }
    if (!canEditUsername) return;
    setSavingUsername(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ username: trimmed, username_changed_at: new Date().toISOString() })
      .eq("id", userId);
    setSavingUsername(false);
    if (error) {
      const msg = error.code === "23505"
        ? "このユーザーネームは既に使われています"
        : error.message;
      setUsernameMsg({ type: "error", text: msg });
    } else {
      setUsernameMsg({ type: "success", text: "ユーザーネームを更新しました" });
      router.refresh();
    }
  }

  async function handleAddSub(service: ServiceRow) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_subscriptions")
      .insert({ user_id: userId, service_id: service.id, is_active: true })
      .select("id, service_id, services(id, name, slug, logo_url)")
      .single();
    if (!error && data) {
      setSubs((prev) => [...prev, data as unknown as UserSubscriptionRow]);
    }
    setShowModal(false);
  }

  async function handleRemoveSub(subId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_subscriptions")
      .delete()
      .eq("id", subId);
    if (!error) {
      setSubs((prev) => prev.filter((s) => s.id !== subId));
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  const tabStyle = (tab: Tab) => ({
    flex: 1,
    padding: "10px 0",
    background: "none",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid #111111" : "2px solid transparent",
    fontFamily: "inherit",
    fontSize: "0.9rem",
    fontWeight: activeTab === tab ? 700 : 500,
    color: activeTab === tab ? "#111111" : "#86868b",
    cursor: "pointer",
    transition: "color 0.15s, border-color 0.15s",
  } as React.CSSProperties);

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "20px",
    padding: "6px 12px",
    fontSize: "0.8rem",
    fontWeight: 500,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      <main style={{ display: "flex", justifyContent: "center", padding: "40px 16px 60px" }}>
        <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* アバターカード */}
          <div style={{
            background: "#fff", borderRadius: "20px", padding: "32px 24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: avatarColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", fontWeight: 700, color: "#fff",
            }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>{displayName}</p>
              <PlanBadge plan={currentPlan} />
            </div>
            {initialUsername && (
              <p style={{ fontSize: "0.85rem", color: "#86868b" }}>@{initialUsername}</p>
            )}
            <p style={{ fontSize: "0.85rem", color: "#86868b" }}>{email}</p>
          </div>

          {/* タブ */}
          <div style={{
            display: "flex", background: "#fff", borderRadius: "20px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden",
          }}>
            <button style={tabStyle("profile")} onClick={() => setActiveTab("profile")}>
              プロフィール
            </button>
            <button style={tabStyle("saves")} onClick={() => setActiveTab("saves")}>
              保存した記事
            </button>
          </div>

          {/* プロフィールタブ */}
          {activeTab === "profile" && (
            <>
              {/* アカウント情報フォーム */}
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86868b", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
                アカウント情報
              </p>
              <form
                onSubmit={handleSave}
                style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}
              >
                <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "12px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "90px" }}>ニックネーム</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={30}
                    autoComplete="nickname"
                    style={{ flex: 1, fontSize: "0.9rem", border: "none", outline: "none", background: "transparent" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "12px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "90px" }}>メール</span>
                  <span style={{ flex: 1, fontSize: "0.9rem", color: "#86868b" }}>{email}</span>
                </div>

                {message && (
                  <div style={{
                    padding: "12px 20px", fontSize: "0.875rem",
                    color: message.type === "error" ? "#c00" : "#111111",
                    background: "#f5f5f5",
                  }}>
                    {message.text}
                  </div>
                )}

                <div style={{ padding: "16px 20px" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      width: "100%", padding: "15px", borderRadius: "14px", background: "#1d1d1f",
                      color: "#fff", border: "none", fontSize: "0.95rem", fontWeight: 600,
                      cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.45 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {saving ? "保存中..." : "変更を保存"}
                  </button>
                </div>
              </form>

              {/* ユーザーネーム */}
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86868b", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
                ユーザーネーム
              </p>
              <form
                onSubmit={handleSaveUsername}
                style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}
              >
                <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: "0.9rem", color: "#86868b" }}>@</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!canEditUsername}
                    placeholder="username"
                    maxLength={20}
                    autoComplete="username"
                    style={{
                      flex: 1, fontSize: "0.9rem", border: "none", outline: "none",
                      background: "transparent",
                      color: canEditUsername ? "#111" : "#86868b",
                    }}
                  />
                </div>
                {!canEditUsername && usernameNextDate && (
                  <p style={{ padding: "10px 20px", fontSize: "0.8rem", color: "#86868b" }}>
                    次回変更可能日: {usernameNextDate.toLocaleDateString("ja-JP")}
                  </p>
                )}
                {usernameMsg && (
                  <div style={{
                    padding: "12px 20px", fontSize: "0.875rem",
                    color: usernameMsg.type === "error" ? "#c00" : "#111111",
                    background: "#f5f5f5",
                  }}>
                    {usernameMsg.text}
                  </div>
                )}
                <div style={{ padding: "16px 20px" }}>
                  <button
                    type="submit"
                    disabled={savingUsername || !canEditUsername}
                    style={{
                      width: "100%", padding: "15px", borderRadius: "14px", background: "#1d1d1f",
                      color: "#fff", border: "none", fontSize: "0.95rem", fontWeight: 600,
                      cursor: (savingUsername || !canEditUsername) ? "not-allowed" : "pointer",
                      opacity: (savingUsername || !canEditUsername) ? 0.45 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {savingUsername ? "保存中..." : canEditUsername ? "ユーザーネームを保存" : "変更不可（1ヶ月制限）"}
                  </button>
                </div>
              </form>

              {/* 使っているサブスク */}
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86868b", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
                使っているサブスク
              </p>
              <div style={{
                background: "#fff", borderRadius: "20px", padding: "20px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {subs.map((sub) => (
                    <span key={sub.id} style={badgeStyle}>
                      {sub.services?.name ?? "Unknown"}
                      <button
                        onClick={() => handleRemoveSub(sub.id)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: "0 0 0 2px", fontSize: "0.9rem", color: "#86868b",
                          lineHeight: 1, display: "flex", alignItems: "center",
                        }}
                        aria-label="削除"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {availableServices.length > 0 && (
                    <button
                      onClick={() => setShowModal(true)}
                      style={{
                        ...badgeStyle,
                        background: "#f5f5f7", cursor: "pointer",
                        border: "1px dashed #ccc", color: "#111",
                        fontFamily: "inherit",
                      }}
                    >
                      + サブスクを追加
                    </button>
                  )}
                </div>
                {subs.length === 0 && availableServices.length === 0 && (
                  <p style={{ fontSize: "0.85rem", color: "#86868b", textAlign: "center" }}>
                    サブスクがありません
                  </p>
                )}
              </div>

              {/* プランセクション */}
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86868b", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 4px" }}>
                ご利用プラン
              </p>

              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 16px", background: "#fff", borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{planInfo.name} プラン</span>
                <span style={{ fontSize: "0.8rem", color: "#86868b" }}>{planInfo.price} / 月</span>
                <span style={{
                  marginLeft: "auto", padding: "3px 10px", borderRadius: "99px",
                  background: "#111111", fontSize: "0.7rem", fontWeight: 600, color: "#fff",
                }}>
                  現在のプラン
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* Free カード */}
                <div style={{
                  background: "#fff", borderRadius: "16px",
                  border: currentPlan === "free" ? "2px solid #111111" : "1px solid #e5e5e5",
                  padding: "20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "1rem" }}>Free</p>
                      <p style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "2px" }}>¥0<span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#86868b" }}> / 月</span></p>
                    </div>
                    {currentPlan === "free" && (
                      <span style={{ padding: "3px 10px", borderRadius: "99px", background: "#111111", fontSize: "0.7rem", fontWeight: 600, color: "#fff" }}>
                        現在のプラン
                      </span>
                    )}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {["記事 読み放題", "いいね 無制限", "保存 5件まで", "ランキング閲覧"].map((f) => (
                      <li key={f} style={{ fontSize: "0.85rem", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#111", fontWeight: 600 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {currentPlan !== "free" && (
                    <Link href="/pricing" style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: "10px", border: "1.5px solid #111", fontSize: "0.85rem", fontWeight: 600, color: "#111", textDecoration: "none" }}>
                      このプランに変更
                    </Link>
                  )}
                </div>

                {/* Standard カード */}
                <div style={{
                  background: "#fff", borderRadius: "16px",
                  border: currentPlan === "standard" ? "2px solid #111111" : "1px solid #e5e5e5",
                  padding: "20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "1rem" }}>Standard</p>
                      <p style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "2px" }}>¥580<span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#86868b" }}> / 月</span></p>
                    </div>
                    {currentPlan === "standard" && (
                      <span style={{ padding: "3px 10px", borderRadius: "99px", background: "#111111", fontSize: "0.7rem", fontWeight: 600, color: "#fff" }}>
                        現在のプラン
                      </span>
                    )}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {["保存 15件まで", "コメント機能", "広告非表示", "プレミアム記事", "比較機能・AI診断・サブスク家計簿", "Free の全機能"].map((f) => (
                      <li key={f} style={{ fontSize: "0.85rem", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#111", fontWeight: 600 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {currentPlan !== "standard" && (
                    <Link href="/pricing" style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: "10px", border: "1.5px solid #111", fontSize: "0.85rem", fontWeight: 600, color: "#111", textDecoration: "none" }}>
                      このプランに変更
                    </Link>
                  )}
                </div>

                {/* Pro カード */}
                <div style={{
                  background: "#fff", borderRadius: "16px",
                  border: currentPlan === "pro" ? "2px solid #111111" : "1px solid #e5e5e5",
                  padding: "20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "1rem" }}>Pro</p>
                      <p style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "2px" }}>¥1,480<span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#86868b" }}> / 月</span></p>
                    </div>
                    {currentPlan === "pro" && (
                      <span style={{ padding: "3px 10px", borderRadius: "99px", background: "#111111", fontSize: "0.7rem", fontWeight: 600, color: "#fff" }}>
                        現在のプラン
                      </span>
                    )}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {["保存 無制限", "パーソナル通知", "Standard の全機能"].map((f) => (
                      <li key={f} style={{ fontSize: "0.85rem", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#111", fontWeight: 600 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {currentPlan !== "pro" && (
                    <Link href="/pricing" style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: "10px", border: "1.5px solid #111", fontSize: "0.85rem", fontWeight: 600, color: "#111", textDecoration: "none" }}>
                      このプランに変更
                    </Link>
                  )}
                </div>
              </div>

              {/* ログアウト */}
              <button
                onClick={handleLogout}
                style={{
                  width: "100%", padding: "15px", borderRadius: "14px",
                  background: "transparent", color: "#111111",
                  border: "1.5px solid rgba(0,0,0,0.2)", fontSize: "0.95rem",
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                ログアウト
              </button>
            </>
          )}

          {/* 保存した記事タブ */}
          {activeTab === "saves" && (
            <>
              <div style={{ background: "#fff", borderRadius: "20px", padding: "20px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>保存済み記事</span>
                  <span style={{ fontSize: "0.9rem", color: "#86868b" }}>
                    {saveCount}{saveLimit !== null ? `/${saveLimit}` : ""} 件
                  </span>
                </div>
                {saveLimit !== null && remaining !== null && remaining <= 1 && remaining > 0 && (
                  <p style={{ fontSize: "0.82rem", color: "#ff9500", fontWeight: 600, marginTop: "4px" }}>
                    あと {remaining} 件保存できます
                  </p>
                )}
                {saveLimit !== null && remaining !== null && remaining <= 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <p style={{ fontSize: "0.82rem", color: "#ff3b30", fontWeight: 600, marginBottom: "10px" }}>
                      保存上限に達しています
                    </p>
                    <Link href="/pricing" style={{ display: "inline-block", padding: "8px 18px", borderRadius: "99px", background: "#111111", color: "#fff", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none" }}>
                      プランをアップグレード →
                    </Link>
                  </div>
                )}
              </div>

              {savedArticles.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: "20px", padding: "40px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", textAlign: "center", color: "#86868b", fontSize: "0.9rem" }}>
                  まだ保存した記事はありません
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {savedArticles.map((article) => (
                    <Link key={article.article_id} href={`/articles/${article.article_id}`} style={{ textDecoration: "none" }}>
                      <div
                        style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", transition: "opacity 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        {article.image_url && (
                          <img src={article.image_url} alt="" style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {article.title}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "#86868b", marginTop: "4px" }}>
                            {new Date(article.created_at).toLocaleDateString("ja-JP")}
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
        </div>
      </main>

      <footer style={{ padding: "24px", textAlign: "center", fontSize: "0.8rem", color: "#86868b" }}>
        <Link href="/privacy">プライバシーポリシー</Link>
        {" · "}
        <Link href="/terms">利用規約</Link>
      </footer>

      {/* サブスク追加モーダル */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "420px",
              maxHeight: "80vh", overflowY: "auto", padding: "24px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>サブスクを選択</p>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#86868b" }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {availableServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleAddSub(service)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px", borderRadius: "12px",
                    border: "1px solid #e5e5e5", background: "#fff",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    fontSize: "0.9rem", fontWeight: 500,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f7")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  {service.logo_url && (
                    <img src={service.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "contain" }} />
                  )}
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
