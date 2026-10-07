/**
 * Configuración general del sitio. Todo lo que cambia sin tocar componentes vive aquí.
 */
export const SITE = {
  nombre: "Luna Roja",
  descripcion: "Experiencia Premium de modelos de compañía en El Salvador.",
  /** Número de WhatsApp en formato internacional sin "+" ni espacios.
   *  PENDIENTE: número de prueba, reemplazar por el real antes de publicar. */
  whatsapp: "50370000000",
  ciudad: "San Salvador",
  zonaHoraria: "America/El_Salvador",
  /** Métodos de pago: activar `tarjeta` o `transferencia` cuando haya procesador. */
  pagos: {
    efectivo: true,
    tarjeta: false,
    transferencia: false,
  },
  /** Mientras la disponibilidad no venga de la app externa, todas las modelos se muestran
   *  "Disponible" y sólo se bloquean los horarios que ya pasaron. */
  disponibilidadForzada: true,
  /** Cuántos días hacia adelante se pueden reservar. */
  diasReservables: 60,
  /** Margen mínimo (minutos) entre ahora y el inicio de una reserva. */
  margenMinutos: 60,
  /** Duraciones que se ofrecen en el paso "Duración del servicio" (horas). */
  duraciones: [1, 2, 3, 4],
} as const;

export type MetodoPago = keyof typeof SITE.pagos;
