"use client";

import { useState } from "react";
import Link from "next/link";

export interface ServiceForDiagnosis {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}

interface Answer {
  question: string;
  answer: string;
}

interface Recommendation {
  slug: string;
  name: string;
  reason: string;
}

interface Question {
  label: string;
  options: string[];
}

// ─── 質問データ ───────────────────────────────────────────────────────────────

const GENRE_Q: Question = {
  label: "どのジャンルのサブスクを探していますか？",
  options: [
    "動画・映画",
    "音楽",
    "読書・マンガ",
    "ビジネス・学習",
    "ゲーム",
    "健康・フィットネス",
    "ショッピング",
  ],
};

const BRANCH_QUESTIONS: Record<string, [Question, Question, Question]> = {
  "動画・映画": [
    {
      label: "よく見るコンテンツは？",
      options: ["映画・ドラマ", "アニメ", "バラエティ・ドキュメンタリー", "海外ドラマ", "こだわらない"],
    },
    {
      label: "誰と見ますか？",
      options: ["一人", "家族と", "こだわらない"],
    },
    {
      label: "重視することは？",
      options: ["独占コンテンツの多さ", "日本作品の多さ", "画質・音質", "コスパ", "こだわらない"],
    },
  ],
  "音楽": [
    {
      label: "よく聴くジャンルは？",
      options: ["J-POP", "洋楽", "アニソン", "クラシック", "こだわらない"],
    },
    {
      label: "どんな使い方をしますか？",
      options: ["通勤・通学中", "作業BGM", "ライブ・フェス情報も欲しい", "こだわらない"],
    },
    {
      label: "重視することは？",
      options: ["曲数の多さ", "音質", "ポッドキャストも聴きたい", "コスパ", "こだわらない"],
    },
  ],
  "読書・マンガ": [
    {
      label: "主に何を読みますか？",
      options: ["ビジネス書", "小説", "マンガ", "雑誌", "こだわらない"],
    },
    {
      label: "読む頻度は？",
      options: ["毎日", "週数回", "週末だけ", "こだわらない"],
    },
    {
      label: "重視することは？",
      options: ["冊数の多さ", "新刊の早さ", "コスパ", "オフライン読書", "こだわらない"],
    },
  ],
  "ビジネス・学習": [
    {
      label: "何を学びたいですか？",
      options: ["プログラミング", "デザイン", "語学", "ビジネススキル", "こだわらない"],
    },
    {
      label: "学び方の好みは？",
      options: ["動画で学ぶ", "本・テキストで学ぶ", "両方", "こだわらない"],
    },
    {
      label: "重視することは？",
      options: ["講座の質", "資格取得サポート", "コスパ", "こだわらない"],
    },
  ],
  "ゲーム": [
    {
      label: "どんなゲームが好きですか？",
      options: ["RPG・アドベンチャー", "スポーツ", "アクション", "インディーゲーム", "こだわらない"],
    },
    {
      label: "どのハードで遊びますか？",
      options: ["PlayStation", "Nintendo Switch", "PC", "こだわらない"],
    },
    {
      label: "重視することは？",
      options: ["遊び放題タイトル数", "オンライン対戦", "新作の早さ", "コスパ", "こだわらない"],
    },
  ],
  "健康・フィットネス": [
    {
      label: "どんな運動が好きですか？",
      options: ["筋トレ", "ヨガ・ストレッチ", "有酸素運動", "こだわらない"],
    },
    {
      label: "どこで運動しますか？",
      options: ["自宅", "ジム", "こだわらない"],
    },
    {
      label: "重視することは？",
      options: ["動画の種類の多さ", "トレーナーの質", "コスパ", "こだわらない"],
    },
  ],
  "ショッピング": [
    {
      label: "主に何を買いますか？",
      options: ["日用品・食料品", "ファッション", "家電・ガジェット", "こだわらない"],
    },
    {
      label: "重視することは？",
      options: ["送料無料", "ポイント還元", "配送の速さ", "こだわらない"],
    },
    {
      label: "追加特典は欲しいですか？",
      options: ["動画も見たい", "音楽も聴きたい", "特典不要", "こだわらない"],
    },
  ],
};

const FINAL_Q: Question = {
  label: "コスパとクオリティ、どちらを重視しますか？",
  options: ["コスパ重視", "クオリティ重視", "バランス重視"],
};

const TOTAL = 5;

function getQuestion(step: number, answers: Answer[]): Question {
  if (step === 0) return GENRE_Q;
  if (step >= 1 && step <= 3) {
    const genre = answers[0]?.answer ?? "";
    const branchQs = BRANCH_QUESTIONS[genre];
    if (branchQs) return branchQs[step - 1];
  }
  return FINAL_Q;
}

const RANK_BADGES = ["🥇 あなたにぴったり！", "🥈", "🥉"];

