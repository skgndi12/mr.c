import bundleAnalzer from '@next/bundle-analyzer';

const withBundleAnalzyer = bundleAnalzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: () => [{ source: '/api/:path*', destination: 'http://localhost:8080/api/:path*' }],
};

export default withBundleAnalzyer(nextConfig);
