import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "react-hooks/set-state-in-effect": "off"
    }
  },
  {
    files: [
      "src/components/ui/color-picker.tsx",
      "src/components/visually-hidden-input.tsx",
      "src/lib/compose-refs.ts"
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/refs": "off",
      "react-hooks/use-memo": "off"
    }
  }
];

export default eslintConfig;
