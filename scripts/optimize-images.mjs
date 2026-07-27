// One-off asset optimizer. Re-encodes oversized /public raster assets to WebP
// at the widths they are actually displayed at. Originals stay in git history.
import sharp from "sharp";
import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.argv[2];
const APPLY = process.argv.includes("--apply");

// dir -> { width, quality } sized from the CSS box the asset renders into
const TARGETS = [
  // Banners carry baked-in headline typography, so they get a higher quality
  // floor than the photographic assets — still ~97% smaller than the sources.
  { dir: "banners", width: 1920, quality: 88 },
  { dir: "blog-image", width: 1400, quality: 80 },
  { dir: "BRAND", width: 400, quality: 85 },
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let before = 0;
let after = 0;

for (const { dir, width, quality } of TARGETS) {
  const base = path.join(ROOT, "public", dir);
  for await (const file of walk(base)) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    // Read through a buffer rather than handing sharp a path: on Windows sharp
    // keeps the source handle open, which makes the unlink below fail EPERM.
    const input = await readFile(file);
    const out = file.replace(/\.(jpe?g|png)$/i, ".webp");

    const buf = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer();

    before += input.length;
    after += buf.length;
    const pct = ((1 - buf.length / input.length) * 100).toFixed(1);
    console.log(
      `${(input.length / 1024).toFixed(0).padStart(6)}K -> ${(buf.length / 1024).toFixed(0).padStart(5)}K  (-${pct.padStart(4)}%)  ${path.relative(ROOT, out)}`
    );

    if (APPLY) {
      await writeFile(out, buf);
      await unlink(file);
    }
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log(
  `\nTOTAL ${mb(before)} MB -> ${mb(after)} MB  (-${((1 - after / before) * 100).toFixed(1)}%)  ${APPLY ? "[written]" : "[dry run]"}`
);
