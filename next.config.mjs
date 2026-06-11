/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  // Enable static export ONLY when building for mobile/Capacitor
  ...(process.env.EXPORT_MOBILE === "true" ? { output: "export" } : {}),
}

export default nextConfig
