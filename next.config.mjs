/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  }
  ,
  // Allow local network host to access dev resources (webpack HMR) during development
  // Add any additional origins you develop from (e.g., remote device testing)
  allowedDevOrigins: [
    "192.168.18.161"
  ]
};

export default nextConfig;
