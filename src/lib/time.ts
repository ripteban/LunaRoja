/**
 * Utilidades de fecha en "hora de pared" de El Salvador (UTC-6, sin horario de verano).
 * Representamos cada instante local como un Date cuyos getters UTC dan la hora local:
 * así evitamos depender de la zona horaria del dispositivo del cliente.
 */
const OFFSET_SV_MIN = -6 * 60;

/** "Ahora" en hora de pared de El Salvador. */
export function ahoraSV(now: Date = new Date()): Date {
  return new Date(now.getTime() + OFFSET_SV_MIN * 60_000);
}

/** "AAAA-MM-DD" de un Date en hora de pared. */
export function claveFecha(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Date (hora de pared) a partir de "AAAA-MM-DD" y minutos desde medianoche. */
export function fechaHora(clave: string, minutos = 0): Date {
  const [y, m, d] = clave.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, minutos));
}

export function sumarDias(clave: string, dias: number): string {
  return claveFecha(new Date(fechaHora(clave).getTime() + dias * 86_400_000));
}

/** "AAAA-MM-DDTHH:MM" de un Date en hora de pared. */
export function claveInstante(d: Date): string {
  return d.toISOString().slice(0, 16);
}

const DIAS = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"] as const;
export type DiaSemana = (typeof DIAS)[number];

export function diaSemana(clave: string): DiaSemana {
  return DIAS[fechaHora(clave).getUTCDay()];
}
