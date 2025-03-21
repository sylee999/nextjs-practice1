/** @type {import("prettier").Options} */
const config = {
  trailingComma: 'es5',
  tabWidth: 4,
  semi: false,
  singleQuote: true,
  useTabs: false,
  plugins: ['prettier-plugin-tailwindcss'],
}

module.exports = config
