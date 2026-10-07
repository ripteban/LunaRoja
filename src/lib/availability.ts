import { SITE } from "../config/site";
import { ahoraSV, claveFecha, claveInstante, diaSemana, fechaHora, sumarDias, type DiaSemana } from "./time";

/** Datos de agenda de una modelo (subconjunto serializable de su archivo de contenido). */
export interface Agenda {
  horario: Partial<Record<DiaSemana, string[]>>;
  bloqueos: string[];
  ocupados: string[];
  activa: boolean;
}

export type EstadoHorario = "available" | "selected" | "occupied" | "past" | "unavailable";

export interface Horario {
  /** Minutos desde la medianoche del día elegido (≥ 1440 = madrugada siguiente). */
  inicio: number;
  estado: Exclude<EstadoHorario, "selected">;
}

export type EstadoDia = "default" | "today" | "disabled" | "outside";

function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Bloques de inicio (en minutos) que caben en el horario del día, cada uno con su fin de turno. */
function bloquesDelDia(agenda: Agenda, fecha: string): { inicio: number; finTurno: number }[] {
  const rangos = agenda.horario[diaSemana(fecha)] ?? [];
  const bloques: { inicio: number; finTurno: number }[] = [];
  for (const rango of rangos) {
    const [a, b] = rango.split("-").map(aMinutos);
    const fin = b <= a ? b + 1440 : b; // cruza la medianoche
    for (let t = a; t + 60 <= fin; t += 60) bloques.push({ inicio: t, finTurno: fin });
  }
  return bloques.sort((x, y) => x.inicio - y.inicio);
}

/**
 * Horarios de inicio para una fecha y una duración, con su estado.
 * Un inicio es reservable si las `horas` consecutivas caben en el mismo turno,
 * ya empezaron después de ahora + margen y ninguna está ocupada.
 */
export function horariosDelDia(agenda: Agenda, fecha: string, horas: number, now = new Date()): Horario[] {
  if (!agenda.activa || agenda.bloqueos.includes(fecha)) return [];
  const limite = ahoraSV(now).getTime() + SITE.margenMinutos * 60_000;
  const ocupados = new Set(agenda.ocupados);

  return bloquesDelDia(agenda, fecha).map(({ inicio, finTurno }) => {
    const instante = fechaHora(fecha, inicio);
    if (instante.getTime() < limite) return { inicio, estado: "past" as const };
    for (let i = 0; i < horas; i++) {
      const clave = claveInstante(fechaHora(fecha, inicio + i * 60));
      if (ocupados.has(clave)) return { inicio, estado: "occupied" as const };
    }
    if (inicio + horas * 60 > finTurno) return { inicio, estado: "unavailable" as const };
    return { inicio, estado: "available" as const };
  });
}

export function hoySV(now = new Date()): string {
  return claveFecha(ahoraSV(now));
}

/** ¿Tiene la fecha al menos un horario reservable para esa duración? */
export function diaReservable(agenda: Agenda, fecha: string, horas: number, now = new Date()): boolean {
  const hoy = hoySV(now);
  if (fecha < hoy || fecha > sumarDias(hoy, SITE.diasReservables)) return false;
  return horariosDelDia(agenda, fecha, horas, now).some((h) => h.estado === "available");
}

/** Primera fecha reservable a partir de hoy, o null si no hay. */
export function primerDiaReservable(agenda: Agenda, horas: number, now = new Date()): string | null {
  const hoy = hoySV(now);
  for (let i = 0; i <= SITE.diasReservables; i++) {
    const f = sumarDias(hoy, i);
    if (diaReservable(agenda, f, horas, now)) return f;
  }
  return null;
}

export interface CeldaCalendario {
  fecha: string;
  dia: number;
  estado: EstadoDia;
}

/** Cuadrícula de 6 semanas (lunes a domingo) para el mes indicado (mes 0–11). */
export function cuadriculaMes(
  agenda: Agenda,
  anio: number,
  mes: number,
  horas: number,
  now = new Date(),
): CeldaCalendario[] {
  const primero = new Date(Date.UTC(anio, mes, 1));
  const desplazamiento = (primero.getUTCDay() + 6) % 7; // lunes = 0
  const inicio = sumarDias(claveFecha(primero), -desplazamiento);
  const hoy = hoySV(now);
  const celdas: CeldaCalendario[] = [];
  const semanas = desplazamiento + new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate() > 35 ? 6 : 5;
  for (let i = 0; i < semanas * 7; i++) {
    const fecha = sumarDias(inicio, i);
    const d = fechaHora(fecha);
    let estado: EstadoDia;
    if (d.getUTCMonth() !== mes) estado = "outside";
    else if (!diaReservable(agenda, fecha, horas, now)) estado = "disabled";
    else estado = fecha === hoy ? "today" : "default";
    celdas.push({ fecha, dia: d.getUTCDate(), estado });
  }
  return celdas;
}
