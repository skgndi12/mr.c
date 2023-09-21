/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mrc/common-utils', '@mrc/common-components'],
};

module.exports = nextConfig;