// ─── Global styles (defined once) ────────────────────────────────────────────

const GLOBAL_STYLES = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  services: ServiceForDiagnosis[];
}

export default function DiagnosisClient({ services }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDone = step === TOTAL;
  const isResult = step === TOTAL + 1;
  const progressPct = Math.round((Math.min(step, TOTAL) / TOTAL) * 100);

  function selectAnswer(option: string) {
    const currentQ = getQuestion(step, answers);
    const newAnswers = [...answers.slice(0, step), { question: currentQ.label, answer: option }];
    setAnswers(newAnswers);
    setStep(step + 1);
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
          answers,
          services: services.map((s) => ({
            name: s.name,
            slug: s.slug,
            category: s.category ?? "",
          })),
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

  // ─── Result screen ───────────────────────────────────────────────────────

  if (isResult && results) {
    return (
      <div style={{ paddingTop: "60px", paddingBottom: "80px" }}>
        <style>{GLOBAL_STYLES}</style>
        <div
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "0 20px",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            あなたへのおすすめ
          </h2>
          <p
            style={{
              color: "#86868b",
              textAlign: "center",
              marginBottom: "32px",
              fontSize: "0.9rem",
            }}
          >
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
                    border: isFirst ? "none" : "1px solid #e0e0e0",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      background: isFirst ? "rgba(255,255,255,0.2)" : "#f0f0f0",
                      borderRadius: "999px",
                      padding: "4px 12px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: "12px",
                      color: isFirst ? "#ffffff" : "#555555",
                    }}
                  >
                    {RANK_BADGES[i]}
                  </div>
                  <div
                    style={{
                      fontSize: isFirst ? "1.4rem" : "1.15rem",
                      fontWeight: 700,
                      marginBottom: "10px",
                    }}
                  >
                    {rec.name}
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
                      borderBottom: isFirst
                        ? "1px solid rgba(255,255,255,0.4)"
                        : "1px solid rgba(17,17,17,0.3)",
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
      </div>
    );
  }

  // ─── Loading screen ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          paddingTop: "60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: "20px",
        }}
      >
        <style>{GLOBAL_STYLES}</style>
        <svg
          width={36}
          height={36}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#86868b"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ animation: "spin 0.8s linear infinite" }}
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <p style={{ color: "#86868b", fontSize: "1rem", fontWeight: 500 }}>
          AIが分析中...
        </p>
      </div>
    );
  }

  // ─── Question / Confirmation screen ─────────────────────────────────────

  const currentQ = isDone ? null : getQuestion(step, answers);

  return (
    <div style={{ paddingTop: "60px", paddingBottom: "80px" }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "0 20px" }}>
        {/* 戻るボタン & ステップ表示 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            minHeight: "32px",
          }}
        >
          {step > 0 ? (
            <button
              onClick={goBack}
              style={{
                background: "none",
                border: "none",
                color: "#86868b",
                fontSize: "0.875rem",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "4px 0",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ← 戻る
            </button>
          ) : (
            <div />
          )}
          {!isDone && (
            <span style={{ fontSize: "0.8rem", color: "#86868b" }}>
              {step + 1} / {TOTAL}
            </span>
          )}
        </div>

        {/* プログレスバー */}
        <div
          style={{
            height: "4px",
            background: "#e5e5ea",
            borderRadius: "999px",
            marginBottom: "28px",
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
        {isDone ? (
          /* 確認画面 */
          <div
            key="done"
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "#86868b", marginBottom: "8px" }}>
              回答確認
            </p>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "20px",
                lineHeight: 1.4,
              }}
            >
              以下の内容で診断します
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              {answers.map((a, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "#f5f5f7",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "#86868b", marginRight: "8px" }}>{a.question}</span>
                  <span style={{ fontWeight: 600 }}>{a.answer}</span>
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
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: "#111111",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              診断する 🔍
            </button>
          </div>
        ) : (
          /* 質問画面 */
          <div
            key={step}
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "24px",
                lineHeight: 1.5,
              }}
            >
              {currentQ!.label}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {currentQ!.options.map((opt) => (
                <OptionButton
                  key={opt}
                  isKodawaranai={opt === "こだわらない"}
                  onClick={() => selectAnswer(opt)}
                >
                  {opt}
                </OptionButton>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionButton({
  children,
  onClick,
  isKodawaranai,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isKodawaranai?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "16px",
        borderRadius: "12px",
        border: `1px solid ${hovered ? "#111111" : "#e0e0e0"}`,
        background: hovered ? "#111111" : "#ffffff",
        color: hovered ? "#ffffff" : isKodawaranai ? "#86868b" : "#111111",
        fontSize: "0.95rem",
        fontWeight: isKodawaranai ? 400 : 500,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s, color 0.15s, border-color 0.15s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}
