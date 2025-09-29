import { Page, Locator, expect } from '@playwright/test';

export class MyTicketsPage {
  constructor(private readonly page: Page) {
    // Page object constructor - page is used in methods
  }

  // Locators
  private get abrirChamadoButton(): Locator {
    return this.page.getByText('Abrir chamado');
  }

  private get monitoramentoLavouraOption(): Locator {
    return this.page.getByRole('menuitem', { name: 'Monitoramento de lavoura' });
  }

  // Actions
  async clickAbrirChamado(): Promise<void> {
    await this.abrirChamadoButton.click();
    console.log('✅ Clicou em "Abrir chamado"');
  }

  async selectMonitoramentoLavoura(): Promise<void> {
    await this.monitoramentoLavouraOption.click();
    console.log('✅ Clicou em "Monitoramento de lavoura"');
  }

  // Validations
  async validateOnMonitoramentoPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/abrir-chamado\/monitoramento-lavoura/);
    console.log('✅ Validou URL da tela de monitoramento de lavoura');
  }
}
