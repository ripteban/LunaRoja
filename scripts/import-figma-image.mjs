// Convierte una exportación PNG del MCP de Figma a un asset optimizado del proyecto.
// Uso: node scripts/import-figma-image.mjs <origen.png> <destino.(jpg|png|webp)> [--flatten=#080711] [--width=1600]
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, extname } from "node:path";

const [src, dest, ...flags] = process.argv.slice(2);
if (!src || !dest) {
  console.error("Uso: import-figma-image.mjs <origen> <destino> [--flatten=#hex] [--width=n]");
  process.exit(1);
}
const opts = Object.fromEntries(flags.map((f) => f.replace(/^--/, "").split("=")));

mkdirSync(dirname(dest), { recursive: true });
let img = sharp(src);
if (opts.width) img = img.resize({ width: Number(opts.width), withoutEnlargement: true });
if (opts.flatten) img = img.flatten({ background: opts.flatten });

const ext = extname(dest).toLowerCase();
if (ext === ".jpg" || ext === ".jpeg") img = img.jpeg({ quality: 86, mozjpeg: true });
else if (ext === ".webp") img = img.webp({ quality: 86 });
else img = img.png({ compressionLevel: 9, palette: false });

const info = await img.toFile(dest);
console.log(`${dest}\t${info.width}x${info.height}\t${(info.size / 1024).toFixed(0)} KB`);
