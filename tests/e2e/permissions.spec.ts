import { test, expect } from '@playwright/test';

// Todos os 13 roles do sistema
const ALL_ROLES = [
  { name: 'admin', label: 'Administrador', storage: 'storage/admin.json' },
  { name: 'n1', label: 'Analista N1', storage: 'storage/n1.json' },
  { name: 'n2', label: 'Analista N2', storage: 'storage/n2.json' },
  { name: 'n3', label: 'Supervisor N3', storage: 'storage/n3.json' },
  { name: 'auditor', label: 'Auditor', storage: 'storage/auditor.json' },
  { name: 'agricultor', label: 'Agricultor', storage: 'storage/agricultor.json' },
  { name: 'rtv', label: 'RTVs', storage: 'storage/rtv.json' },
  { name: 'rti', label: 'RTVi', storage: 'storage/rti.json' },
  { name: 'b2b', label: 'B2B', storage: 'storage/b2b.json' },
  { name: 'avaliador', label: 'Avaliador', storage: 'storage/avaliador.json' },
  {
    name: 'avaliados_cashback',
    label: 'Avaliador Cashback',
    storage: 'storage/avaliados_cashback.json',
  },
  { name: 'multiplicador', label: 'Multiplicador', storage: 'storage/multiplicador.json' },
  { name: 'distribuidor', label: 'Distribuidor', storage: 'storage/distribuidor.json' },
];

// Função utilitária para validação de rótulo
async function assertRoleLabel(page: any, expectedLabel: string) {
  await page.goto('/?login=true', { waitUntil: 'domcontentloaded' });
  const locator = page
    .getByText(new RegExp(`^${expectedLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'))
    .first();
  await expect(locator, `Esperava ver o rótulo exato "${expectedLabel}"`).toBeVisible({
    timeout: 15000,
  });
}

// Gerar testes dinamicamente para todos os 13 roles
ALL_ROLES.forEach(role => {
  test.describe(`Permissionamento | ${role.name.toUpperCase()}`, () => {
    // Configurar storage state para cada role
    test.use({ storageState: role.storage });

    test(
      `LOGIN: ${role.name} vê rótulo "${role.label}" no topo`,
      {
        tag: ['@permissions', '@smoke', `@role-${role.name}`],
        annotation: [
          { type: 'role', description: role.name },
          { type: 'expected-label', description: role.label },
          { type: 'storage-file', description: role.storage },
          { type: 'test-type', description: 'authentication-validation' },
        ],
      },
      async ({ page }) => {
        await assertRoleLabel(page, role.label);
      },
    );
  });
});
