/** @type {import('tailwindcss').Config} */
export default {
  // Quét tất cả các file React để áp dụng style
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette màu Teal & Lime năng động
        primary: "#00675c",
        "primary-dim": "#005a50",
        "primary-container": "#5bf4de",
        secondary: "#006a34",
        "secondary-container": "#6dfe9c",
        tertiary: "#006385",
        background: "#d3fffc",
        "on-surface": "#003534",
        "on-surface-variant": "#296462",
        "surface-container-low": "#bafdfa",
        "surface-container-lowest": "#ffffff",
      },
      fontFamily: {
        // Hệ thống font dual-typeface
        headline: ["Plus Jakarta Sans", "sans-serif"], 
        body: ["Be Vietnam Pro", "sans-serif"],
      },
      borderRadius: {
        // Các token bo góc "blob-like"
        'lg': '2rem', 
        'xl': '3rem', 
      },
    },
  },
  plugins: [],
};