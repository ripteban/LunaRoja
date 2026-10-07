import { describe, expect, it } from "vitest";
import { cuadriculaMes, diaReservable, horariosDelDia, primerDiaReservable, type Agenda } from "../../src/lib/availability";
import { formatFecha, formatHora, formatMes, formatRango } from "../../src/lib/format";
import { mensajeReserva, linkWhatsApp } from "../../src/lib/whatsapp";

const agenda: Agenda = {
  horario: { vie: ["18:00-04:00"], sab: ["18:00-04:00"] },
  bloqueos: [],
  ocupados: [],
  activa: true,
};
// Jueves 1 de octubre de 2026, 12:00 en El Salvador (18:00 UTC).
const jueves = new Date("2026-10-01T18:00:00Z");

describe("horariosDelDia", () => {
  it("genera bloques de 18:00 a 03:00 cruzando la medianoche", () => {
    const h = horariosDelDia(agenda, "2026-10-02", 1, jueves);
    expect(h.map((x) => formatHora(x.inicio))).toEqual([
      "06:00 p.m.", "07:00 p.m.", "08:00 p.m.", "09:00 p.m.", "10:00 p.m.",
      "11:00 p.m.", "12:00 a.m.", "01:00 a.m.", "02:00 a.m.", "03:00 a.m.",
    ]);
    expect(h.every((x) => x.estado === "available")).toBe(true);
  });

  it("marca como no disponibles los inicios que no caben en el turno", () => {
    const h = horariosDelDia(agenda, "2026-10-02", 3, jueves);
    const noCaben = h.filter((x) => x.estado === "unavailable").map((x) => formatHora(x.inicio));
    expect(noCaben).toEqual(["02:00 a.m.", "03:00 a.m."]);
  });

  it("bloquea todos los inicios cuyo rango toca un horario ocupado", () => {
    const conOcupado = { ...agenda, ocupados: ["2026-10-02T20:00"] };
    const h = horariosDelDia(conOcupado, "2026-10-02", 2, jueves);
    const ocupados = h.filter((x) => x.estado === "occupied").map((x) => formatHora(x.inicio));
    expect(ocupados).toEqual(["07:00 p.m.", "08:00 p.m."]);
  });

  it("la madrugada ocupada se guarda con la fecha real del día siguiente", () => {
    const conOcupado = { ...agenda, ocupados: ["2026-10-03T01:00"] };
    const h = horariosDelDia(conOcupado, "2026-10-02", 1, jueves);
    expect(h.find((x) => x.inicio === 25 * 60)?.estado).toBe("occupied");
  });

  it("marca como pasados los horarios antes de ahora + margen", () => {
    const viernes1930 = new Date("2026-10-03T01:30:00Z"); // 19:30 SV del viernes
    const h = horariosDelDia(agenda, "2026-10-02", 1, viernes1930);
    expect(h.filter((x) => x.estado === "past").map((x) => formatHora(x.inicio))).toEqual([
      "06:00 p.m.", "07:00 p.m.", "08:00 p.m.",
    ]);
  });

  it("no ofrece horarios en días bloqueados o modelos inactivas", () => {
    expect(horariosDelDia({ ...agenda, bloqueos: ["2026-10-02"] }, "2026-10-02", 1, jueves)).toEqual([]);
    expect(horariosDelDia({ ...agenda, activa: false }, "2026-10-02", 1, jueves)).toEqual([]);
  });
});

describe("calendario", () => {
  it("encuentra el primer día reservable", () => {
    expect(primerDiaReservable(agenda, 1, jueves)).toBe("2026-10-02");
    expect(diaReservable(agenda, "2026-10-01", 1, jueves)).toBe(false);
  });

  it("arma la cuadrícula de octubre 2026 empezando en lunes 28 de septiembre", () => {
    const celdas = cuadriculaMes(agenda, 2026, 9, 1, jueves);
    expect(celdas[0]).toMatchObject({ fecha: "2026-09-28", estado: "outside" });
    expect(celdas.length % 7).toBe(0);
    expect(celdas.find((c) => c.fecha === "2026-10-02")?.estado).toBe("default");
    expect(celdas.find((c) => c.fecha === "2026-10-05")?.estado).toBe("disabled");
  });
});

describe("formato y WhatsApp", () => {
  it("formatea como en el Figma", () => {
    expect(formatFecha("2026-10-02")).toBe("Viernes, 2 de octubre");
    expect(formatMes(2026, 9)).toBe("Octubre 2026");
    expect(formatRango(19 * 60, 1)).toBe("07:00 p.m. – 08:00 p.m.");
  });

  it("arma el mensaje y el link de WhatsApp", () => {
    const texto = mensajeReserva({
      modelo: "Alana", horas: 1, modalidad: "domicilio", fecha: "2026-10-02",
      inicio: 19 * 60, zona: "San Salvador", pago: "Efectivo", total: 100,
    });
    expect(texto).toContain("• Horario: 07:00 p.m. – 08:00 p.m.");
    expect(texto).toContain("Total: $100");
    expect(linkWhatsApp(texto)).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  });
});
