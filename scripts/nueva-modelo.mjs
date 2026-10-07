// Crea la carpeta de una modelo nueva con su archivo de datos listo para llenar.
// Uso: npm run nueva-modelo -- <slug> ["Nombre visible"]
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [slugArg, nombreArg] = process.argv.slice(2);
if (!slugArg) {
  console.error('Uso: npm run nueva-modelo -- <slug> ["Nombre"]\nEjemplo: npm run nueva-modelo -- sofia Sofía');
  process.exit(1);
}
const slug = slugArg
  .toLowerCase()
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const nombre = nombreArg ?? slugArg.charAt(0).toUpperCase() + slugArg.slice(1);
const dir = join("src", "content", "modelos", slug);

if (existsSync(dir)) {
  console.error(`Ya existe ${dir}`);
  process.exit(1);
}
mkdirSync(join(dir, "fotos"), { recursive: true });
writeFileSync(
  join(dir, "index.md"),
  `---
nombre: ${nombre}
estado: activa            # activa | inactiva (inactiva = no aparece en el sitio)
orden: 99                 # posición en la grilla (menor = primero)
frase: "Escribe aquí una frase corta de presentación."
# edad: 18                # si se indica, debe ser 18 o más
# estatura: 165           # en centímetros
# tatuajes: false
idiomas: [Español]
cobertura: [san-salvador] # departamentos: san-salvador, la-libertad, santa-ana, ...
modalidades: [domicilio, presencial]
tarifaHora: 100           # USD por hora
incluye: "Información por completar"
fotos:                    # la primera es la portada; copia los archivos a ./fotos/
  - src: ./fotos/01.jpg
horario:                  # hora de El Salvador; un rango puede cruzar la medianoche
  lun: ["18:00-04:00"]
  mar: ["18:00-04:00"]
  mie: ["18:00-04:00"]
  jue: ["18:00-04:00"]
  vie: ["18:00-04:00"]
  sab: ["18:00-04:00"]
  dom: ["18:00-04:00"]
bloqueos: []              # días sin agenda, "AAAA-MM-DD"
ocupados: []              # horarios ya reservados, "AAAA-MM-DDTHH:MM"
---

Aquí irá la presentación personal de ${nombre}.
`,
);
console.log(`✔ Creada ${dir}
  1. Copia las fotos (con el rostro ya difuminado) a ${join(dir, "fotos")}/01.jpg, 02.jpg, …
  2. Completa ${join(dir, "index.md")}
  3. npm run dev  →  http://localhost:4321/modelos/${slug}`);
