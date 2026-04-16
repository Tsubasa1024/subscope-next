// ============================================================
// プロフィールバリデーション（サーバー専用）
// ============================================================

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

/** 予約語（これらは登録不可） */
const RESERVED = new Set([
  "admin", "administrator", "subscope", "official", "support",
  "help", "system", "moderator", "mod", "staff", "root", "info",
  "contact", "press", "news", "about", "terms", "privacy",
  "login", "logout", "signup", "register", "api", "null", "undefined",
]);

/** 簡易 NG ワード */
const NG_WORDS = ["spam", "fuck", "shit", "ass", "dick", "porn", "sex", "nude"];

export type UsernameValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateUsername(username: string): UsernameValidationResult {
  const trimmed = username.trim();

  if (trimmed.length < USERNAME_MIN || trimmed.length > USERNAME_MAX) {
    return { ok: false, error: `ユーザー名は${USERNAME_MIN}〜${USERNAME_MAX}文字で入力してください` };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return { ok: false, error: "半角英数字・アンダースコア(_)・ハイフン(-)のみ使用できます" };
  }
  if (RESERVED.has(trimmed.toLowerCase())) {
    return { ok: false, error: "このユーザー名は使用できません" };
  }
  const lower = trimmed.toLowerCase();
  for (const ng of NG_WORDS) {
    if (lower.includes(ng)) {
      return { ok: false, error: "このユーザー名は使用できません" };
    }
  }
  return { ok: true };
}

/** 月1回制限チェック。true = 変更可 */
export function canChangeUsername(
  changedAt: string | null
): { canChange: boolean; nextChangeAt: string | null } {
  if (!changedAt) return { canChange: true, nextChangeAt: null };
  const next = new Date(changedAt);
  next.setMonth(next.getMonth() + 1);
  const now = new Date();
  if (now >= next) return { canChange: true, nextChangeAt: null };
  return { canChange: false, nextChangeAt: next.toISOString() };
}
