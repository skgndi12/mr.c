import bundleAnalzer from '@next/bundle-analyzer';

const withBundleAnalzyer = bundleAnalzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withBundleAnalzyer(nextConfig);
