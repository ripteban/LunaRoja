// Capturas de verificación visual a los anchos del Figma (412 móvil / 1920 desktop).
// Uso: node scripts/capturas.mjs <url-base> <dir-salida> [ruta...]
import { chromium } from "@playwright/test";

const [base = "http://localhost:4321", out = "capturas", ...rutas] = process.argv.slice(2);
const paginas = rutas.length ? rutas : ["/"];
// En el entorno de la nube Chromium viene preinstalado; localmente Playwright usa el suyo.
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const [nombre, width, height] of [["mobile", 412, 915], ["desktop", 1920, 1080]]) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  // Saltar el aviso +18 en las capturas de páginas (se captura aparte con ?aviso).
  await ctx.addInitScript(() => { if (!location.search.includes("aviso")) localStorage.setItem("lr_age_ok", "1"); });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error(`[${nombre}] pageerror:`, e.message));
  page.on("console", (m) => m.type() === "error" && console.error(`[${nombre}] console:`, m.text()));
  for (const ruta of paginas) {
    await page.goto(base + ruta, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const archivo = `${out}/${nombre}${ruta.replace(/[/?=&]+/g, "_")}.png`;
    await page.screenshot({ path: archivo, fullPage: true });
    console.log(archivo);
  }
  await ctx.close();
}
await browser.close();
