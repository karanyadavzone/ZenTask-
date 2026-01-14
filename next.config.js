/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
  // Optimize for mobile performance
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Enable compression
  compress: true,
  // Optimize bundle
  swcMinify: true,
}

module.exports = nextConfig
