"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  userName: string;
}

interface Props {
  articleId: string;
}

export default function ArticleComments({ articleId }: Props) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [comments,   setComments]   = useState<Comment[]>([]);
  const [input,      setInput]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [userPlan,   setUserPlan]   = useState<string>("free");

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  async function loadComments() {
    setLoading(true);
    const supabase = createClient();

    // ユーザープラン取得
    if (user) {
      const { data: profile } = await supabase
        .from("users").select("plan").eq("id", user.uid).maybeSingle();
      setUserPlan(profile?.plan ?? "free");
    }

    const { data } = await supabase
      .from("article_comments")
      .select("id, user_id, content, created_at, users(display_name)")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true })
      .limit(50);

    setComments(
      (data ?? []).map((c) => ({
        id:        c.id,
        userId:    c.user_id,
        content:   c.content,
        createdAt: c.created_at,
        userName:  (c.users as unknown as { display_name: string | null } | null)?.display_name ?? "ユーザー",
      }))
    );
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    const content = input.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("article_comments")
      .insert({ user_id: user.uid, article_id: articleId, content })
      .select("id, user_id, content, created_at")
      .single();

    if (err) {
      setError("投稿に失敗しました。もう一度お試しください。");
    } else if (data) {
      setComments((prev) => [
        ...prev,
        {
          id:        data.id,
          userId:    data.user_id,
          content:   data.content,
          createdAt: data.created_at,
          userName:  user.name,
        },
      ]);
      setInput("");
    }
    setSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    const supabase = createClient();
    await supabase.from("article_comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  // アバターカラー（uid ベース、モノトーン）
  function avatarBg(uid: string) {
    const shades = ["#111111", "#333333", "#555555", "#777777", "#444444", "#666666", "#888888", "#999999"];
    let h = 0;
    for (let i = 0; i < uid.length; i++) {
      h = (Math.imul(31, h) + uid.charCodeAt(i)) | 0;
    }
    return shades[Math.abs(h) % shades.length];
  }

  return (
    <section id="comments" className="mt-14 pt-8" style={{ borderTop: "1px solid #e5e5e5" }}>
      <h2 className="font-bold mb-6" style={{ fontSize: "20px" }}>
        コメント{comments.length > 0 && <span className="text-gray-400 font-normal text-base ml-2">({comments.length})</span>}
      </h2>

      {/* コメント一覧 */}
      {loading ? (
        <div className="space-y-5 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 mb-8">まだコメントはありません。最初のコメントを書いてみましょう。</p>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* アバター */}
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ background: avatarBg(comment.userId) }}
              >
                {comment.userName[0]?.toUpperCase()}
              </div>

              {/* 本文 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: "#111111" }}>{comment.userName}</span>
                  <span className="text-xs text-gray-400">{comment.createdAt.slice(0, 10)}</span>
                  {user?.uid === comment.userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-gray-300 hover:text-gray-500 transition-colors ml-auto"
                      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      削除
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 投稿フォーム */}
      {ready && (
        user ? (
          userPlan === "free" ? (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: "#f5f5f5", border: "1px solid #e5e5e5" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "#111" }}>
                コメントはStandard以上のプランで利用できます
              </p>
              <p className="text-xs mb-4" style={{ color: "#86868b" }}>
                アップグレードしてコメント・全機能をお楽しみください
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 transition"
                style={{ textDecoration: "none" }}
              >
                プランをアップグレード →
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ background: avatarBg(user.uid) }}
              >
                {user.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="コメントを書く..."
                  rows={3}
                  className="w-full text-sm outline-none resize-none"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(0,0,0,0.1)",
                    background: "#fafafa",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
                />
                {error && (
                  <p className="text-xs text-gray-500 mt-1">{error}</p>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!input.trim() || submitting}
                    className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity"
                    style={{
                      background: "#111111",
                      fontFamily: "inherit",
                      border: "none",
                      cursor: !input.trim() || submitting ? "not-allowed" : "pointer",
                      opacity: !input.trim() || submitting ? 0.4 : 1,
                    }}
                  >
                    {submitting ? "投稿中..." : "投稿する"}
                  </button>
                </div>
              </div>
            </div>
          </form>
          )
        ) : (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: "#f5f5f5", border: "1px solid #e5e5e5" }}
          >
            <p className="text-sm text-gray-500 mb-3">コメントするにはログインが必要です</p>
            <a
              href="/login"
              className="inline-flex items-center bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800 transition"
              style={{ textDecoration: "none" }}
            >
              ログインする
            </a>
          </div>
        )
      )}
    </section>
  );
}
