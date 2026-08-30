import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-config-next 15.x ships legacy (.eslintrc-shape) config only — flat
// config support landed in 16.x. We're pinned to Next 15 per spec section 2,
// so bridge it with FlatCompat rather than pull in a Next major we don't
// want. Revisit this file when eslint-config-next 15.x adds flat exports or
// when the project moves to Next 16.
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
];

export default eslintConfig;
