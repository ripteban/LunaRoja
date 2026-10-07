import { expect, test } from "@playwright/test";

test("el aviso +18 aparece la primera vez y se recuerda al entrar", async ({ page }) => {
  await page.goto("/");
  const aviso = page.getByRole("dialog", { name: /aviso importante/i });
  await expect(aviso).toBeVisible();
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(aviso).toBeHidden();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("reserva completa hasta el mensaje de WhatsApp", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lr_age_ok", "1"));
  await page.goto("/");

  await expect(page.getByRole("link", { name: /ver perfil de/i })).toHaveCount(6);
  await page.getByRole("link", { name: "Ver perfil de Alana" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Alana" })).toBeVisible();

  await page.getByRole("link", { name: /consultar disponibilidad/i }).click();
  await expect(page).toHaveURL(/\/modelos\/alana\/disponibilidad/);

  await page.getByRole("radio", { name: "2 horas" }).click();
  await page.getByRole("radio", { name: "Presencial" }).click();
  // El primer día reservable ya viene elegido; tomamos el primer horario libre.
  const horario = page.getByRole("radiogroup", { name: "Horario de inicio" }).getByRole("radio").and(page.locator(":enabled")).first();
  const hora = (await horario.textContent())!.trim();
  await horario.click();

  const resumen = page.getByRole("complementary");
  await expect(resumen).toContainText("2 horas");
  await expect(resumen).toContainText("Presencial");
  await expect(resumen).toContainText("$200");

  await page.getByRole("link", { name: /continuar a pagar/i }).click();
  await expect(page).toHaveURL(/\/pagar\?h=2&m=presencial/);

  const confirmar = page.getByRole("link", { name: /confirmar por whatsapp/i });
  const href = decodeURIComponent((await confirmar.getAttribute("href"))!);
  expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  expect(href).toContain("• Modelo: Alana");
  expect(href).toContain("• Duración: 2 horas");
  expect(href).toContain("• Modalidad: Presencial");
  expect(href).toContain(`• Horario: ${hora}`);
  expect(href).toContain("• Pago: Efectivo");
  expect(href).toContain("Total: $200");
});

test("pagar sin selección vuelve a disponibilidad", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lr_age_ok", "1"));
  await page.goto("/modelos/sirse/pagar");
  await expect(page).toHaveURL(/\/modelos\/sirse\/disponibilidad/);
});
