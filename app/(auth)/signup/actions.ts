"use server";

import { createClient } from "@/lib/supabase/server";

export async function signupWithEmail(email: string): Promise<{ success?: true; error?: string }> {
  if (!email) return { error: "メールアドレスを入力してください" };

  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/onboarding`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) return { error: error.message };
  return { success: true };
}
