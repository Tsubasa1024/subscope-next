"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ServiceReviewModal from "@/components/ServiceReviewModal";

export interface ServiceWithStats {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  category: string | null;
  avgScore: number;
  reviewCount: number;
}

export interface ServiceNoReview {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  category: string | null;
}

interface Props {
  rankedServices: ServiceWithStats[];
  unreviewedServices: ServiceNoReview[];
  userId: string | null;
}

function clearbitUrl(logoUrl: string): string {
  try {
    const withProtocol = logoUrl.startsWith("http") ? logoUrl : `https://${logoUrl}`;
    const { hostname } = new URL(withProtocol);
    return `https://logo.clearbit.com/${hostname}`;
  } catch {
    return `https://logo.clearbit.com/${logoUrl}`;
  }
}

const RANK_STYLES = [
  { bg: "#111111", text: "#FFFFFF", accent: "#FFD700", emptyStarColor: "rgba(255,255,255,0.2)" },
  { bg: "#333333", text: "#FFFFFF", accent: "#C0C0C0", emptyStarColor: "rgba(255,255,255,0.2)" },
  { bg: "#555555", text: "#FFFFFF", accent: "#CD7F32", emptyStarColor: "rgba(255,255,255,0.2)" },
];

const STAR_PATH =
  "M 8,1 L 9.646,5.735 L 14.658,5.837 L 10.663,8.865 L 12.115,13.663 L 8,10.8 L 3.885,13.663 L 5.337,8.865 L 1.342,5.837 L 6.354,5.735 Z";

