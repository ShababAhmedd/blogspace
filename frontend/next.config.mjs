/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // keep the dev badge clear of the sidebar's Logout button
  devIndicators: { position: "bottom-right" },
  turbopack: {
    // the repo root and backend/ have their own lockfiles
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
