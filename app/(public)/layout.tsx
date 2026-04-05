import { Suspense } from "react";
import HeaderWithData from "@/components/HeaderWithData";
import Footer from "@/components/Footer";
import LoginToast from "@/components/LoginToast";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderWithData />
      {children}
      <Footer />
      <Suspense>
        <LoginToast />
      </Suspense>
    </>
  );
}
