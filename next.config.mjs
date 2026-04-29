/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      /** Friendly URL → static PDF in /public (also helps bookmarks without .pdf) */
      /** Keep query in sync with `lib/print-guide.ts` (cache bust). */
      { source: "/print-guide", destination: "/print-guide.pdf?v=2" },
      /** n8n WF2 quality-check can POST to /webhook/quality-check */
      { source: "/webhook/quality-check", destination: "/api/webhooks/quality-check" },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mblnpneghvkfmbgmbrco.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
