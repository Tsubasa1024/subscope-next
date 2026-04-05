"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const MESSAGES: Record<string, string> = {
  login_success:  "ログインしました！",
  logout_success: "ログアウトしました",
};

export default function Toast() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const key = searchParams.get("toast");
    if (key && MESSAGES[key]) {
      setMessage(MESSAGES[key]);

      router.replace(pathname, { scroll: false });

      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black text-white rounded-lg px-5 py-3 text-sm font-medium"
      style={{
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        animation: "fadeInUp 0.25s ease",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="7.5" fill="#4ade80" />
        <path d="M4 7.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  );
}
