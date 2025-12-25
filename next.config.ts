import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // helps skip the typescript checking
    // ignoreBuildErrors: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: "random-q1",

  project: "n8n",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
