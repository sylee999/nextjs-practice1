/** @type {import("prettier").Options} */
const config = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  useTabs: false,
  plugins: ['prettier-plugin-tailwindcss'],
}

module.exports = config
