// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "scan-line": "scan 2s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(9.5rem)" }, // Adjusted for h-40 frame
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
