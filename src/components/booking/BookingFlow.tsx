import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SITE } from "../../config/site";
import {
  cuadriculaMes,
  horariosDelDia,
  hoySV,
  primerDiaReservable,
  type Agenda,
  type Horario,
} from "../../lib/availability";
import { formatDuracion, formatFecha, formatHora, formatMes } from "../../lib/format";
import { completa, leerSeleccion, queryDe, type Modalidad, type Seleccion } from "../../lib/reserva-url";
import { fechaHora } from "../../lib/time";
import { ETIQUETA_MODALIDAD } from "../../lib/whatsapp";
import { Building, ChevronRight, Heel, Lock } from "../ui/icons";
import Resumen from "./Resumen";

interface Props {
  slug: string;
  nombre: string;
  zona: string;
  tarifaHora: number;
  modalidades: Modalidad[];
  agenda: Agenda;
}

const SPRING = { type: "spring", stiffness: 520, damping: 38 } as const;

/** Fondo rojo que se desliza entre opciones seleccionadas (Motion layoutId). */
function Seleccionado({ id }: { id: string }) {
  return (
    <m.span
      layoutId={id}
      transition={SPRING}
      className="bg-cta absolute inset-0 -z-10 rounded-[inherit] shadow-[inset_0_0_14px_var(--color-glow),0_6px_20px_rgb(255_51_72/0.35)]"
    />
  );
}

function Titulo({ children }: { children: ReactNode }) {
  return <h3 className="text-[20px] font-medium leading-[2] text-ink xl:text-[3.59cqw]">{children}</h3>;
}

const pill =
  "relative isolate rounded-full font-medium text-ink transition-[transform,opacity] duration-150 active:scale-[0.96] disabled:active:scale-100";

/**
 * Paso "Disponibilidad, Servicio y Duración" (384:1645 desktop / 518:439 móvil):
 * duración, modalidad, calendario y horarios, con el resumen al lado.
 */
