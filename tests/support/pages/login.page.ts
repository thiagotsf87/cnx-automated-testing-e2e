import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {
    // Page object constructor - page is used in methods
  }

  async goto() {
    await this.page.goto('/?login=true', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveTitle(/Conexão Biotec/i);
  }

  async login(cpf: string, password: string) {
    await this.page.locator('input[name="document"]').fill(cpf);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.click('css=button >> text=ENTRAR');
  }
}
