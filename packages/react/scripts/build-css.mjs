// Bundles src/styles/index.css (with its @imports) into dist/styles.css and
// copies the optional Tailwind v4 theme preset to dist/tailwind.css.
import { build } from "esbuild";
import { copyFile } from "node:fs/promises";

await build({
  entryPoints: ["src/styles/index.css"],
  bundle: true,
  minify: true,
  outfile: "dist/styles.css",
  logLevel: "warning",
});
await copyFile("src/styles/tailwind.css", "dist/tailwind.css");
console.log("CSS built: dist/styles.css, dist/tailwind.css");
