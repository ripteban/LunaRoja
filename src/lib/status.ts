import { SITE } from "../config/site";
import { horariosDelDia, hoySV, type Agenda } from "./availability";
import { ahoraSV, sumarDias } from "./time";

/** Estados de "ESTADO ACTUAL" (variantes del componente Booking/Current status del Figma). */
export type EstadoActual = "available" | "rest" | "empty" | "inactive";

export const ETIQUETA_ESTADO: Record<EstadoActual, string> = {
  available: "Disponible",
  rest: "En descanso",
  empty: "Sin agenda hoy",
  inactive: "No disponible",
};

/**
 * Estado de la modelo en este momento. Se calcula en el navegador: si se calculara
 * al compilar, quedaría congelado en la hora del build.
 */
export function estadoActual(agenda: Agenda, now = new Date()): EstadoActual {
  if (!agenda.activa) return "inactive";
  if (SITE.disponibilidadForzada) return "available";

  const ahora = ahoraSV(now);
  const minutos = ahora.getUTCHours() * 60 + ahora.getUTCMinutes();
  const hoy = hoySV(now);
  // El turno de anoche puede seguir activo en la madrugada de hoy.
  const turnos = [
    ...horariosDelDia(agenda, sumarDias(hoy, -1), 1, new Date(0)).map((h) => h.inicio - 1440),
    ...horariosDelDia(agenda, hoy, 1, new Date(0)).map((h) => h.inicio),
  ];
  if (turnos.some((t) => minutos >= t && minutos < t + 60)) return "available";
  if (turnos.some((t) => t > minutos)) return "rest";
  return "empty";
}