function StarDisplay({
  score,
  uid,
  fullColor = "#111111",
  emptyColor = "#e0e0e0",
  textColor = "#666666",
}: {
  score: number;
  uid: string;
  fullColor?: string;
  emptyColor?: string;
  textColor?: string;
}) {
  const starValue = score / 2;
  const types = Array.from({ length: 5 }, (_, i) => {
    const filled = starValue - i;
    if (filled >= 1) return "full";
    if (filled >= 0.5) return "half";
    return "empty";
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {types.map((type, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16">
          {type === "half" && (
            <defs>
              <linearGradient id={`hg-${uid}-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor={fullColor} />
                <stop offset="50%" stopColor={emptyColor} />
              </linearGradient>
            </defs>
          )}
          <path
            d={STAR_PATH}
            fill={
              type === "full"
                ? fullColor
                : type === "half"
                ? `url(#hg-${uid}-${i})`
                : emptyColor
            }
          />
        </svg>
      ))}
      <span style={{ fontSize: "12px", color: textColor, marginLeft: "4px" }}>
        {score.toFixed(1)}
        <span style={{ opacity: 0.6 }}>/10</span>
      </span>
    </div>
  );
}

function LogoCell({
  name,
  logo_url,
  size = 40,
}: {
  name: string;
  logo_url: string | null;
  size?: number;
}) {
  return (
    <div
      className="flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-sm text-white"
      style={{
        width: size,
        height: size,
        borderRadius: "12px",
        background: logo_url ? "#f5f5f7" : "#333333",
        flexShrink: 0,
      }}
    >
      {logo_url ? (
        <Image
          src={clearbitUrl(logo_url)}
          alt={name}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          unoptimized={false}
        />
      ) : (
        name[0]
      )}
    </div>
  );
}

export default function ServiceRankingClient({
  rankedServices,
  unreviewedServices,
  userId,
}: Props) {
  const router = useRouter();
  const [modalService, setModalService] = useState<{ id: string; name: string } | null>(null);

  function handleReviewClick(e: React.MouseEvent, service: { id: string; name: string }) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      router.push("/login");
      return;
    }
    setModalService(service);
  }

  function handleReviewSubmit() {
    router.refresh();
  }

  const totalReviews = rankedServices.reduce((sum, s) => sum + s.reviewCount, 0);

  return (
    <>
      {/* ── ページヘッダー ── */}
      <section style={{ textAlign: "center", paddingBottom: "48px" }}>
        <div style={{ fontSize: "3.2rem", marginBottom: "8px", lineHeight: 1 }}>🏆</div>
        <h1
          style={{
            fontSize: "2.4rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#111111",
            marginTop: "8px",
          }}
        >
          サブスクランキング
        </h1>
        <p style={{ color: "#555555", marginTop: "10px", fontSize: "1rem", lineHeight: 1.7 }}>
          ユーザーが選んだ本当に使えるサブスクNo.1は？
        </p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "18px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "#111111",
              color: "#FFD700",
              padding: "6px 18px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            📝 総レビュー数 {totalReviews}件
          </span>
          <span
            style={{
              background: "#f5f5f7",
              color: "#111111",
              padding: "6px 18px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 700,
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            🏅 {rankedServices.length}サービスがランク入り
          </span>
        </div>
      </section>

      {/* ── Section 1: ランキング（レビューあり） ── */}
      <section>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#1d1d1f",
            marginBottom: "16px",
          }}
        >
          ランキング
        </h2>

        {rankedServices.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 24px",
              textAlign: "center",
              borderRadius: "20px",
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📊</div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1d1d1f", marginBottom: "4px" }}>
              まだレビューがありません
            </p>
            <p style={{ fontSize: "0.8rem", color: "#86868b", maxWidth: "280px", lineHeight: 1.7 }}>
              下のサービス一覧から最初のレビューを投稿してランキングを育てましょう。
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {rankedServices.map((svc, i) => {
              const isTop3 = i < 3;
              const rankStyle = isTop3 ? RANK_STYLES[i] : null;
              const cardBg = isTop3 ? rankStyle!.bg : "#ffffff";
              const textColor = isTop3 ? "#ffffff" : "#111111";
              const accentColor = isTop3 ? rankStyle!.accent : "#111111";
              const subTextColor = isTop3 ? "rgba(255,255,255,0.65)" : "#86868b";
              const categoryBadgeBg = isTop3 ? "rgba(255,255,255,0.15)" : "#f0f0f0";
              const categoryBadgeColor = isTop3 ? "#ffffff" : "#666666";
              const borderStyle = isTop3 ? "none" : "1px solid rgba(0,0,0,0.08)";
              const boxShadow = isTop3
                ? "0 6px 24px rgba(0,0,0,0.25)"
                : "0 2px 12px rgba(0,0,0,0.06)";

              return (
                <Link
                  key={svc.id}
                  href={`/service-ranking/${svc.slug}`}
                  className="hover:[transform:translateY(-2px)]"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    background: cardBg,
                    border: borderStyle,
                    borderRadius: "20px",
                    padding: "16px 20px",
                    textDecoration: "none",
                    boxShadow,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  {/* ランク番号 */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "44px",
                      textAlign: "center",
                      fontSize: i === 0 ? "2rem" : "1.4rem",
                      fontWeight: 800,
                      color: accentColor,
                      lineHeight: 1,
                    }}
                  >
                    {i === 0 ? "👑" : i + 1}
                  </div>

                  {/* ロゴ */}
                  <LogoCell name={svc.name} logo_url={svc.logo_url} size={64} />

                  {/* 情報 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: textColor }}>
                        {svc.name}
                      </span>
                      {svc.category && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "2px 10px",
                            borderRadius: "20px",
                            background: categoryBadgeBg,
                            color: categoryBadgeColor,
                            fontWeight: 600,
                          }}
                        >
                          {svc.category}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <StarDisplay
                        score={svc.avgScore}
                        uid={svc.id}
                        fullColor={accentColor}
                        emptyColor={isTop3 ? rankStyle!.emptyStarColor : "#e0e0e0"}
                        textColor={isTop3 ? "rgba(255,255,255,0.9)" : "#666666"}
                      />
                      <span style={{ fontSize: "0.75rem", color: subTextColor }}>
                        ({svc.reviewCount}件)
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleReviewClick(e, { id: svc.id, name: svc.name })}
                      style={{
                        marginTop: "8px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: "20px",
                        border: isTop3
                          ? `1px solid ${accentColor}`
                          : "1px solid rgba(0,0,0,0.15)",
                        background: isTop3 ? "rgba(255,255,255,0.12)" : "#ffffff",
                        color: isTop3 ? accentColor : "#111111",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      レビューを書く ✏️
                    </button>
                  </div>

                  {/* 詳細を見る */}
                  <div style={{ flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: subTextColor,
                        whiteSpace: "nowrap",
                      }}
                    >
                      詳細を見る →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {rankedServices.length > 0 && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              marginTop: "16px",
              color: "#86868b",
            }}
          >
            ※ 平均スコア順。レビュー数が多いほど信頼度が高まります。
          </p>
        )}
      </section>

      {/* ── Section 2: レビューなし ── */}
      {unreviewedServices.length > 0 && (
        <section style={{ marginTop: "48px" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#1d1d1f",
              marginBottom: "6px",
            }}
          >
            あなたが最初のレビュアーになろう！
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#86868b", marginBottom: "16px" }}>
            まだレビューがないサービスです。あなたのレビューがランキングを作ります。
          </p>
          <div
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {unreviewedServices.map((svc, i) => (
              <Link
                key={svc.id}
                href={`/service-ranking/${svc.slug}`}
                className="hover:bg-gray-50"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom:
                    i < unreviewedServices.length - 1
                      ? "1px solid rgba(0,0,0,0.05)"
                      : "none",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                  cursor: "pointer",
                }}
              >
                <LogoCell name={svc.name} logo_url={svc.logo_url} size={48} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1d1d1f" }}
                    >
                      {svc.name}
                    </span>
                    {svc.category && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          background: "#f0f0f0",
                          color: "#666666",
                        }}
                      >
                        {svc.category}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", marginTop: "2px", color: "#86868b" }}>
                    まだレビューなし
                  </p>
                </div>

                <button
                  onClick={(e) => handleReviewClick(e, { id: svc.id, name: svc.name })}
                  style={{
                    flexShrink: 0,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: "linear-gradient(135deg, #111111 0%, #333333 100%)",
                    color: "#ffffff",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  レビューを書く 🖊️
                </button>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* モーダル */}
      {modalService && userId && (
        <ServiceReviewModal
          isOpen={!!modalService}
          onClose={() => setModalService(null)}
          service={modalService}
          userId={userId}
          onSubmit={handleReviewSubmit}
        />
      )}
    </>
  );
}
