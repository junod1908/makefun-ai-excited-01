import { mkdir, copyFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outdir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const source = join(dirname(fileURLToPath(import.meta.url)), "entry.png");
const destination = join(outdir, "entry.png");

await mkdir(outdir, { recursive: true });
await copyFile(source, destination);
const { size } = await stat(destination);
console.log(`Wrote ${size} bytes to ${destination}`);
