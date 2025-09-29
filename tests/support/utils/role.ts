// tests/support/utils/role.ts
import { Page, expect } from '@playwright/test';
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function assertRoleLabelExact(page: Page, expectedLabel: string) {
  await page.goto('/?login=true', { waitUntil: 'domcontentloaded' });
  const locator = page.getByText(new RegExp(`^${esc(expectedLabel)}$`, 'i')).first();
  await expect(locator, `Esperava ver o rótulo exato "${expectedLabel}"`).toBeVisible({
    timeout: 15000,
  });
}
