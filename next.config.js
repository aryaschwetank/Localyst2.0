/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google profile images
  },
  // Remove any 'appDir' or experimental options if they exist
}

module.exports = nextConfig