/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  async rewrites() {
    return [
      {
        source: "/service.php",
        destination: "/api/service", // Перенаправляем все запросы /service.php → pages/api/service.js
      },
    ];
  },
};

module.exports = nextConfig;
