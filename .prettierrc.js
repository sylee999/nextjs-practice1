/** @type {import("prettier").Options} */
module.exports = {
  useTabs: false,
  endOfLine: "lf",
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  // importOrder options removed as they belong to @ianvs/prettier-plugin-sort-imports
  // prettier-plugin-tailwindcss handles import sorting automatically
  plugins: [
    "prettier-plugin-tailwindcss", // Keep only this plugin
  ],
}
