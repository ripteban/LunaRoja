import { getCollection, type CollectionEntry } from "astro:content";
import type { Agenda } from "./availability";
import { DEPARTAMENTOS } from "../data/el-salvador";

export type Modelo = CollectionEntry<"modelos">;

/** Modelos activas, en el orden de la grilla. */
export async function modelosActivas(): Promise<Modelo[]> {
  const todas = await getCollection("modelos", (m) => m.data.estado === "activa");
  return todas.sort((a, b) => a.data.orden - b.data.orden || a.data.nombre.localeCompare(b.data.nombre));
}

/** Parte serializable de la agenda que se pasa a las islas de React. */
export function agendaDe(m: Modelo): Agenda {
  return {
    horario: m.data.horario,
    bloqueos: m.data.bloqueos,
    ocupados: m.data.ocupados,
    activa: m.data.estado === "activa",
  };
}

/** "San Salvador" / "San Salvador y La Libertad" */
export function zonaDe(m: Modelo): string {
  const nombres = m.data.cobertura.map((id) => DEPARTAMENTOS[id].nombre);
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}` : nombres[0];
}
