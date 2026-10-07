import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { DEPARTAMENTO_IDS } from "./data/el-salvador";

const rangoHorario = z
  .string()
  .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Usa el formato "HH:MM-HH:MM", por ejemplo "18:00-04:00"');

const dias = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] as const;

/**
 * Cada modelo es una carpeta en src/content/modelos/<slug>/ con un index.md y sus fotos.
 * Si falta un dato obligatorio (o la edad es menor de 18) el build falla y no se publica.
 */
const modelos = defineCollection({
  loader: glob({ pattern: "*/index.md", base: "./src/content/modelos" }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string().min(1),
      /** `inactiva` la oculta del listado y desactiva su reserva. */
      estado: z.enum(["activa", "inactiva"]).default("activa"),
      /** Posición en la grilla de la home (menor = primero). */
      orden: z.number().int().default(99),
      frase: z.string().max(140),
      /** Si se indica, debe ser ≥ 18 (la verificación con DUI se hace fuera del sitio). */
      edad: z.number().int().min(18, "Solo se publican perfiles de mayores de 18 años").optional(),
      /** Estatura en centímetros. */
      estatura: z.number().int().min(120).max(220).optional(),
      tatuajes: z.boolean().optional(),
      idiomas: z.array(z.string()).default(["Español"]),
      cobertura: z.array(z.enum(DEPARTAMENTO_IDS)).min(1),
      modalidades: z.array(z.enum(["domicilio", "presencial"])).min(1),
      /** Precio en USD por hora; el total de la reserva es horas × tarifa. */
      tarifaHora: z.number().positive(),
      incluye: z.string().optional(),
      /** La primera foto es la portada (tarjeta y primera del carrusel). */
      fotos: z.array(z.object({ src: image(), alt: z.string().optional() })).min(1),
      /** Disponibilidad semanal en hora de El Salvador. Un rango puede cruzar la medianoche. */
      horario: z.record(z.enum(dias), z.array(rangoHorario)).default({}),
      /** Fechas sin agenda, "AAAA-MM-DD". */
      bloqueos: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).default([]),
      /** Horarios ya reservados, "AAAA-MM-DDTHH:MM". */
      ocupados: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)).default([]),
    }),
});

export const collections = { modelos };
