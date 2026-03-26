/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
