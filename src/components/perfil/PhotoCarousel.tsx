import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { Agenda } from "../../lib/availability";
import type { ImagenResponsive } from "../../lib/imagenes";
import { ChevronRight } from "../ui/icons";
import StatusBadge from "./StatusBadge";

interface Props {
  fotos: ImagenResponsive[];
  agenda: Agenda;
  nombre: string;
}

/**
 * Carrusel de fotos del perfil (componente "Perfil" 486:443 del Figma, estados 1–3).
 * Swipe táctil con Embla, botón rojo "siguiente" y puntos indicadores.
 */
export default function PhotoCarousel({ fotos, agenda, nombre }: Props) {
  const [viewportRef, embla] = useEmblaCarousel({ loop: fotos.length > 1, duration: 22 });
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setActual(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  const siguiente = useCallback(() => embla?.scrollNext(), [embla]);
  const anterior = useCallback(() => embla?.scrollPrev(), [embla]);

  return (
    <div className="@container">
    <div
      className="relative aspect-[628/856] w-full overflow-hidden rounded-[8.2cqw] bg-surface"
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Fotos de ${nombre}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") siguiente();
        if (e.key === "ArrowLeft") anterior();
      }}
    >
      <div ref={viewportRef} className="h-full overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {fotos.map((f, i) => (
            <div
              key={f.src}
              className="relative h-full min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="foto"
              aria-label={`${i + 1} de ${fotos.length}`}
            >
              <img
                src={f.src}
                srcSet={f.srcset}
                sizes="(min-width: 1024px) 33vw, 92vw"
                width={f.width}
                height={f.height}
                alt={f.alt}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
                draggable={false}
                className="size-full select-none object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]" />

      <StatusBadge agenda={agenda} className="absolute inset-x-[4.2cqw] top-[4.2cqw] text-[5.85cqw]" />

      {fotos.length > 1 && (
        <>
          <button
            type="button"
            onClick={siguiente}
            aria-label="Foto siguiente"
            className="bg-cta absolute right-[2.7cqw] top-1/2 grid size-[11.6cqw] -translate-y-1/2 place-items-center rounded-full shadow-[0_6px_24px_rgb(255_51_72/0.45)] transition-transform duration-200 hover:scale-105 active:scale-90"
          >
            <ChevronRight className="h-[4.3cqw] w-auto min-w-0 text-white" />
          </button>
          <div className="absolute inset-x-0 bottom-[4cqw] flex justify-center gap-[1.6cqw]">
            {fotos.map((f, i) => (
              <button
                key={f.src}
                type="button"
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === actual}
                onClick={() => embla?.scrollTo(i)}
                className={`h-[1.6cqw] rounded-full transition-all duration-300 ${i === actual ? "w-[6cqw] bg-white" : "w-[1.6cqw] bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
    </div>
  );
}
