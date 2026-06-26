"use client";

import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .page-enter {
          animation: pageEnter 0.3s ease both;
        }
      `}</style>
      <div key={pathname} className="page-enter">
        {children}
      </div>
    </>
  );
}
