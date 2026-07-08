/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      colors: {
        // 暖米白底
        cream: {
          50: "#FBF8F2",
          100: "#F7F3EC",
          200: "#EFE9DD",
          300: "#E2D9C6",
          dark: "#1A1817",
        },
        // 晨曦桃
        dawn: {
          100: "#F7DDD2",
          200: "#EFC4B4",
          300: "#E8B4A0",
          400: "#DD9A82",
          500: "#C97E64",
          dark: "#8B5A4A",
        },
        // 静谧鼠尾草绿
        sage: {
          100: "#DDE5E0",
          200: "#BFCDC4",
          300: "#8FA89B",
          400: "#6F8B7C",
          500: "#536B5E",
          dark: "#3D5A4C",
        },
        // 暮色紫灰
        dusk: {
          100: "#E0DBE5",
          200: "#C4BACE",
          300: "#9B8FA8",
          400: "#7E708C",
          dark: "#5A4E68",
        },
        // 柔金
        gold: {
          300: "#E5CFA3",
          400: "#D4B896",
          500: "#B8975F",
          dark: "#8B7442",
        },
        // 深炭灰
        ink: {
          400: "#6B655F",
          500: "#4A4540",
          600: "#3A3633",
          700: "#2A2724",
          dark: "#EFE9DD",
        },
        // 深色背景
        night: {
          50: "#2A2724",
          100: "#1F1D1B",
          200: "#1A1817",
          300: "#151413",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 10px 40px -12px rgba(58, 54, 51, 0.12)',
        'softer': '0 6px 24px -8px rgba(58, 54, 51, 0.08)',
        'glow': '0 0 60px -10px rgba(232, 180, 160, 0.5)',
      },
      keyframes: {
        'breath': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        'float-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'breath': 'breath 4s ease-in-out infinite',
        'float-up': 'float-up 0.6s ease-out',
        'shimmer': 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
