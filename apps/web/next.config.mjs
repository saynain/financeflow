/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@financeflow/database', '@financeflow/ui'],
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig
