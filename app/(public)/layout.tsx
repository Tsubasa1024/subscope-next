import HeaderWithData from "@/components/HeaderWithData";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

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
      <BottomNav />
    </>
  );
}
