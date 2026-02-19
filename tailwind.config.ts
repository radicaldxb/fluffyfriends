import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-green": "#F09A54",
        "brand-charcoal": "#2D2D2D",
        "soft-bg": "#000000",
        "brand-orange": "#F09A54",
        "brand-ink": "#000000",
        "brand-cream": "#F2EEE2",
      },
    },
  },
}

export default config

