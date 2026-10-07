import { SITE } from "../config/site";
import { formatDuracion, formatFecha, formatPrecio, formatRango } from "./format";

export interface Reserva {
  modelo: string;
  horas: number;
  modalidad: "domicilio" | "presencial";
  fecha: string;
  inicio: number;
  zona: string;
  pago: string;
  total: number;
}

export const ETIQUETA_MODALIDAD = { domicilio: "A domicilio", presencial: "Presencial" } as const;

export function mensajeReserva(r: Reserva): string {
  return [
    "Hola Luna Roja 👋 Quiero reservar:",
    `• Modelo: ${r.modelo}`,
    `• Duración: ${formatDuracion(r.horas)}`,
    `• Modalidad: ${ETIQUETA_MODALIDAD[r.modalidad]}`,
    `• Fecha: ${formatFecha(r.fecha)}`,
    `• Horario: ${formatRango(r.inicio, r.horas)}`,
    `• Zona: ${r.zona}`,
    `• Pago: ${r.pago}`,
    `Total: ${formatPrecio(r.total)}`,
  ].join("\n");
}

/** Link wa.me con el texto ya escrito (el usuario sólo presiona enviar). */
export function linkWhatsApp(texto?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
