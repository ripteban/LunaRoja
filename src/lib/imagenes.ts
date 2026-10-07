import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

/** Imagen ya optimizada lista para pasar a una isla de React. */
export interface ImagenResponsive {
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

/** Genera variantes WebP de una imagen local para usarlas en `<img srcset>` dentro de React. */
export async function imagenResponsive(
  src: ImageMetadata,
  alt: string,
  widths = [360, 540, 720, 960, 1200],
): Promise<ImagenResponsive> {
  const usables = widths.filter((w) => w <= src.width);
  const variantes = await Promise.all(usables.map((w) => getImage({ src, width: w, format: "webp", quality: 78 })));
  const mayor = variantes.at(-1)!;
  return {
    src: mayor.src,
    srcset: variantes.map((v) => `${v.src} ${v.attributes.width}w`).join(", "),
    width: src.width,
    height: src.height,
    alt,
  };
}
