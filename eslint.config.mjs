import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"
import eslintPluginPrettier from "eslint-plugin-prettier"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
      // Disable ESLint rules that conflict with Prettier
      indent: "off",
      "linebreak-style": "off",
      quotes: "off",
      semi: "off",
      "comma-dangle": "off",
      "max-len": "off",
      "object-curly-spacing": "off",
      "array-bracket-spacing": "off",
      // Disable import ordering rules that conflict with Prettier plugin
      "sort-imports": "off",
      "import/order": "off",
    },
  },
]

export default eslintConfig
