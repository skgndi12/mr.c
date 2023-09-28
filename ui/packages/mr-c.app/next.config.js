/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mrc/common-utils', '@mrc/common-components'],
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
