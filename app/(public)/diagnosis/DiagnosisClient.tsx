"use client";

import { useState } from "react";
import Link from "next/link";

export interface ServiceForDiagnosis {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}

interface Recommendation {
  slug: string;
  name: string;
  reason: string;
}

const QUESTIONS = [
  {
    label: "主に何を楽しみたいですか？",
    options: ["動画・映画", "音楽", "読書・マンガ", "ゲーム", "ビジネス・学習"],
  },
  {
    label: "月にどのくらい使いますか？",
    options: ["500円以下", "500〜1,000円", "1,000〜3,000円", "3,000円以上"],
  },
  {
    label: "主にどのデバイスで使いますか？",
    options: ["スマートフォン", "テレビ", "PC", "複数デバイス"],
  },
  {
    label: "家族や友人とシェアしたいですか？",
    options: ["自分だけ", "家族とシェアしたい", "友人とシェアしたい"],
  },
  {
    label: "重視することは？",
    options: ["コスパ", "コンテンツの豊富さ", "使いやすさ", "独占コンテンツ"],
  },
];

const TOTAL = QUESTIONS.length;

interface Props {
  services: ServiceForDiagnosis[];
}

export default function DiagnosisClient({ services }: Props) {
  const [step, setStep] = useState(0); // 0 〜 TOTAL-1 = 質問, TOTAL = 確認, TOTAL+1 = 結果
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDone = step === TOTAL;
  const isResult = step === TOTAL + 1;

  function selectAnswer(option: string) {
    const newAnswers = [...answers.slice(0, step), option];
    setAnswers(newAnswers);
    if (step < TOTAL - 1) {
      setStep(step + 1);
    } else {
      // 最後の質問 → 確認画面へ
      setStep(TOTAL);
    }
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  function reset() {
    setStep(0);
    setAnswers([]);
    setResults(null);
    setError(null);
    setLoading(false);
  }

  async function diagnose() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: QUESTIONS.map((q, i) => `${q.label} → ${answers[i]}`),
          services,
        }),
      });
      if (!res.ok) throw new Error("APIエラー");
      const data = (await res.json()) as { recommendations: Recommendation[] };
      setResults(data.recommendations.slice(0, 3));
      setStep(TOTAL + 1);
    } catch {
      setError("診断中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  const progressPct = Math.round((Math.min(step, TOTAL) / TOTAL) * 100);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: "60px",
      }}
    >
      {/* ─── 結果画面 ─── */}
      {isResult && results ? (
        <div style={{ width: "100%", maxWidth: "640px" }}>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              marginBottom: "8px",
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            あなたへのおすすめ
          </h2>
          <p style={{ color: "#86868b", textAlign: "center", marginBottom: "32px", fontSize: "0.9rem" }}>
            AIが分析した最適なサブスクサービスです
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {results.map((rec, i) => {
              const isFirst = i === 0;
              return (
                <div
                  key={rec.slug}
                  style={{
                    background: isFirst ? "#111111" : "#ffffff",
                    color: isFirst ? "#ffffff" : "#111111",
                    borderRadius: "20px",
                    padding: isFirst ? "32px" : "24px",
                    boxShadow: isFirst
                      ? "0 8px 32px rgba(0,0,0,0.18)"
                      : "0 4px 24px rgba(0,0,0,0.06)",
                    border: isFirst ? "none" : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "999px",
                        background: isFirst ? "rgba(255,255,255,0.2)" : "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: isFirst ? "1.25rem" : "1.05rem" }}>
                      {rec.name}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      lineHeight: 1.75,
                      color: isFirst ? "rgba(255,255,255,0.85)" : "#555555",
                      marginBottom: "16px",
                    }}
                  >
                    {rec.reason}
                  </p>
                  <Link
                    href={`/service-ranking/${rec.slug}`}
                    style={{
                      display: "inline-block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: isFirst ? "#ffffff" : "#111111",
                      textDecoration: "none",
                      borderBottom: isFirst ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(17,17,17,0.3)",
                      paddingBottom: "1px",
                    }}
                  >
                    詳細を見る →
                  </Link>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button
              onClick={reset}
              style={{
                padding: "12px 32px",
                borderRadius: "999px",
                border: "1px solid #d2d2d7",
                background: "#ffffff",
                color: "#111111",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              もう一度診断する
            </button>
          </div>
        </div>
      ) : (
        /* ─── 質問 / 確認画面 ─── */
        <div style={{ width: "100%", maxWidth: "500px" }}>
          {/* プログレスバー */}
          <div
            style={{
              height: "4px",
              background: "#e5e5ea",
              borderRadius: "999px",
              marginBottom: "32px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: "#111111",
                borderRadius: "999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* カード */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {isDone ? (
              /* 確認画面 */
              <>
                <p style={{ fontSize: "0.8rem", color: "#86868b", marginBottom: "8px" }}>
                  確認
                </p>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "20px", lineHeight: 1.4 }}>
                  以下の内容で診断します
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  {QUESTIONS.map((q, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        background: "#f5f5f7",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span style={{ color: "#86868b", marginRight: "8px" }}>{q.label}</span>
                      <span style={{ fontWeight: 600 }}>{answers[i]}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <p style={{ color: "#ff3b30", fontSize: "0.875rem", marginBottom: "16px" }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={diagnose}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "14px",
                    border: "none",
                    background: loading ? "#666666" : "#111111",
                    color: "#ffffff",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      診断中...
                    </>
                  ) : (
                    "診断する"
                  )}
                </button>
              </>
            ) : (
              /* 質問画面 */
              <>
                <p style={{ fontSize: "0.8rem", color: "#86868b", marginBottom: "8px" }}>
                  {step + 1} / {TOTAL}
                </p>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "24px",
                    lineHeight: 1.5,
                  }}
                >
                  {QUESTIONS[step].label}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {QUESTIONS[step].options.map((opt) => (
                    <OptionButton key={opt} onClick={() => selectAnswer(opt)}>
                      {opt}
                    </OptionButton>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 戻るボタン */}
          {step > 0 && !loading && (
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button
                onClick={goBack}
                style={{
                  background: "none",
                  border: "none",
                  color: "#86868b",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: "8px 16px",
                }}
              >
                ← 戻る
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OptionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "13px 18px",
        borderRadius: "12px",
        border: "1px solid #d2d2d7",
        background: hovered ? "#111111" : "#ffffff",
        color: hovered ? "#ffffff" : "#111111",
        fontSize: "0.95rem",
        fontWeight: 500,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s, color 0.15s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{
        animation: "spin 0.8s linear infinite",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
