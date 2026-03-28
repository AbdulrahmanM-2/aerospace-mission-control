/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  env: {
    NEXT_PUBLIC_APP_NAME: 'Aerospace Mission Control',
    NEXT_PUBLIC_CERTIFICATION: 'DO-178C DAL A',
    NEXT_PUBLIC_TYPE_CERTIFICATE: 'TC-12345',
  },
  
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    })
    return config
  },
}

module.exports = nextConfig
