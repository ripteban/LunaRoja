import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "./ui/icons";

const CLAVE = "lr_age_ok";

function aceptado(): boolean {
  try {
    if (document.cookie.split("; ").some((c) => c === `${CLAVE}=1`)) return true;
    return localStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}

function recordar() {
  try {
    document.cookie = `${CLAVE}=1; max-age=${60 * 60 * 24 * 30}; path=/; samesite=lax`;
    localStorage.setItem(CLAVE, "1");
  } catch {
    /* modo privado: se volverá a preguntar en la próxima visita */
  }
}

const Rojo = ({ children }: { children: React.ReactNode }) => (
  <strong className="bg-cta bg-clip-text font-semibold text-transparent">{children}</strong>
);

/** Aviso legal +18 del Figma (nodo 320:298). Se muestra hasta que el usuario presiona "Entrar". */
export default function AgeGate() {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aceptado()) setAbierto(true);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    boton.current?.focus({ preventScroll: true });
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [abierto]);

  const entrar = () => {
    recordar();
    setAbierto(false);
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {abierto && (
          <m.div
            key="aviso"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aviso-titulo"
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-bg/80 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            <m.div
              className="relative flex w-full max-w-[1775px] flex-col items-center gap-6 overflow-hidden rounded-[40px] bg-black/65 px-6 py-8 shadow-[inset_0_-2px_18.4px_rgb(234_21_21/0.4),inset_0_2px_16.1px_rgb(255_255_255/0.24)] sm:rounded-[64px] sm:p-10 lg:gap-[39px] lg:rounded-[100px] lg:p-[50px]"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <h2 id="aviso-titulo" className="text-center text-[22px] font-semibold leading-tight sm:text-[32px] lg:text-[clamp(32px,2.53vw,48.5px)]">
                AVISO IMPORTANTE ANTES DE “ENTRAR”
              </h2>
              <div className="space-y-5 text-[15px] font-light leading-snug text-white sm:text-[19px] lg:text-[clamp(19px,1.56vw,30px)]">
                <p>
                  Al presionar el botón de <Rojo>“ENTRAR”</Rojo>, el usuario <Rojo>ACEPTA Y CERTIFICA QUE ES MAYOR DE 18 AÑOS</Rojo> y
                  exonera al proveedor de servicios, propietarios y creadores de <Rojo>“Luna Roja”</Rojo> de toda responsabilidad por el
                  contenido subido y compartido en el sitio web y por el uso de este servicio.
                </p>
                <p>
                  Somos Luna Roja y nuestro objetivo es de entretenimiento y diversión, donde <Rojo>NO PUBLICAMOS</Rojo> material que
                  promueva la <Rojo>Trata de Personas, Violaciones y Abusos Sexuales, Etc.</Rojo> Es decir, material relacionado con
                  cualquier <Rojo>actividad sexual no consentida</Rojo>, que atente contra la libertad sexual o dignidad de las personas, y
                  que pueda ser constitutiva de delito.
                </p>
                <p>
                  Toda publicación, material como fotos y videos es{" "}
                  <Rojo>
                    CONSENTIDO Y APROBADO POR NUESTRO STAFF DE SEÑORITAS, por lo tanto, nos dan los derechos y autorizaciones para su
                    publicación.
                  </Rojo>{" "}
                  Siempre promovemos y contratamos chicas desde los 18 años en adelante, exigiendo el Documento Único de Identidad (DUI).
                </p>
              </div>
              <button
                ref={boton}
                type="button"
                onClick={entrar}
                className="group bg-cta inline-flex h-[64px] items-center justify-center gap-4 rounded-full px-16 text-[22px] font-medium text-ink transition-transform duration-200 active:scale-[0.97] lg:h-[clamp(72px,5.9vw,113px)] lg:px-[clamp(80px,8vw,155px)] lg:text-[clamp(24px,1.89vw,36px)]"
              >
                Entrar
                <ChevronRight className="h-[0.75em] w-auto transition-transform group-hover:translate-x-1" />
              </button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
