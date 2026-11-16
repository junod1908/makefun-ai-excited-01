import { mkdir, copyFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outdir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const source = join(dirname(fileURLToPath(import.meta.url)), "entry.png");
const destination = join(outdir, "entry.png");

// Validate the source before creating or changing any output files.
let entry;
try {
  entry = await readFile(source);
} catch (error) {
  throw new Error(`Cannot read source image at ${source}`, { cause: error });
}
if (entry.length === 0) {
  throw new Error(`Source image is empty: ${source}`);
}
const isJpeg = entry.length >= 2 && entry[0] === 0xff && entry[1] === 0xd8;
const isPng = entry.length >= 4 && entry[0] === 0x89 && entry[1] === 0x50
  && entry[2] === 0x4e && entry[3] === 0x47;
if (!isJpeg && !isPng) {
  throw new Error(`Source image must have a JPEG or PNG signature: ${source}`);
}

await mkdir(outdir, { recursive: true });
await copyFile(source, destination);

// Read both files after copying to verify the actual bytes on disk.
const [original, copied] = await Promise.all([
  readFile(source),
  readFile(destination),
]);
if (original.length !== copied.length || !original.equals(copied)) {
  throw new Error(`Copy verification failed: ${destination} differs from ${source}`);
}
console.log(`Wrote ${copied.length} bytes to ${destination} (verified)`);
