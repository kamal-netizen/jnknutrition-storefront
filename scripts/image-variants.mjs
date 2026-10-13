// Pre-generates narrower copies of local /public images for next/image srcsets.
//
// images.loader is custom (src/lib/shopify-image-loader.ts), so Next's own
// optimizer never runs: /_next/image answers 404, and a local file used to ship
// at its authored size to every screen, with every srcset candidate pointing at
// the same URL. This writes the copies once, next to the originals, plus the
// manifest the loader reads to point each srcset width at the right one. A file
// with no manifest entry keeps falling back to its original, so an image added
// later without re-running this still loads (just unresized).
//
//   node scripts/image-variants.mjs <repo root>
//
// Re-run after adding or replacing an image in one of the TARGETS directories.
// Output: public/<dir>/<width>w/<name>.webp and src/lib/image-variants.json.
import sharp from "sharp";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.argv[2] ?? ".";

// Widths are the srcset candidates (next.config `imageSizes`) that these
// layouts actually select: the goal tiles are ~184 CSS px on a phone, which is
// 384 at the 1.75x DPR PageSpeed emulates and 256 on a 1x desktop. Anything
// asking for more than the widest copy gets the original.
const TARGETS = [
  // The tiles carry baked-in headline type, hence the same quality floor as
  // the BRAND logos in optimize-images.mjs rather than a photographic one.
  { dir: "feature image", widths: [256, 384, 512], quality: 85 },
  // The Core Champs strip's cycling product shots: 1000px masters in slots of
  // 180 / 420 / 520 CSS px (CoreChampsHero `sizes`). Photographic, so a lower
  // floor; 768 catches the 640 candidate a 1.75x tablet asks for.
  { dir: "banners/core-champs", widths: [256, 384, 512, 768], quality: 80 },
];

const manifest = {};
let bytes = 0;

for (const { dir, widths, quality } of TARGETS) {
  const base = path.join(ROOT, "public", dir);
  // WebP only: the copies keep the original's file name, which is how the
  // loader finds them. Convert anything else with optimize-images.mjs first.
  const files = (await readdir(base, { withFileTypes: true }))
    .filter((e) => e.isFile() && /\.webp$/i.test(e.name))
    .map((e) => e.name)
    .sort();

  for (const name of files) {
    // Read through a buffer rather than handing sharp a path: on Windows sharp
    // keeps the source handle open (see optimize-images.mjs).
    const input = await readFile(path.join(base, name));
    const { width: original } = await sharp(input).metadata();
    const made = [];

    for (const width of widths) {
      if (width >= original) continue;
      const buf = await sharp(input)
        .resize({ width, kernel: "lanczos3" })
        .webp({ quality, effort: 6 })
        .toBuffer();
      const outDir = path.join(base, `${width}w`);
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, name), buf);
      made.push(width);
      bytes += buf.length;
      console.log(
        `${(input.length / 1024).toFixed(1).padStart(6)}K -> ${(buf.length / 1024).toFixed(1).padStart(5)}K  ${dir}/${width}w/${name}`
      );
    }

    // Keyed by the exact `src` the components pass, raw space included.
    if (made.length) manifest[`/${dir}/${name}`] = made;
  }
}

// One entry per line, so a re-run diffs as the images it actually changed.
const lines = Object.entries(manifest).map(
  ([src, widths]) => `  ${JSON.stringify(src)}: ${JSON.stringify(widths)}`
);
await writeFile(
  path.join(ROOT, "src", "lib", "image-variants.json"),
  `{\n${lines.join(",\n")}\n}\n`
);
console.log(`\n${lines.length} images, ${(bytes / 1024).toFixed(0)}K of copies written`);
