// Tailwind v4 utilise un plugin PostCSS dédié.
// Toute la config Tailwind vit dans `src/app/globals.css` via @theme.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
