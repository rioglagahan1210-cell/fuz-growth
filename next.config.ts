/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Mengizinkan proses produksi selesai meskipun ada error TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Mengizinkan proses produksi selesai meskipun ada error linting (gaya penulisan)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;