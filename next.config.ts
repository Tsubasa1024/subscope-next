import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // 旧URLから新URLへの永続リダイレクト
  async redirects() {
    return [
      // /all → /articles
      {
        source: "/all",
        destination: "/articles",
        permanent: true,
      },
      // /article/:id → /articles/:id
      {
        source: "/article/:id",
        destination: "/articles/:id",
        permanent: true,
      },
      // /register → /signup
      {
        source: "/register",
        destination: "/signup",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.microcms-assets.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
