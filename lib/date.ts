const JST = "Asia/Tokyo";

/** ISO文字列 / Date → "2026-06-27" （JST基準） */
export function formatDateJST(input: string | Date): string {
  if (!input) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input));
}

/** ISO文字列 / Date → "2026年6月" （JST基準、"〜月から" 用） */
export function formatYearMonthJST(input: string | Date): string {
  if (!input) return "";
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST,
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date(input));
  const year  = parts.find((p) => p.type === "year")?.value  ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  return `${year}年${month}月`;
}

/** ISO文字列 / Date → "3時間前" 形式の相対時刻。7日以上前は formatDateJST の絶対日付 */
export function formatRelativeTime(input: string | Date): string {
  if (!input) return "";
  const diffMs = Date.now() - new Date(input).getTime();
  if (diffMs < 0) return formatDateJST(input);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return formatDateJST(input);
}

/** 今日の日付文字列 "2026-06-27" （JST基準） */
export function todayJST(): string {
  return formatDateJST(new Date());
}

/** 昨日の日付文字列 "2026-06-26" （JST基準） */
export function yesterdayJST(): string {
  return formatDateJST(new Date(Date.now() - 86_400_000));
}
