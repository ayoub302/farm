/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;
