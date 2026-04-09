"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import LoginPromptModal from "@/components/LoginPromptModal";
import UpgradeModal from "@/components/UpgradeModal";

interface Props {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  children: React.ReactNode;
}

// localStorage でのいいね管理（未ログイン用）
const LS_KEY = "subscope_liked_articles";

function getLocalLikes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function setLocalLike(articleId: string, liked: boolean) {
  const likes = getLocalLikes();
  if (liked) {
    if (!likes.includes(articleId)) likes.push(articleId);
  } else {
    const idx = likes.indexOf(articleId);
    if (idx !== -1) likes.splice(idx, 1);
  }
  localStorage.setItem(LS_KEY, JSON.stringify(likes));
}

// パーティクルの飛び散り方向（4方向）
const PARTICLES = [
  { tx: "-22px", ty: "-34px" },
  { tx:  "22px", ty: "-34px" },
  { tx: "-32px", ty:  "-8px" },
  { tx:  "32px", ty:  "-8px" },
];


export default function ArticleActions({ articleId, articleTitle, articleUrl, children }: Props) {
  const { user, ready } = useAuth();

  const [likeCount,     setLikeCount]     = useState(0);
  const [liked,         setLiked]         = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [commentCount,  setCommentCount]  = useState(0);
  const [copied,        setCopied]        = useState(false);
  const [likeLoading,   setLikeLoading]   = useState(false);
  const [saveLoading,   setSaveLoading]   = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [userPlan,      setUserPlan]      = useState<string>("free");
  const [loginModal,    setLoginModal]    = useState(false);
  const [upgradeModal,  setUpgradeModal]  = useState<{ plan: string; limit: number } | null>(null);

  useEffect(() => {
    if (!ready) return;

    async function load() {
      const supabase = createClient();

      const { count: lc } = await supabase
        .from("article_likes")
        .select("*", { count: "exact", head: true })
        .eq("article_id", articleId);
      setLikeCount(lc ?? 0);

      const { count: cc } = await supabase
        .from("article_comments")
        .select("*", { count: "exact", head: true })
        .eq("article_id", articleId);
      setCommentCount(cc ?? 0);

      if (user) {
        const [{ data: likeRow }, { data: saveRow }, { data: profileRow }] = await Promise.all([
          supabase.from("article_likes").select("id")
            .eq("article_id", articleId).eq("user_id", user.uid).maybeSingle(),
          supabase.from("article_saves").select("id")
            .eq("article_id", articleId).eq("user_id", user.uid).maybeSingle(),
          supabase.from("users").select("plan").eq("id", user.uid).maybeSingle(),
        ]);
        setLiked(!!likeRow);
        setSaved(!!saveRow);
        setUserPlan(profileRow?.plan ?? "free");
      } else {
        setLiked(getLocalLikes().includes(articleId));
      }
    }

    load();
  }, [ready, user, articleId]);

  function triggerLikeAnimation() {
    setLikeAnimating(true);
    setShowParticles(true);
    setTimeout(() => setLikeAnimating(false), 400);
    setTimeout(() => setShowParticles(false), 700);
  }

  async function handleLike() {
    if (likeLoading) return;
    setLikeLoading(true);

    if (liked) {
      setLiked(false);
      setLikeCount((n) => Math.max(0, n - 1));
      if (user) {
        const supabase = createClient();
        await supabase.from("article_likes").delete()
          .eq("article_id", articleId).eq("user_id", user.uid);
      } else {
        setLocalLike(articleId, false);
      }
    } else {
      triggerLikeAnimation();
      setLiked(true);
      setLikeCount((n) => n + 1);
      if (user) {
        const supabase = createClient();
        await supabase.from("article_likes")
          .insert({ user_id: user.uid, article_id: articleId });
      } else {
        setLocalLike(articleId, true);
      }
    }

    setLikeLoading(false);
  }

  async function handleSave() {
    if (!user) {
      setLoginModal(true);
      return;
    }
    if (saveLoading) return;
    setSaveLoading(true);
    const supabase = createClient();

    if (saved) {
      setSaved(false);
      await supabase.from("article_saves").delete()
        .eq("article_id", articleId).eq("user_id", user.uid);
    } else {
      // サーバーサイドで上限チェック
      const res = await fetch("/api/saves/check");
      if (res.ok) {
        const { canSave, limit, count } = await res.json() as {
          canSave: boolean;
          limit: number | null;
          count: number;
        };
        if (!canSave) {
          setUpgradeModal({ plan: userPlan, limit: limit ?? count });
          setSaveLoading(false);
          return;
        }
      }

      setSaved(true);
      await supabase.from("article_saves")
        .insert({ user_id: user.uid, article_id: articleId, title: articleTitle });
    }
    setSaveLoading(false);
  }

  function handleTwitterShare() {
    const text = encodeURIComponent(`${articleTitle} | SUBSCOPE`);
    const url  = encodeURIComponent(articleUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  }

  // ===== 共通ボタンパーツ =====

  const SaveButton = useCallback(({ size }: { size: "sm" | "base" }) => (
    <button
      onClick={handleSave}
      className="flex items-center gap-1.5 transition-all hover:opacity-70"
      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
               color: saved ? "#111111" : "#9ca3af", padding: 0 }}
      aria-label={saved ? "保存を解除する" : "保存する"}
    >
      <svg width={size === "sm" ? 16 : 20} height={size === "sm" ? 16 : 20}
        viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span className={size === "sm" ? "text-sm" : "text-base"} style={{ fontWeight: 500 }}>
        {saved ? "保存済" : "保存"}
      </span>
    </button>
  ), [saved, saveLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const TwitterButton = ({ size }: { size: "sm" | "base" }) => (
    <button
      onClick={handleTwitterShare}
      className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors"
      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
      aria-label="Xでシェア"
    >
      <svg width={size === "sm" ? 14 : 18} height={size === "sm" ? 14 : 18}
        viewBox="0 0 24 24" fill="currentColor"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.633 5.905-5.633Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span className={size === "sm" ? "text-sm" : "text-base"} style={{ fontWeight: 500 }}>シェア</span>
    </button>
  );

  const CopyButton = ({ size }: { size: "sm" | "base" }) => (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 transition-colors"
      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0,
               color: copied ? "#111111" : "#9ca3af" }}
      aria-label="URLをコピー"
    >
      {copied ? (
        <>
          <svg width={size === "sm" ? 14 : 18} height={size === "sm" ? 14 : 18}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className={size === "sm" ? "text-sm" : "text-base"} style={{ fontWeight: 500 }}>コピー済</span>
        </>
      ) : (
        <>
          <svg width={size === "sm" ? 14 : 18} height={size === "sm" ? 14 : 18}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span className={size === "sm" ? "text-sm" : "text-base"} style={{ fontWeight: 500 }}>コピー</span>
        </>
      )}
    </button>
  );

  return (
    <>
      {/* ログインモーダル */}
      <LoginPromptModal
        isOpen={loginModal}
        onClose={() => setLoginModal(false)}
        message="記事を保存するにはログインが必要です"
        mode="login"
      />

      {/* アップグレードモーダル */}
      <UpgradeModal
        isOpen={!!upgradeModal}
        onClose={() => setUpgradeModal(null)}
        currentPlan={upgradeModal?.plan ?? userPlan}
        limit={upgradeModal?.limit ?? 5}
      />

      {/* ===== 上部アクションバー ===== */}
      <div
        className="flex items-center gap-4 border-b pb-4 mb-6"
        style={{ borderColor: "#e5e5e5" }}
      >
        <SaveButton size="sm" />
        <TwitterButton size="sm" />
        <CopyButton size="sm" />
      </div>

      {/* ===== 記事コンテンツ ===== */}
      {children}

      {/* ===== 下部アクションバー ===== */}
      <div
        className="flex items-center gap-6 border-t pt-8 mb-8"
        style={{ borderColor: "#e5e5e5" }}
      >
        {/* いいね */}
        <button
          onClick={handleLike}
          className="flex items-center gap-2 transition-colors"
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "inherit", padding: 0,
            color: liked ? "#ef4444" : "#9ca3af",
            position: "relative",
          }}
          aria-label={liked ? "いいねを取り消す" : "いいねする"}
        >
          {showParticles && PARTICLES.map((p, i) => (
            <span
              key={i}
              className="like-particle"
              style={{ "--tx": p.tx, "--ty": p.ty } as React.CSSProperties}
            >
              ❤️
            </span>
          ))}
          <span
            className={likeAnimating ? "heart-pop" : ""}
            style={{ display: "flex", alignItems: "center" }}
          >
            <svg
              width="22" height="22" viewBox="0 0 24 24"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
          <span
            className="text-base font-medium"
            style={{
              transition: "transform 0.2s ease",
              transform: likeAnimating ? "translateY(-2px)" : "translateY(0)",
            }}
          >
            {likeCount}
          </span>
        </button>

        {/* 保存 */}
        <SaveButton size="base" />

        {/* コメント数 */}
        <a
          href="#comments"
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors"
          style={{ textDecoration: "none" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-base font-medium">{commentCount}</span>
        </a>

        <div className="flex-1" />
        <TwitterButton size="base" />
        <CopyButton size="base" />
      </div>
    </>
  );
}
