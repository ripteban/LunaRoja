/**
 * La selección de la reserva viaja en la URL (?h=1&m=domicilio&f=2026-10-02&t=1140):
 * sobrevive a recargas, al botón "atrás" y al enlace "Editar", sin guardar nada en el dispositivo.
 */
export type Modalidad = "domicilio" | "presencial";

export interface Seleccion {
  horas: number;
  modalidad: Modalidad | null;
  fecha: string | null;
  /** Minutos desde la medianoche de `fecha` (≥ 1440 = madrugada siguiente). */
  inicio: number | null;
}

export function leerSeleccion(search: string, duraciones: readonly number[], modalidades: Modalidad[]): Seleccion {
  const p = new URLSearchParams(search);
  const h = Number(p.get("h"));
  const m = p.get("m") as Modalidad | null;
  const f = p.get("f");
  const t = p.get("t");
  return {
    horas: duraciones.includes(h) ? h : duraciones[0],
    modalidad: m && modalidades.includes(m) ? m : modalidades.length === 1 ? modalidades[0] : null,
    fecha: f && /^\d{4}-\d{2}-\d{2}$/.test(f) ? f : null,
    inicio: t && /^\d+$/.test(t) ? Number(t) : null,
  };
}

export function queryDe(s: Seleccion): string {
  const p = new URLSearchParams();
  p.set("h", String(s.horas));
  if (s.modalidad) p.set("m", s.modalidad);
  if (s.fecha) p.set("f", s.fecha);
  if (s.inicio !== null) p.set("t", String(s.inicio));
  return `?${p.toString()}`;
}

export function completa(s: Seleccion): s is Seleccion & { modalidad: Modalidad; fecha: string; inicio: number } {
  return s.modalidad !== null && s.fecha !== null && s.inicio !== null;
}
