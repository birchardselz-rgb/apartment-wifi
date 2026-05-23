/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  basePath: '/apartment-wifi',
  assetPrefix: '/apartment-wifi',
  images: { unoptimized: true },
  turbopack: {
    root: path.resolve(__dirname),
  },
};
module.exports = nextConfig;
