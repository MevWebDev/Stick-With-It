import type { NextConfig } from "next";

const withPWA = require("next-pwa");

const nextConfig = {
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    buildExcludes: [/middleware-manifest\.json$/],
  },
} as NextConfig;

export default withPWA(nextConfig);
