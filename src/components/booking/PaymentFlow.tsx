import { LazyMotion, domAnimation, m, useAnimationControls } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { SITE, type MetodoPago } from "../../config/site";
import { horariosDelDia, type Agenda } from "../../lib/availability";
import { completa, leerSeleccion, queryDe, type Modalidad, type Seleccion } from "../../lib/reserva-url";
import { linkWhatsApp, mensajeReserva } from "../../lib/whatsapp";
import { BadgeCheck, LockClock, WhatsApp } from "../ui/icons";
import Resumen from "./Resumen";

interface Ilustracion {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

interface Props {
  slug: string;
  nombre: string;
  zona: string;
  tarifaHora: number;
  modalidades: Modalidad[];
  agenda: Agenda;
  ilustraciones: Record<MetodoPago, Ilustracion>;
}

const METODOS: { id: MetodoPago; titulo: string; pie: string; orden: string }[] = [
  { id: "efectivo", titulo: "Efectivo", pie: "Pagas al momento del encuentro.", orden: "order-1" },
  { id: "tarjeta", titulo: "Tarjeta", pie: "Visa · Mastercard", orden: "order-3 xl:order-2" },
  { id: "transferencia", titulo: "Transferencia", pie: "Bancos de El Salvador", orden: "order-4 xl:order-3" },
];

function TarjetaMetodo({
  titulo,
  pie,
  imagen,
  activo,
  habilitado,
  seleccionado,
  onElegir,
  className,
}: {
  titulo: string;
  pie: string;
  imagen: Ilustracion;
  activo: boolean;
  habilitado: boolean;
  seleccionado: boolean;
  onElegir: () => void;
  className: string;
}) {
  const sacudir = useAnimationControls();
  const alTocar = () => {
    if (habilitado) onElegir();
    else sacudir.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
  };
  return (
    <div className={`@container ${className}`}>
      <m.button
        type="button"
        animate={sacudir}
        onClick={alTocar}
        aria-pressed={seleccionado}
        aria-disabled={!habilitado}
        aria-label={habilitado ? `Pagar con ${titulo}` : `${titulo}: próximamente`}
        className={[
          "glass relative flex aspect-[364/340] w-full flex-col items-center justify-between overflow-hidden rounded-[7.2cqw] p-[5cqw] text-center transition-[box-shadow,border-color] duration-300 xl:aspect-[398/744] xl:p-[6.4cqw]",
          activo ? "border-[2.5px] border-red shadow-[0_0_36px_rgb(255_51_72/0.3)]" : "border-[2.5px] border-transparent",
          habilitado ? "cursor-pointer" : "cursor-not-allowed",
        ].join(" ")}
      >
        <span className={`font-script leading-tight text-white ${titulo.length > 10 ? "text-[13cqw] xl:text-[21.6cqw]" : "text-[14cqw] xl:text-[23.6cqw]"}`}>
          {titulo}
        </span>
        <img
          src={imagen.src}
          srcSet={imagen.srcset}
          sizes="(min-width: 1280px) 20vw, 80vw"
          width={imagen.width}
          height={imagen.height}
          alt=""
          loading="lazy"
          decoding="async"
          className={`h-auto w-[52%] transition-transform xl:w-[87%] duration-500 ${habilitado ? "group-hover:scale-105" : ""}`}
        />
        <span className="relative z-10 text-[4.4cqw] text-ink/75 xl:text-[4.5cqw]">{pie}</span>

        {seleccionado && (
          <m.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute right-[5.4cqw] top-[4.9cqw] size-[10cqw]"
          >
            <BadgeCheck className="size-full min-w-0" />
          </m.span>
        )}

        {!habilitado && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-[5cqw] bg-[rgb(10_7_17/0.71)] pb-[8cqw]">
            <LockClock className="h-[34cqw] w-auto min-w-0 text-white xl:h-[57.8cqw]" />
            <span className="rounded-full border-[1.2px] border-white/30 bg-white/12 px-[5.5cqw] py-[2.5cqw] text-[4.5cqw] font-medium text-ink">
              Próximamente
            </span>
          </span>
        )}
      </m.button>
    </div>
  );
}

