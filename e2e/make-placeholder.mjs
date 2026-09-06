#!/usr/bin/env node
// Generate a solid single-color placeholder image into e2e/api-responses/.
// Output name: image<W>x<H>.<format>. Never commit a real cover from Open Library.
//
// sharp is not a project dependency; borrow it for the one run:
//   npm install --prefix /tmp/sharp sharp
//   NODE_PATH=/tmp/sharp/node_modules node e2e/make-placeholder.mjs 180x270 jpg [#efefef] [outDir]
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const [size, format = "jpg", color = "#efefef", outDir = "e2e/api-responses"] =
  process.argv.slice(2);
if (!size) {
  console.error(
    "usage: make-placeholder.mjs <WxH> [webp|jpg|png] [#hex] [outDir]",
  );
  process.exit(1);
}
const [width, height] = size.split("x").map(Number);
const file = path.join(outDir, `image${width}x${height}.${format}`);

await sharp({ create: { width, height, channels: 3, background: color } })
  .toFormat(format === "jpg" ? "jpeg" : format)
  .toFile(file);

console.log(`wrote ${file}`);
