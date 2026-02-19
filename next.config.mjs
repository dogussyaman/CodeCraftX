/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["openai"],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
}

export default nextConfig
