import HeaderWithData from "@/components/HeaderWithData";
import Footer from "@/components/Footer";

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
    </>
  );
}
