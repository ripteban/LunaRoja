import { fechaHora } from "./time";

const fechaLarga = new Intl.DateTimeFormat("es-SV", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const mesAnio = new Intl.DateTimeFormat("es-SV", { month: "long", year: "numeric", timeZone: "UTC" });

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Viernes, 2 de octubre" */
export function formatFecha(clave: string): string {
  return capitalizar(fechaLarga.format(fechaHora(clave)));
}

/** "Octubre 2026" */
export function formatMes(anio: number, mes: number): string {
  return capitalizar(mesAnio.format(new Date(Date.UTC(anio, mes, 1)))).replace(" de ", " ");
}

/** Minutos desde medianoche (puede pasar de 24 h) → "07:00 p.m." como en el Figma. */
export function formatHora(minutos: number): string {
  const total = ((minutos % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const sufijo = h24 < 12 ? "a.m." : "p.m.";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${sufijo}`;
}

/** "07:00 p.m. – 08:00 p.m." */
export function formatRango(inicioMin: number, horas: number): string {
  return `${formatHora(inicioMin)} – ${formatHora(inicioMin + horas * 60)}`;
}

/** "1 hora" / "3 horas" */
export function formatDuracion(horas: number): string {
  return `${horas} ${horas === 1 ? "hora" : "horas"}`;
}

/** "$100" */
export function formatPrecio(usd: number): string {
  return `$${usd.toLocaleString("en-US")}`;
}

/** "1.70 m" a partir de centímetros. */
export function formatEstatura(cm: number): string {
  return `${(cm / 100).toFixed(2)} m`;
}
