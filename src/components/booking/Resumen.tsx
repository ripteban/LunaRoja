import { AnimatePresence, m } from "motion/react";
import type { ReactNode } from "react";
import { formatDuracion, formatFecha, formatPrecio, formatRango } from "../../lib/format";
import { ETIQUETA_MODALIDAD } from "../../lib/whatsapp";
import type { Seleccion } from "../../lib/reserva-url";
import { Calendar, Clock, Heel, Building, Hourglass, LocationDot, Person } from "../ui/icons";

interface Props {
  nombre: string;
  zona: string;
  tarifaHora: number;
  seleccion: Seleccion;
  /** Enlace "Editar" junto al título (paso Pagar). */
  editarHref?: string;
  children: ReactNode;
}

/** Valor que cambia con un crossfade corto. */
function Valor({ texto, pendiente }: { texto: string; pendiente?: boolean }) {
  return (
    <span className="relative inline-grid">
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={texto}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={pendiente ? "text-muted" : undefined}
        >
          {texto}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

function Fila({ icono, children }: { icono: ReactNode; children: ReactNode }) {
  return (
    <li className="flex min-h-[44px] items-center gap-4 xl:min-h-[13.3cqw] xl:gap-[5.7cqw]">
      <span className="grid w-[30px] shrink-0 place-items-center xl:w-[10.6cqw]">{icono}</span>
      <span className="text-[19px] leading-snug xl:text-[6.09cqw]">{children}</span>
    </li>
  );
}

/** Panel "Tu selección" (Booking/Summary 396:499 y 560:498 del Figma). */
export default function Resumen({ nombre, zona, tarifaHora, seleccion, editarHref, children }: Props) {
  const { horas, modalidad, fecha, inicio } = seleccion;
  const iconoCls = "h-[26px] w-auto min-w-0 xl:h-[10.2cqw]";
  return (
    <div className="@container xl:sticky xl:top-[7vw]">
    <aside className="glass flex flex-col gap-3 rounded-[24px] p-6 xl:gap-[3.2cqw] xl:rounded-[7.3cqw] xl:p-[6.5cqw]">
      <div className="flex items-center justify-between">
        <h2 className="text-[26px] font-medium leading-[2] xl:text-[8.3cqw]">Tu selección</h2>
        {editarHref && (
          <a href={editarHref} className="text-[16px] font-medium text-red underline underline-offset-4 xl:text-[4.6cqw]">
            Editar
          </a>
        )}
      </div>
      <ul className="flex flex-col gap-1 xl:gap-[2cqw]">
        <Fila icono={<Person className={iconoCls} />}>{nombre}</Fila>
        <Fila icono={<Hourglass className={`${iconoCls} !h-[24px] xl:!h-[9.4cqw]`} />}>
          <Valor texto={formatDuracion(horas)} />
        </Fila>
        <Fila icono={modalidad === "presencial" ? <Building className={iconoCls} /> : <Heel className={iconoCls} />}>
          <Valor texto={modalidad ? ETIQUETA_MODALIDAD[modalidad] : "Elige la modalidad"} pendiente={!modalidad} />
        </Fila>
        <Fila icono={<Calendar className={iconoCls} />}>
          <Valor texto={fecha ? formatFecha(fecha) : "Elige una fecha"} pendiente={!fecha} />
        </Fila>
        <Fila icono={<Clock className={`${iconoCls} !h-[30px] xl:!h-[11.7cqw]`} />}>
          <Valor texto={inicio !== null ? formatRango(inicio, horas) : "Elige un horario"} pendiente={inicio === null} />
        </Fila>
        <Fila icono={<LocationDot className={iconoCls} />}>{zona}</Fila>
      </ul>
      <hr className="border-soft-border" />
      <div className="flex items-center justify-between text-[26px] font-medium xl:text-[8.3cqw]">
        <span>Total</span>
        <Valor texto={formatPrecio(tarifaHora * horas)} />
      </div>
      {children}
    </aside>
    </div>
  );
}
