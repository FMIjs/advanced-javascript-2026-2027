import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGunzip, createGzip } from "node:zlib";

const outputDir = join(import.meta.dirname, "..", "output");
const inputPath = join(outputDir, "users.csv");
const gzipPath = `${inputPath}.gz`;
const restoredPath = join(outputDir, "users.restored.csv");

async function createSampleCsv(path: string, rows: number): Promise<void> {
  const lines = ["id,name,email"];
  for (let id = 1; id <= rows; id++) {
    lines.push(`${id},User ${id},user${id}@example.com`);
  }
  await writeFile(path, lines.join("\n") + "\n");
}

async function gzipFile(source: string, destination: string): Promise<void> {
  await pipeline(
    createReadStream(source),
    createGzip(),
    createWriteStream(destination),
  );
}

async function gunzipFile(source: string, destination: string): Promise<void> {
  await pipeline(
    createReadStream(source),
    createGunzip(),
    createWriteStream(destination),
  );
}

async function fileSize(path: string): Promise<number> {
  return (await stat(path)).size;
}

async function filesAreEqual(a: string, b: string): Promise<boolean> {
  const [contentA, contentB] = await Promise.all([readFile(a), readFile(b)]);
  return contentA.equals(contentB);
}

await mkdir(outputDir, { recursive: true });
await createSampleCsv(inputPath, 100_000);

await gzipFile(inputPath, gzipPath);
await gunzipFile(gzipPath, restoredPath);

const originalSize = await fileSize(inputPath);
const gzipSize = await fileSize(gzipPath);

console.log(`original:   ${originalSize} bytes  ${inputPath}`);
console.log(`gzipped:    ${gzipSize} bytes  ${gzipPath}`);
console.log(`ratio:      ${((gzipSize / originalSize) * 100).toFixed(1)}%`);
console.log(`round trip: ${(await filesAreEqual(inputPath, restoredPath)) ? "identical" : "DIFFERENT"}`);
