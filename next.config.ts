import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 writes AGENTS.md / CLAUDE.md into the project on every build; we don't want
  // those generated files committed to the client's repo.
  agentRules: false,

  async redirects() {
    return [
      // Legacy static-site URL from the pre-Next.js version
      { source: "/product-detail", destination: "/products", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      // Products renamed in the client's 2026-10-05 catalogue
      { source: "/products/body-lotion", destination: "/products/moisturizer", permanent: true },
      { source: "/products/natural-loofah", destination: "/products/jute-loofah", permanent: true },
      // Discontinued — see ARCHIVED_PRODUCTS in src/lib/products.ts
      { source: "/products/jute-travel-bag", destination: "/products", permanent: false },
      { source: "/products/canvas-slippers", destination: "/products", permanent: false },
      { source: "/products/conditioner", destination: "/products", permanent: false },
      { source: "/products/bamboo-shaving-kit", destination: "/products", permanent: false },
    ];
  },
};

export default nextConfig;
