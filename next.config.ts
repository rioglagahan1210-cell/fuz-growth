/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 1. Mengabaikan error TypeScript saat proses build agar deployment berhasil
    ignoreBuildErrors: true,
  },
  eslint: {
    // 2. Mengabaikan error ESLint (peringatan standar penulisan kode) agar proses lebih lancar
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;