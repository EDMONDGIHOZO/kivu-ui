import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false, // declarations are emitted by tsc (see tsconfig.build.json)
  // Do not embed library source in the public npm artifact.
  sourcemap: false,
  clean: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  // Components use hooks/context; mark the bundle as client code for Next.js RSC.
  banner: { js: '"use client";' },
});
