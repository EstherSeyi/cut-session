/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: { mulish: ["Mulish", "sans-serif"] },
    fontWeight: {
      normal: 300,
      bold: 800,
      extrabold: 1000,
    },
    colors: {
      white: "#FFFFFF",
      primary: "#FB8500",
      secondary: "#023047",
      accent: "#8ECAE6",
      accent_2: "#219EBC",
      black: "#262422",
      black_75: "rgba(38, 36, 34, 0.75)",
      black_50: "rgba(38, 36, 34, 0.5)",
      black_25: "rgba(38, 36, 34, 0.25)",
      black_15: "rgba(38, 36, 34, 0.15)",
      black_10: "rgba(38, 36, 34, 0.1)",
      black_05: "rgba(38, 36, 34, 0.05)",
    },
    extend: {
      backgroundImage: {
        "user-hero": "url('/src/assets/user_hero.jpeg')",
      },
    },
  },
  plugins: [],
};
