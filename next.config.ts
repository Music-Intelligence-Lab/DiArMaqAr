// next.config.ts
import path from "path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [ path.join(__dirname, "src", "styles") ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.aub.edu.lb',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mirrors.creativecommons.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig