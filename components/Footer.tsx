import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#f5f5f7",
        padding: "40px 0",
        borderTop: "1px solid #d2d2d7",
        marginTop: "80px",
      }}
    >
      <div className="container" style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/privacy" style={{ fontSize: "15px" }}>
            プライバシーポリシー
          </Link>
          <Link href="/terms" style={{ fontSize: "15px" }}>
            利用規約
          </Link>
          <Link href="/company" style={{ fontSize: "15px" }}>
            運営会社
          </Link>
        </div>
        <p style={{ color: "#86868b", fontSize: "13px" }}>
          © 2025 SUBSCOPE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
