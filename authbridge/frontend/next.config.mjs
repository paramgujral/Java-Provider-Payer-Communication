/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the frontend to proxy to the Java backend when BACKEND_URL is set.
  // When unset, the app runs fully self-contained on its in-memory API routes.
  async rewrites() {
    const backend = process.env.BACKEND_URL;
    if (!backend) return [];
    return [{ source: "/java-api/:path*", destination: `${backend}/api/v1/:path*` }];
  },
};

export default nextConfig;