/** Paso "Selecciona tu método de pago" (503:1058 desktop / 522:1008 móvil). */
export default function PaymentFlow({ slug, nombre, zona, tarifaHora, modalidades, agenda, ilustraciones }: Props) {
  const [sel, setSel] = useState<Seleccion | null>(null);
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");

  useEffect(() => {
    const s = leerSeleccion(location.search, SITE.duraciones, modalidades);
    const valido =
      completa(s) &&
      horariosDelDia(agenda, s.fecha, s.horas).some((h) => h.inicio === s.inicio && h.estado === "available");
    // Si alguien llega sin una selección válida, vuelve al paso anterior conservando lo que haya.
    if (!valido) {
      location.replace(`/modelos/${slug}/disponibilidad${queryDe(s)}`);
      return;
    }
    setSel(s);
  }, []);

  const etiquetaPago = METODOS.find((x) => x.id === metodo)!.titulo;
  const texto =
    sel && completa(sel)
      ? mensajeReserva({
          modelo: nombre,
          horas: sel.horas,
          modalidad: sel.modalidad,
          fecha: sel.fecha,
          inicio: sel.inicio,
          zona,
          pago: etiquetaPago,
          total: tarifaHora * sel.horas,
        })
      : "";

  const seleccionMostrada: Seleccion = sel ?? { horas: SITE.duraciones[0], modalidad: null, fecha: null, inicio: null };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="mx-auto grid max-w-[460px] gap-6 xl:max-w-none xl:grid-cols-[398fr_398fr_398fr_392fr] xl:gap-[1.44vw]">
        {METODOS.map((x) => (
          <TarjetaMetodo
            key={x.id}
            titulo={x.titulo}
            pie={x.pie}
            imagen={ilustraciones[x.id]}
            habilitado={SITE.pagos[x.id]}
            activo={metodo === x.id}
            seleccionado={metodo === x.id}
            onElegir={() => setMetodo(x.id)}
            className={`group ${x.orden}`}
          />
        ))}

        <div className="order-2 xl:order-4">
          <Resumen
            nombre={nombre}
            zona={zona}
            tarifaHora={tarifaHora}
            seleccion={seleccionMostrada}
            editarHref={`/modelos/${slug}/disponibilidad${sel ? queryDe(sel) : ""}`}
          >
            <Confirmar href={texto ? linkWhatsApp(texto) : undefined}>Confirmar por WhatsApp</Confirmar>
            <p className="text-[14px] text-ink xl:text-[4.35cqw]">🔒 Tu información se mantiene privada.</p>
            <p className="text-[13px] text-ink/60 xl:text-[3.83cqw]">
              Al confirmar se abrirá WhatsApp con tu reserva lista para enviar. Ahí coordinamos dirección y detalles.
            </p>
          </Resumen>
        </div>
      </div>
    </LazyMotion>
  );
}

function Confirmar({ href, children }: { href?: string; children: ReactNode }) {
  const cls =
    "flex h-[56px] items-center justify-center gap-3 rounded-full bg-red text-[18px] font-medium text-ink transition-[transform,filter] hover:brightness-110 active:scale-[0.97] xl:h-[16.6cqw] xl:text-[5.36cqw]";
  return href ? (
    <a href={href} target="_blank" rel="noopener" className={cls}>
      <WhatsApp className="size-[30px] min-w-0 xl:size-[8.5cqw]" />
      {children}
    </a>
  ) : (
    <span className={`${cls} opacity-60`} aria-disabled="true">
      <WhatsApp className="size-[30px] min-w-0 xl:size-[8.5cqw]" />
      {children}
    </span>
  );
}
