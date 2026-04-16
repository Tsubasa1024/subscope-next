"use client";

import Link from "next/link";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: string;
  username: string | null;
  bio: string | null;
  created_at: string;
  profile_public: boolean | null;
  show_subscriptions: boolean | null;
};

export type SubRow = {
  service_id: string;
  plan_id: string | null;
  services: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    categories: { id: number; name: string } | null;
  } | null;
  plans: {
    id: string;
    name: string;
    price: number;
    billing_cycle: string;
  } | null;
};

export type CommentRow = {
  id: string;
  article_id: string;
  content: string;
  created_at: string;
  articleTitle: string | null;
};

interface Props {
  profile: Profile;
  subs: SubRow[];
  recentComments: CommentRow[];
  commentCount: number;
  badges: string[];
  isSelf: boolean;
}

function hashColor(id: string): string {
  const palette = ["#111111","#333333","#555555","#777777","#444444","#666666","#888888","#999999"];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

function joinedText(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月から`;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  return `${Math.floor(days / 30)}ヶ月前`;
}

function monthlyPrice(price: number, billing_cycle: string): string {
  const monthly = billing_cycle === "yearly" ? Math.round(price / 12) : price;
  return `¥${monthly.toLocaleString()}/月`;
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  overflow: "hidden",
};

export default function UserProfileClient({ profile, subs, recentComments, commentCount, badges, isSelf }: Props) {
  const isPublic = profile.profile_public !== false;
  const showSubs = profile.show_subscriptions !== false;
  const displayName = profile.display_name || profile.username || "ユーザー";
  const initial = displayName[0]?.toUpperCase() ?? "?";
  const avatarColor = hashColor(profile.id);

  // カテゴリ別グルーピング（件数の多い順）
  const grouped = subs.reduce<Record<string, SubRow[]>>((acc, sub) => {
    const cat = sub.services?.categories?.name ?? "その他";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sub);
    return acc;
  }, {});
  const sortedCategories = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 16px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ヘッダーカード */}
          <div style={{ ...card, padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            {/* アバター */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: avatarColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", fontWeight: 700, color: "#fff",
              }}>
                {initial}
              </div>
            )}

            {/* 名前 */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: "1.2rem", color: "#111", marginBottom: "4px" }}>
                {displayName}
              </p>
              {profile.username && (
                <p style={{ fontSize: "0.875rem", color: "#86868b" }}>@{profile.username}</p>
              )}
            </div>

            {/* 加入時期 */}
            <p style={{ fontSize: "0.8rem", color: "#86868b" }}>{joinedText(profile.created_at)}</p>

            {/* バッジ */}
            {badges.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
                {badges.map((b) => (
                  <span key={b} style={{
                    border: "1px solid #d2d2d7", borderRadius: "999px",
                    padding: "4px 12px", fontSize: "0.78rem", fontWeight: 500, color: "#555",
                  }}>
                    {b}
                  </span>
                ))}
              </div>
            )}

            {/* bio */}
            {profile.bio && (
              <p style={{
                fontSize: "0.875rem", color: "#374151", lineHeight: 1.7,
                textAlign: "center", maxWidth: "480px", whiteSpace: "pre-wrap",
              }}>
                {profile.bio}
              </p>
            )}

            {/* 本人へのマイページリンク */}
            {isSelf && (
              <Link href="/mypage" style={{
                fontSize: "0.8rem", color: "#86868b",
                textDecoration: "underline", textUnderlineOffset: "2px",
              }}>
                プロフィールを編集
              </Link>
            )}
          </div>

          {/* 非公開の場合はここで終了 */}
          {!isPublic && !isSelf ? (
            <div style={{ ...card, padding: "40px 24px", textAlign: "center", color: "#86868b", fontSize: "0.9rem" }}>
              このプロフィールは非公開です
            </div>
          ) : (
            <>
              {/* 使っているサブスク */}
              <div style={card}>
                <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111" }}>
                    使っているサブスク
                    <span style={{ fontWeight: 400, color: "#86868b", marginLeft: "6px", fontSize: "0.875rem" }}>
                      {subs.length}個
                    </span>
                  </p>
                </div>

                {!showSubs && !isSelf ? (
                  <p style={{ padding: "24px 20px", color: "#86868b", fontSize: "0.875rem" }}>
                    このユーザーはサブスク一覧を非公開にしています
                  </p>
                ) : subs.length === 0 ? (
                  <p style={{ padding: "24px 20px", color: "#86868b", fontSize: "0.875rem" }}>
                    登録中のサブスクはありません
                  </p>
                ) : (
                  <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {sortedCategories.map(([catName, catSubs]) => (
                      <div key={catName}>
                        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#86868b", marginBottom: "10px", letterSpacing: "0.04em" }}>
                          {catName}（{catSubs.length}）
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px" }}>
                          {catSubs.map((sub) => {
                            if (!sub.services) return null;
                            const content = (
                              <div style={{
                                border: "1px solid #e5e5e5", borderRadius: "12px",
                                padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  {sub.services.logo_url && (
                                    <img src={sub.services.logo_url} alt="" style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 4 }} />
                                  )}
                                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {sub.services.name}
                                  </span>
                                </div>
                                {sub.plans && (
                                  <p style={{ fontSize: "0.75rem", color: "#86868b" }}>
                                    {sub.plans.name} · {monthlyPrice(sub.plans.price, sub.plans.billing_cycle)}
                                  </p>
                                )}
                              </div>
                            );
                            return sub.services.slug ? (
                              <Link key={sub.service_id} href={`/service-ranking/${sub.services.slug}`} style={{ textDecoration: "none" }}>
                                {content}
                              </Link>
                            ) : (
                              <div key={sub.service_id}>{content}</div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 最近のコメント */}
              <div style={card}>
                <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111" }}>
                    最近のコメント
                    <span style={{ fontWeight: 400, color: "#86868b", marginLeft: "6px", fontSize: "0.875rem" }}>
                      {commentCount}件
                    </span>
                  </p>
                </div>

                {recentComments.length === 0 ? (
                  <p style={{ padding: "24px 20px", color: "#86868b", fontSize: "0.875rem" }}>
                    まだコメントがありません
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {recentComments.map((c, i) => (
                      <div key={c.id} style={{
                        padding: "16px 20px",
                        borderBottom: i < recentComments.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                      }}>
                        <p style={{
                          fontSize: "0.875rem", color: "#374151", lineHeight: 1.6,
                          display: "-webkit-box", WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                          marginBottom: "8px",
                        }}>
                          {c.content}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {c.articleTitle ? (
                            <Link
                              href={`/articles/${c.article_id}`}
                              style={{ fontSize: "0.78rem", color: "#86868b", textDecoration: "underline", textUnderlineOffset: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}
                            >
                              {c.articleTitle}
                            </Link>
                          ) : (
                            <span style={{ fontSize: "0.78rem", color: "#86868b", flex: 1 }}>記事を読む</span>
                          )}
                          <span style={{ fontSize: "0.75rem", color: "#aaa", flexShrink: 0 }}>
                            {relativeTime(c.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

      <footer style={{ padding: "24px", textAlign: "center", fontSize: "0.8rem", color: "#86868b" }}>
        <Link href="/privacy">プライバシーポリシー</Link>
        {" · "}
        <Link href="/terms">利用規約</Link>
      </footer>
    </div>
  );
}
