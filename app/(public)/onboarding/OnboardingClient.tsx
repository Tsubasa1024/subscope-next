"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

type AvailStatus = "idle" | "checking" | "ok" | "taken" | "invalid";

interface Props {
  userId: string;
}

export default function OnboardingClient({ userId }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username,    setUsername]    = useState("");
  const [availStatus, setAvailStatus] = useState<AvailStatus>("idle");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) { setAvailStatus("idle"); return; }
    if (!USERNAME_RE.test(trimmed) || trimmed.length < 3 || trimmed.length > 20) {
      setAvailStatus("invalid");
      return;
    }
    setAvailStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        setAvailStatus(json.available ? "ok" : "taken");
      } catch {
        setAvailStatus("idle");
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dn = displayName.trim();
    const un = username.trim();

    if (!dn) { setError("ニックネームを入力してください"); return; }
    if (dn.length > 30) { setError("ニックネームは30文字以内で入力してください"); return; }
    if (!un || !USERNAME_RE.test(un) || un.length < 3 || un.length > 20) {
      setError("ユーザーネームは英数字・アンダースコアで3〜20文字にしてください");
      return;
    }
    if (availStatus !== "ok") { setError("ユーザーネームの確認が完了していません"); return; }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: dn, username: un }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "エラーが発生しました");
    } else {
      router.replace("/");
    }
  }

  const usernameHint = () => {
    switch (availStatus) {
      case "checking": return <span style={{ color: "#86868b", fontSize: "0.8rem" }}>確認中...</span>;
      case "ok":       return <span style={{ color: "#34c759", fontSize: "0.8rem" }}>✓ 使用できます</span>;
      case "taken":    return <span style={{ color: "#ff3b30", fontSize: "0.8rem" }}>✗ このユーザーネームは使用済みです</span>;
      case "invalid":  return <span style={{ color: "#ff9500", fontSize: "0.8rem" }}>英数字・アンダースコアで3〜20文字にしてください</span>;
      default:         return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f5f5f7", padding: "40px 16px" }}>
      <div style={{
        width: "100%", maxWidth: "400px",
        background: "#fff", borderRadius: "20px",
        padding: "40px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>👋</div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "6px" }}>
            プロフィールを設定しよう
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#86868b" }}>
            あなたのニックネームとユーザーネームを設定してください
          </p>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#fff0f0", color: "#ff3b30", fontSize: "0.85rem", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
              ニックネーム <span style={{ color: "#ff3b30" }}>*</span>
            </label>
            <input
              type="text"
              required
              maxLength={30}
              autoComplete="nickname"
              placeholder="例: サブスコ太郎"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0",
                borderRadius: "10px", fontSize: "0.9rem", outline: "none",
                boxSizing: "border-box", background: "#fafafa",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#111")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
              ユーザーネーム <span style={{ color: "#ff3b30" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                fontSize: "0.9rem", color: "#86868b", pointerEvents: "none",
              }}>
                @
              </span>
              <input
                type="text"
                required
                maxLength={20}
                autoComplete="username"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px 12px 28px", border: "1px solid #e0e0e0",
                  borderRadius: "10px", fontSize: "0.9rem", outline: "none",
                  boxSizing: "border-box", background: "#fafafa",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#111")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />
            </div>
            <div style={{ marginTop: "6px", minHeight: "18px" }}>{usernameHint()}</div>
          </div>

          <button
            type="submit"
            disabled={loading || availStatus === "taken" || availStatus === "checking"}
            style={{
              width: "100%", padding: "14px", borderRadius: "10px",
              background: (loading || availStatus === "taken" || availStatus === "checking") ? "#999" : "#111111",
              color: "#fff", border: "none", fontSize: "0.95rem", fontWeight: 600,
              cursor: (loading || availStatus === "taken" || availStatus === "checking") ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "設定中..." : "はじめる"}
          </button>
        </form>
      </div>
    </div>
  );
}
