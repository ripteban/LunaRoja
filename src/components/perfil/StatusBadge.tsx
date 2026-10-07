import { useEffect, useState } from "react";
import type { Agenda } from "../../lib/availability";
import { estadoActual, ETIQUETA_ESTADO, type EstadoActual } from "../../lib/status";

const COLOR_PUNTO: Record<EstadoActual, string> = {
  available: "bg-mint motion-safe:animate-pulse-dot",
  rest: "bg-amber",
  empty: "bg-muted",
  inactive: "bg-muted",
};

/**
 * Píldora "ESTADO ACTUAL" (componente Profile/Current status del Figma).
 * El estado se recalcula en el navegador con la hora real de El Salvador.
 */
export default function StatusBadge({ agenda, className = "" }: { agenda: Agenda; className?: string }) {
  const [estado, setEstado] = useState<EstadoActual>(() => estadoActual(agenda));

  useEffect(() => {
    setEstado(estadoActual(agenda));
    const id = window.setInterval(() => setEstado(estadoActual(agenda)), 60_000);
    return () => window.clearInterval(id);
  }, [agenda]);

  return (
    <div
      className={`bg-cta flex flex-col items-center rounded-full pt-[0.25em] pb-[0.3em] shadow-[inset_0_-5.9px_5.9px_rgb(255_255_255/0.25),inset_0_5.9px_5.9px_rgb(255_255_255/0.25)] ${className}`}
      role="status"
    >
      <span className="text-[0.52em] font-medium uppercase leading-[1.3] tracking-wide text-white">Estado actual</span>
      <span className="flex items-center gap-[0.42em] text-[1em] font-semibold leading-[1.15] text-white">
        <span className={`size-[0.39em] rounded-full ${COLOR_PUNTO[estado]}`} />
        {ETIQUETA_ESTADO[estado]}
      </span>
    </div>
  );
}