export default function BookingFlow({ slug, nombre, zona, tarifaHora, modalidades, agenda }: Props) {
  const [sel, setSel] = useState<Seleccion>(() => ({
    horas: SITE.duraciones[0],
    modalidad: modalidades.length === 1 ? modalidades[0] : null,
    fecha: null,
    inicio: null,
  }));
  const [mes, setMes] = useState(() => {
    const hoy = fechaHora(hoySV());
    return { anio: hoy.getUTCFullYear(), mes: hoy.getUTCMonth() };
  });
  const [direccion, setDireccion] = useState(1);
  const [listo, setListo] = useState(false);

  // Estado inicial desde la URL (volver desde "Editar" o recargar no pierde nada).
  useEffect(() => {
    const inicial = leerSeleccion(location.search, SITE.duraciones, modalidades);
    if (!inicial.fecha) inicial.fecha = primerDiaReservable(agenda, inicial.horas);
    if (inicial.fecha) {
      const f = fechaHora(inicial.fecha);
      setMes({ anio: f.getUTCFullYear(), mes: f.getUTCMonth() });
    }
    setSel(inicial);
    setListo(true);
  }, []);

  useEffect(() => {
    if (listo) history.replaceState(history.state, "", `${location.pathname}${queryDe(sel)}`);
  }, [sel, listo]);

  const horarios: Horario[] = useMemo(
    () => (sel.fecha ? horariosDelDia(agenda, sel.fecha, sel.horas) : []),
    [agenda, sel.fecha, sel.horas],
  );
  const celdas = useMemo(() => cuadriculaMes(agenda, mes.anio, mes.mes, sel.horas), [agenda, mes, sel.horas]);

  // Si cambia la duración y el horario elegido ya no cabe, se descarta.
  useEffect(() => {
    if (sel.inicio === null) return;
    const h = horarios.find((x) => x.inicio === sel.inicio);
    if (!h || h.estado !== "available") setSel((s) => ({ ...s, inicio: null }));
  }, [horarios]);

  const hoy = hoySV();
  const mesActual = fechaHora(hoy);
  const puedeRetroceder = mes.anio > mesActual.getUTCFullYear() || mes.mes > mesActual.getUTCMonth();
  const cambiarMes = (delta: number) => {
    setDireccion(delta);
    setMes(({ anio, mes }) => {
      const d = new Date(Date.UTC(anio, mes + delta, 1));
      return { anio: d.getUTCFullYear(), mes: d.getUTCMonth() };
    });
  };

  const continuarHref = completa(sel) ? `/modelos/${slug}/pagar${queryDe(sel)}` : null;

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="grid gap-6 xl:grid-cols-[834fr_392fr] xl:gap-[1.44vw]">
        <div className="@container">
          <section
            aria-label="Elige tu reserva"
            className="glass flex flex-col gap-6 rounded-[24px] p-4 sm:p-6 xl:gap-[1.4cqw] xl:rounded-[3.2cqw] xl:p-[2.8cqw]"
          >
            <div className="flex flex-col gap-6 xl:flex-row xl:justify-between xl:gap-[2cqw]">
              {/* 1. Duración */}
              <div className="flex flex-col gap-2 xl:gap-[1.4cqw]">
                <Titulo>1. Duración del servicio</Titulo>
                <div role="radiogroup" aria-label="Duración" className="grid grid-cols-2 gap-3 xl:w-[35.7cqw] xl:gap-[1.35cqw]">
                  {SITE.duraciones.map((h) => {
                    const activo = sel.horas === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        onClick={() => setSel((s) => ({ ...s, horas: h }))}
                        className={`${pill} ${activo ? "" : "glass"} h-[52px] text-[17px] xl:h-[6.4cqw] xl:text-[2.17cqw]`}
                      >
                        {activo && <Seleccionado id="duracion" />}
                        {formatDuracion(h)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Modalidad */}
              <div className="flex flex-col gap-2 xl:w-[36cqw] xl:gap-[1.4cqw]">
                <Titulo>2. Modalidad</Titulo>
                <div role="radiogroup" aria-label="Modalidad" className="flex flex-wrap gap-2 xl:flex-nowrap xl:gap-[0.8cqw]">
                  {modalidades.map((mod) => {
                    const activo = sel.modalidad === mod;
                    return (
                      <button
                        key={mod}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        onClick={() => setSel((s) => ({ ...s, modalidad: mod }))}
                        className={`${pill} ${activo ? "" : "glass"} inline-flex items-center gap-2 px-4 py-2.5 text-[15px] xl:gap-[1.4cqw] xl:px-[2.5cqw] xl:py-[1.3cqw] xl:text-[2cqw]`}
                      >
                        {activo && <Seleccionado id="modalidad" />}
                        {mod === "domicilio" ? (
                          <Heel className="h-[24px] w-auto min-w-0 xl:h-[3.4cqw]" />
                        ) : (
                          <Building className="h-[24px] w-auto min-w-0 xl:h-[3.4cqw]" />
                        )}
                        {ETIQUETA_MODALIDAD[mod]}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[13px] text-ink/60 xl:text-[1.8cqw]">A domicilio: la dirección se coordina por WhatsApp.</p>
              </div>
            </div>

            {/* 3. Fecha y horario */}
            <div className="flex flex-col gap-3 xl:gap-[1.4cqw]">
              <Titulo>3. Fecha y horario</Titulo>
              <div className="flex flex-col gap-6 xl:flex-row xl:gap-[2.4cqw]">
                <div className="glass @container/cal w-full rounded-[22px] p-3 sm:p-4 xl:w-[50.5cqw] xl:shrink-0 xl:rounded-[3.2cqw] xl:p-[2.8cqw]">
                  <div className="flex h-12 items-center justify-between px-2 xl:h-[13cqw] xl:px-[3.5cqw]">
                    <button
                      type="button"
                      aria-label="Mes anterior"
                      disabled={!puedeRetroceder}
                      onClick={() => cambiarMes(-1)}
                      className="grid size-9 place-items-center rounded-full font-display text-[24px] transition-opacity hover:bg-white/10 disabled:opacity-25 xl:size-[10cqw] xl:text-[5.7cqw]"
                    >
                      ‹
                    </button>
                    <span className="text-[18px] font-semibold xl:text-[5.3cqw]" aria-live="polite">
                      {formatMes(mes.anio, mes.mes)}
                    </span>
                    <button
                      type="button"
                      aria-label="Mes siguiente"
                      onClick={() => cambiarMes(1)}
                      className="grid size-9 place-items-center rounded-full font-display text-[24px] hover:bg-white/10 xl:size-[10cqw] xl:text-[5.7cqw]"
                    >
                      ›
                    </button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-[13px] leading-8 text-muted xl:text-[3.2cqw] xl:leading-[7.7cqw]" aria-hidden="true">
                    {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false} custom={direccion}>
                      <m.div
                        key={`${mes.anio}-${mes.mes}`}
                        custom={direccion}
                        variants={{
                          entra: (d: number) => ({ x: `${d * 40}%`, opacity: 0 }),
                          centro: { x: 0, opacity: 1 },
                          sale: (d: number) => ({ x: `${d * -40}%`, opacity: 0 }),
                        }}
                        initial="entra"
                        animate="centro"
                        exit="sale"
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="grid grid-cols-7 gap-1 xl:gap-[1.24cqw]"
                      >
                        {celdas.map((c) => {
                          const activo = sel.fecha === c.fecha;
                          const deshabilitado = c.estado === "disabled" || c.estado === "outside";
                          return (
                            <button
                              key={c.fecha}
                              type="button"
                              disabled={deshabilitado}
                              aria-pressed={activo}
                              aria-label={formatFecha(c.fecha)}
                              onClick={() => setSel((s) => ({ ...s, fecha: c.fecha, inicio: null }))}
                              className={[
                                "relative isolate aspect-square rounded-[10px] text-[16px] transition-colors xl:rounded-[2.4cqw] xl:text-[4cqw]",
                                deshabilitado ? "text-muted/60" : "text-ink hover:bg-white/10",
                                c.estado === "today" && !activo ? "ring-1 ring-inset ring-red/70" : "",
                                c.estado === "outside" ? "opacity-50" : "",
                              ].join(" ")}
                            >
                              {activo && <Seleccionado id="dia" />}
                              {c.dia}
                            </button>
                          );
                        })}
                      </m.div>
                    </AnimatePresence>
                  </div>
                </div>

                <span className="hidden w-px shrink-0 self-stretch bg-soft-border xl:block" aria-hidden="true" />

                <div className="flex min-w-0 flex-1 flex-col gap-3 xl:gap-[1.2cqw]">
                  <p className="text-[24px] font-medium leading-tight xl:text-[3.56cqw] xl:leading-[7.1cqw]">
                    {sel.fecha ? formatFecha(sel.fecha) : "Elige una fecha"}
                  </p>
                  <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] xl:gap-x-[1.1cqw] xl:text-[1.57cqw]" aria-label="Leyenda">
                    <li className="flex items-center gap-1.5">
                      <span className="size-3 rounded-full border border-white/50 bg-white/15 xl:size-[1.54cqw]" /> Disponible
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="bg-cta size-3 rounded-full xl:size-[1.54cqw]" /> Seleccionado
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Lock className="h-[15px] w-auto min-w-0 xl:h-[1.94cqw]" /> Bloqueado
                    </li>
                  </ul>
                  {horarios.length === 0 ? (
                    <p className="glass rounded-[18px] p-4 text-[15px] text-ink/75 xl:text-[1.9cqw]">
                      No hay horarios para este día. Elige otra fecha en el calendario.
                    </p>
                  ) : (
                    <div role="radiogroup" aria-label="Horario de inicio" className="grid grid-cols-2 gap-3 xl:max-h-[40cqw] xl:gap-[1.75cqw] xl:overflow-y-auto xl:pr-1">
                      {horarios.map((h) => {
                        const activo = sel.inicio === h.inicio;
                        const libre = h.estado === "available";
                        return (
                          <button
                            key={h.inicio}
                            type="button"
                            role="radio"
                            aria-checked={activo}
                            disabled={!libre}
                            title={libre ? undefined : h.estado === "past" ? "Este horario ya pasó" : "No disponible"}
                            onClick={() => setSel((s) => ({ ...s, inicio: h.inicio }))}
                            className={`${pill} ${activo ? "" : "glass"} flex h-[54px] items-center justify-center gap-2 text-[18px] disabled:opacity-40 xl:h-[6.5cqw] xl:text-[2.33cqw]`}
                          >
                            {activo && <Seleccionado id="horario" />}
                            {!libre && <Lock className="h-[14px] w-auto min-w-0 xl:h-[1.8cqw]" />}
                            {formatHora(h.inicio)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <Resumen nombre={nombre} zona={zona} tarifaHora={tarifaHora} seleccion={sel}>
          {continuarHref ? (
            <a
              href={continuarHref}
              className="group flex h-[56px] items-center justify-center gap-3 rounded-full bg-red text-[19px] font-medium text-ink transition-[transform,filter] hover:brightness-110 active:scale-[0.97] xl:h-[16.6cqw] xl:text-[5.9cqw]"
            >
              Continuar a pagar
              <ChevronRight className="h-[15px] w-auto min-w-0 transition-transform group-hover:translate-x-1 xl:h-[4.1cqw]" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-[56px] items-center justify-center gap-3 rounded-full bg-rim text-[19px] font-medium text-muted xl:h-[16.6cqw] xl:text-[5.9cqw]"
            >
              {sel.modalidad ? "Elige fecha y horario" : "Elige la modalidad"}
            </button>
          )}
          <p className="text-[14px] text-ink xl:text-[4.35cqw]">🔒 Tu información se mantiene privada.</p>
        </Resumen>
      </div>
    </LazyMotion>
  );
}
