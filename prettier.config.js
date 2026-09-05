/**
 * Matches the style the repo was already written in — no semicolons, single
 * quotes, no trailing commas — so the first `npm run format` is a whitespace
 * pass and not a rewrite of every file.
 *
 * @type {import('prettier').Config}
 */
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 100,
  // `auto` keeps each file's existing line endings. The working tree is CRLF
  // (git `core.autocrlf=true` normalises to LF in the index), so Prettier's
  // default of `lf` would rewrite every line of every file for nothing.
  endOfLine: 'auto',
  plugins: ['prettier-plugin-tailwindcss'],
  // Tailwind 4 has no config file: the plugin has to be pointed at the
  // stylesheet that holds `@import 'tailwindcss'` and the `@theme` block, or it
  // sorts against stock Tailwind and drops every project utility to the end.
  tailwindStylesheet: './src/styles/main.css'
}
