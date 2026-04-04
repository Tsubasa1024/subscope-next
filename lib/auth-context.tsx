"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// ============================================================
// 型定義
// ============================================================
export interface UserSession {
  uid: string;
  email: string;
  name: string;
  photoURL: string | null;
  color: string;
}

interface AuthContextValue {
  user: UserSession | null;
  ready: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================
// ヘルパー
// ============================================================
function avatarColor(uid: string): string {
  const palette = [
    "#5B8DEF", "#E8685A", "#4CAF82", "#9B72CF",
    "#E8A23A", "#4CB8C4", "#E86891", "#7CB56C",
  ];
  let h = 0;
  for (let i = 0; i < uid.length; i++) {
    h = (Math.imul(31, h) + uid.charCodeAt(i)) | 0;
  }
  return palette[Math.abs(h) % palette.length];
}

function toSession(user: User): UserSession {
  return {
    uid:      user.id,
    email:    user.email ?? "",
    name:     user.user_metadata?.full_name
              ?? user.user_metadata?.name
              ?? user.email?.split("@")[0]
              ?? "ユーザー",
    photoURL: user.user_metadata?.avatar_url ?? null,
    color:    avatarColor(user.id),
  };
}

// ============================================================
// Provider
// ============================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]   = useState<UserSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // 初回セッション確認
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? toSession(data.user) : null);
      setReady(true);
    });

    // 以降はリアルタイムで追従
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ? toSession(session.user) : null);
        setReady(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, ready, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
