import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Pages-router rule that cannot work in this app, so it is off rather
      // than disabled line by line. It turns each route into a regex by
      // replacing `[param]` with a wildcard, but the replacement is greedy
      // (`/\[.*\]/g`). Every route here sits under `[lang]`, so any route that
      // also ends in a dynamic segment (`/[lang]`, `/[lang]/products/[handle]`,
      // ...) collapses to "any path without a dot" and matches every internal
      // `<a href>` in the project: nine such routes, hence nine identical
      // errors per link. The other route regexes can never match anything,
      // because the href under test is normalised with a trailing slash and
      // the app-router regexes are built without one. The plain `<a>`s that
      // exist (account/login -> /account/authorize) are deliberate full
      // navigations to an OAuth route handler, which a `<Link>` would prefetch.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
