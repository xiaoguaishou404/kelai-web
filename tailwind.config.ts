import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1F2937",
          soft: "#465B73",
          muted: "#586D83",
          disabled: "#B6BFCC",
        },
        canvas: "#F3F6FB",
        paper: "#FFFFFF",
        line: {
          DEFAULT: "#E8EDF5",
          soft: "#EEF0F6",
          control: "#E3E9F3",
        },
        tide: {
          DEFAULT: "#3361E8",
          light: "#3E69D1",
          deep: "#2A50C9",
          mist: "#EEF2FF",
          hover: "#E0E8FF",
          border: "#DBE4FF",
        },
        success: {
          DEFAULT: "#087B67",
          deep: "#0B7462",
          mist: "#E6F5F0",
          border: "#C9E9E0",
        },
        warning: {
          DEFAULT: "#A45E08",
          deep: "#8A5A16",
          mist: "#FBEEDD",
          border: "#F6DFB4",
        },
        danger: {
          DEFAULT: "#C42D35",
          deep: "#B91C1C",
          mist: "#FDECEC",
        },
        violet: {
          DEFAULT: "#7C3AED",
          mist: "#F3E8FF",
        },
        cyan: {
          DEFAULT: "#0891B2",
          mist: "#E0F5FA",
        },
        amberline: "#E08A12",
        clay: "#B91C1C",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        numeric: ["Bahnschrift", "DIN Alternate", "Arial Narrow", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "14px",
        "2xl": "18px",
      },
      boxShadow: {
        card: "0 3px 18px rgba(15,23,42,0.05)",
        float: "0 8px 24px rgba(15,23,42,0.07)",
        hover: "0 12px 30px rgba(51,97,232,0.10)",
        modal: "0 24px 64px rgba(15,23,42,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
