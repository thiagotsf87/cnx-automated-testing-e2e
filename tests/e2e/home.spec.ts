import { test, expect } from '@playwright/test';

test('login cnx', async ({ page }) => {
  const baseUrl = process.env.BASE_URL;
  const adminCpf = process.env.ADMIN_CPF;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Verificar variáveis de ambiente
  expect(baseUrl).toBeDefined();
  expect(adminCpf).toBeDefined();
  expect(adminPassword).toBeDefined();

  await page.goto(baseUrl!);
  await expect(page).toHaveTitle('v1.886.2 - Conexão Biotec');

  const loginUser = page.locator('input[name="document"]');
  const loginPassword = page.locator('input[name="password"]');

  await loginUser.fill(adminCpf!);
  await loginPassword.fill(adminPassword!);
  await page.click('css=button >> text=ENTRAR');
});
