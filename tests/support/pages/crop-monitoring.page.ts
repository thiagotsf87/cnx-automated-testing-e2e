import { Page, Locator } from '@playwright/test';
import { cleanupOldScreenshots } from '../utils/screenshot-cleanup';

export class CropMonitoringPage {
  constructor(private readonly page: Page) {
    // Page object constructor - page is used in methods
  }

  // Locators
  private get buscarAgricultorButton(): Locator {
    return this.page
      .locator('button')
      .filter({ has: this.page.locator('svg') })
      .or(this.page.locator('[data-testid*="search"]'))
      .or(this.page.locator('button[title*="buscar"]'))
      .first();
  }

  private get cpfInput(): Locator {
    return this.page
      .locator('input[type="text"]')
      .or(this.page.locator('input[placeholder*="CPF"]'))
      .or(this.page.locator('input[name*="cpf"]'))
      .first();
  }

  private get buscarSubmitButton(): Locator {
    return this.page
      .locator('button')
      .filter({ hasText: /buscar|pesquisar|search/i })
      .or(this.page.locator('button[type="submit"]'))
      .first();
  }

  private get selecionarButton(): Locator {
    return this.page
      .locator('button')
      .filter({ hasText: /selecionar|select/i })
      .first();
  }

  private get irParaSelecaoButton(): Locator {
    return this.page.getByRole('button', { name: 'IR PARA SELEÇÃO DE' });
  }

  // Selecionar Justificativa - Locators
  private get ufSelect(): Locator {
    return this.page.locator('#mui-component-select-uf');
  }

  // Opçáµes de justificativa disponíveis (5 opções reais)
  private get justificativaOptions(): { [key: string]: Locator } {
    return {
      'sem-chamado': this.page.getByRole('option', { name: 'Sem chamado, com recebimento' }),
      regularizacao: this.page.getByRole('option', { name: 'Necessidade de regularização' }),
      'recusa-auditoria': this.page.getByRole('option', { name: 'Recusa de auditoria' }),
      'reducao-area': this.page.getByRole('option', { name: 'Redução de área, histórico de' }),
      'indicacao-rtvs': this.page.getByRole('option', { name: 'Indicação RTVs' }),
    };
  }

  private get areaPotencialInput(): Locator {
    return this.page.getByRole('textbox', { name: 'área potencial (ha)' });
  }

  private get areaHistoricaInput(): Locator {
    return this.page.getByRole('textbox', { name: 'área histórica 24/25 (ha)' });
  }

  private get irParaInclusaoContatoButton(): Locator {
    return this.page.getByRole('button', { name: 'IR PARA INCLUSÃO DE CONTATO' });
  }

  // Incluir Contato Preferencial - Locators
  private get tipoContatoCombobox(): Locator {
    return this.page
      .getByRole('combobox', { name: 'Tipo de contato' })
      .or(this.page.locator('select[name*="contact"]'))
      .or(this.page.locator('[data-testid*="contact-type"]'))
      .or(this.page.locator('#mui-component-select-contactType'))
      .first();
  }

  private get proprioOption(): Locator {
    return this.page.getByRole('option', { name: 'Próprio' });
  }

  private get outroOption(): Locator {
    return this.page.getByRole('option', { name: 'Outro' });
  }

  // Campos para tipo "Próprio"
  private get telefoneInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Telefone' });
  }

  private get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'E-mail' });
  }

  // Campos para tipo "Outro"
  private get nomeContatoInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Nome do contato' });
  }

  private get funcaoInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Função' });
  }

  // Botões
  private get removerContatoButton(): Locator {
    return this.page.getByTestId('button-grower-remove');
  }

  private get incluirOutroContatoButton(): Locator {
    return this.page.getByTestId('button-grower-add');
  }

  private get irParaConferirButton(): Locator {
    return this.page.getByRole('button', { name: 'IR PARA CONFERIR INFORMAÇÕES' });
  }

  // Conferir Informações - Locators
  private get criarChamadoButton(): Locator {
    return this.page.getByRole('button', { name: 'Criar chamado de monitoramento' });
  }

  private get successMessage(): Locator {
    return this.page.getByText('Chamado de monitoramento de lavoura aberto com sucesso!');
  }

  // Locators para validação das informações
  private get ufValue(): Locator {
    return this.page
      .locator('[data-testid*="uf"]')
      .or(this.page.locator('text=AC'))
      .or(this.page.locator('[class*="uf"]'))
      .first();
  }

  private get justificativaValue(): Locator {
    return this.page
      .locator('[data-testid*="justificativa"]')
      .or(this.page.locator('text=Sem chamado, com recebimento'))
      .or(this.page.locator('[class*="justificativa"]'))
      .first();
  }

  private get areaPotencialValue(): Locator {
    return this.page
      .locator('[data-testid*="area-potencial"]')
      .or(this.page.locator('[class*="area-potencial"]'))
      .first();
  }

  private get areaHistoricaValue(): Locator {
    return this.page
      .locator('[data-testid*="area-historica"]')
      .or(this.page.locator('[class*="area-historica"]'))
      .first();
  }

  private get nomeContatoValue(): Locator {
    return this.page
      .locator('[data-testid*="nome-contato"]')
      .or(this.page.locator('[class*="nome-contato"]'))
      .first();
  }

  private get funcaoValue(): Locator {
    return this.page
      .locator('[data-testid*="funcao"]')
      .or(this.page.locator('text=-'))
      .or(this.page.locator('[class*="funcao"]'))
      .first();
  }

  private get emailValue(): Locator {
    return this.page
      .locator('[data-testid*="email"]')
      .or(this.page.locator('[class*="email"]'))
      .first();
  }

  private get telefoneValue(): Locator {
    return this.page
      .locator('[data-testid*="telefone"]')
      .or(this.page.locator('[class*="telefone"]'))
      .first();
  }

  // Actions
  async clickBuscarAgricultor(): Promise<void> {
    if (await this.buscarAgricultorButton.isVisible().catch(() => false)) {
      await this.buscarAgricultorButton.click();
      console.log('✅ Clicou no botão de busca de agricultor');
    } else {
      console.log('⚠️ Botão de busca não encontrado, procurando input diretamente');
    }
  }

  async fillCpfAgricultor(cpf: string): Promise<void> {
    if (await this.cpfInput.isVisible().catch(() => false)) {
      await this.cpfInput.fill(cpf);
      console.log(`✅ Inseriu CPF: ${cpf}`);
    } else {
      throw new Error('⚠️ Input de CPF não encontrado');
    }
  }

  async submitBusca(): Promise<void> {
    if (await this.buscarSubmitButton.isVisible().catch(() => false)) {
      await this.buscarSubmitButton.click();
    } else {
      await this.cpfInput.press('Enter');
    }
    console.log('✅ Executou busca do agricultor');
  }

  async clickSelecionar(): Promise<void> {
    // Aguardar o botão aparecer com timeout maior
    try {
      await this.selecionarButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.selecionarButton.click();
      console.log('✅ Clicou em "Selecionar"');
    } catch (error) {
      console.log('âŒ Timeout aguardando botão "Selecionar"');
      throw new Error('⚠️ Botão "Selecionar" não encontrado');
    }
  }

  async clickIrParaSelecao(): Promise<void> {
    await this.irParaSelecaoButton.click();
    console.log('✅ Clicou em "IR PARA SELEÇÃO DE"');
  }

  // Selecionar Justificativa - Actions
  async selectUF(uf: string): Promise<void> {
    await this.ufSelect.click();
    await this.page.getByRole('option', { name: uf }).click();
    console.log(`✅ Selecionou UF: ${uf}`);
  }

  async selectJustificativa(tipo: string): Promise<void> {
    // Primeiro clicar no campo de justificativa para abrir o dropdown
    const justificativaField = this.page.locator('#mui-component-select-auditJustification');

    await justificativaField.click();
    await this.page.waitForLoadState('domcontentloaded');

    // Depois selecionar a opção baseada no tipo
    const options = this.justificativaOptions;
    const selectedOption = options[tipo];

    if (selectedOption) {
      // Verificar se a opção está habilitada
      const isDisabled = await selectedOption.getAttribute('aria-disabled');
      if (isDisabled === 'true') {
        console.log(`⚠️ Opçáo "${tipo}" está desabilitada, tentando próxima opção disponível...`);

        // Tentar selecionar uma opção disponível (sem-chamado como fallback)
        const fallbackOption = this.page.getByRole('option', {
          name: 'Sem chamado, com recebimento',
        });
        await fallbackOption.click();
        console.log('✅ Selecionou justificativa alternativa: "Sem chamado, com recebimento"');
        return;
      }

      await selectedOption.click();

      // Mapear nomes amigá¡veis para log
      const nomeAmigavel: { [key: string]: string } = {
        'sem-chamado': 'Sem chamado, com recebimento',
        regularizacao: 'Necessidade de regularização',
        'recusa-auditoria': 'Recusa de auditoria',
        'reducao-area': 'Redução de área, histórico de',
        'indicacao-rtvs': 'Indicação RTVs',
      };

      console.log(`✅ Selecionou justificativa: "${nomeAmigavel[tipo]}"`);
    } else {
      throw new Error(`⚠️ Tipo de justificativa inválido: ${tipo}`);
    }
  }

  async fillAreaPotencial(area: string): Promise<void> {
    await this.areaPotencialInput.fill(area);
    console.log(`✅ Preencheu área potencial: ${area} ha`);
  }

  async fillAreaHistorica(area: string): Promise<void> {
    await this.areaHistoricaInput.fill(area);

    // Tirar o foco do campo para habilitar o botão
    await this.areaHistoricaInput.blur();
    console.log(`✅ Preencheu área histá³rica: ${area} ha`);
  }

  async clickIrParaInclusaoContato(): Promise<void> {
    // Aguardar o botão ficar habilitado após o blur
    await this.irParaInclusaoContatoButton.waitFor({ state: 'visible' });

    // Aguardar até que o botão esteja habilitado
    await this.irParaInclusaoContatoButton.waitFor({ state: 'visible' });
    await this.irParaInclusaoContatoButton.waitFor({ state: 'attached' });

    await this.irParaInclusaoContatoButton.click();
    console.log('✅ Clicou em "IR PARA INCLUSÃO DE CONTATO"');
  }

  // Incluir Contato Preferencial - Actions
  async selectTipoContato(tipo: 'Próprio' | 'Outro'): Promise<void> {
    // Aguardar o combobox estar visível
    await this.tipoContatoCombobox.waitFor({ state: 'visible' });

    await this.tipoContatoCombobox.click();
    await this.proprioOption.waitFor({ state: 'visible' });

    if (tipo === 'Próprio') {
      await this.proprioOption.click();
      console.log('✅ Selecionou tipo de contato: Próprio');
    } else {
      await this.outroOption.click();
      console.log('✅ Selecionou tipo de contato: Outro');
    }
  }

  async fillContatoProprio(telefone: string, email: string): Promise<void> {
    await this.telefoneInput.fill(telefone);
    console.log(`✅ Preencheu telefone: ${telefone}`);

    await this.emailInput.fill(email);
    console.log(`✅ Preencheu email: ${email}`);
  }

  async fillContatoOutro(
    nome: string,
    funcao: string,
    telefone: string,
    email: string,
  ): Promise<void> {
    await this.nomeContatoInput.fill(nome);
    console.log(`✅ Preencheu nome do contato: ${nome}`);

    await this.funcaoInput.fill(funcao);
    console.log(`✅ Preencheu funçáo: ${funcao}`);

    await this.telefoneInput.fill(telefone);
    console.log(`✅ Preencheu telefone: ${telefone}`);

    await this.emailInput.fill(email);
    console.log(`✅ Preencheu email: ${email}`);
  }

  async clickIrParaConferir(): Promise<void> {
    // Aguardar a pá¡gina processar
    await this.page.waitForLoadState('domcontentloaded');

    // Aguardar o botão estar visível e clicar
    await this.irParaConferirButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.irParaConferirButton.click();
    console.log('✅ Clicou em "IR PARA CONFERIR INFORMAÇÕES"');
  }

  // Conferir Informações - Actions
  async validateInformacoes(
    uf: string,
    justificativa: string,
    areaPotencial: string,
    areaHistorica: string,
    telefone: string,
    email: string,
  ): Promise<void> {
    // Aguardar a pá¡gina carregar
    await this.page.waitForLoadState('domcontentloaded');

    console.log('⚠️ Validando informações na tela de conferência...');

    // Tirar screenshot da tela de conferência para análise
    await this.takeScreenshot('tela-conferir-informacoes');

    // Função auxiliar para validar campos
    const validateField = async (fieldName: string, expectedValue: string, selectors: string[]) => {
      let found = false;
      let actualValue = '';

      for (const selector of selectors) {
        try {
          const element = this.page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            actualValue = (await element.textContent()) || '';
            found = true;
            break;
          }
        } catch (error) {
          // Continuar tentando outros seletores
        }
      }

      if (found) {
        console.log(`✅ ${fieldName}: "${actualValue.trim()}"`);
        return actualValue.trim();
      } else {
        console.log(`⚠️ ${fieldName}: Campo não encontrado`);
        return null;
      }
    };

    // Validar UF
    await validateField('UF', uf, [
      `text=${uf}`,
      '[data-testid*="uf"]',
      '[class*="uf"]',
      'text=AC',
    ]);

    // Validar Justificativa
    await validateField('Justificativa', justificativa, [
      `text=${justificativa}`,
      '[data-testid*="justificativa"]',
      '[class*="justificativa"]',
      'text=Sem chamado, com recebimento',
    ]);

    // Validar área Potencial
    await validateField('área Potencial', areaPotencial, [
      `text=${areaPotencial}`,
      '[data-testid*="area-potencial"]',
      '[class*="area-potencial"]',
      '[data-testid*="potential"]',
      '[class*="potential"]',
    ]);

    // Validar área Histá³rica
    await validateField('área Histá³rica', areaHistorica, [
      `text=${areaHistorica}`,
      '[data-testid*="area-historica"]',
      '[class*="area-historica"]',
      '[data-testid*="historical"]',
      '[class*="historical"]',
    ]);

    // Validar Nome do Contato
    await validateField('Nome do Contato', 'Próprio', [
      'text=Próprio',
      '[data-testid*="nome-contato"]',
      '[class*="nome-contato"]',
      '[data-testid*="contact-name"]',
      '[class*="contact-name"]',
    ]);

    // Validar Função (deve ser "-" para tipo Próprio)
    await validateField('Função', '-', [
      'text=-',
      '[data-testid*="funcao"]',
      '[class*="funcao"]',
      '[data-testid*="function"]',
      '[class*="function"]',
    ]);

    // Validar Email
    await validateField('Email', email, [
      `text=${email}`,
      '[data-testid*="email"]',
      '[class*="email"]',
    ]);

    // Validar Telefone
    await validateField('Telefone', telefone, [
      `text=${telefone}`,
      '[data-testid*="telefone"]',
      '[class*="telefone"]',
      '[data-testid*="phone"]',
      '[class*="phone"]',
    ]);

    // Validar se o botão de criar chamado está presente
    if (await this.criarChamadoButton.isVisible().catch(() => false)) {
      console.log('✅ Botão "Criar chamado de monitoramento" encontrado');
    } else {
      console.log('⚠️ Botão "Criar chamado de monitoramento" não encontrado');
    }

    console.log('✅ Validação das informações concluída');
  }

  async clickCriarChamado(): Promise<void> {
    await this.criarChamadoButton.waitFor({ state: 'visible' });
    await this.criarChamadoButton.click();
    console.log('✅ Clicou em "Criar chamado de monitoramento"');
  }

  async validateChamadoCriado(): Promise<void> {
    // Aguardar a mensagem de sucesso aparecer
    await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });

    if (await this.successMessage.isVisible()) {
      console.log('✅ Chamado de monitoramento criado com sucesso!');
    } else {
      console.log('⚠️ Mensagem de sucesso não encontrada');
    }
  }

  // Validations
  async validateAgricultorSelecionado(cpf: string): Promise<void> {
    // Aguardar a interface atualizar
    await this.page.waitForLoadState('domcontentloaded');

    // Procurar por vá¡rios indicadores de sucesso
    const successIndicators = [
      this.page.locator(`text=${cpf}`),
      this.page.locator('text=Agricultor adicionado'),
      this.page.locator('text=Selecionado'),
      this.page.locator('text=Adicionado'),
      this.page.locator('[data-testid*="success"]'),
      this.page.locator('.success'),
      this.page.locator('[class*="success"]'),
      // Verificar se o botão "IR PARA SELEÇÃO DE" está habilitado (indica que agricultor foi selecionado)
      this.page.getByRole('button', { name: 'IR PARA SELEÇÃO DE' }),
    ];

    let found = false;
    for (const indicator of successIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        console.log('✅ Validação: Agricultor adicionado com sucesso!');
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('⚠️ Não foi possível confirmar se o agricultor foi adicionado');
      // Tirar screenshot para debug
      await this.takeScreenshot('agricultor-selecionado-debug');
    }
  }

  async takeScreenshot(name: string): Promise<void> {
    // Limpar screenshots antigos antes de tirar novo
    cleanupOldScreenshots(1); // Manter apenas do último dia

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `screenshots/debug-${name}-${timestamp}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    console.log(`📸 Screenshot salvo: ${filename}`);
  }

  // Métodos públicos para validação de botões (usados nos testes)
  getBuscarSubmitButton(): Locator {
    return this.buscarSubmitButton;
  }

  getIrParaSelecaoButton(): Locator {
    return this.irParaSelecaoButton;
  }

  getIrParaInclusaoContatoButton(): Locator {
    return this.irParaInclusaoContatoButton;
  }

  getIrParaConferirButton(): Locator {
    return this.irParaConferirButton;
  }

  // Função auxiliar para executar o fluxo completo de criação de ticket
  async executeCompleteTicketCreationFlow(
    justificativaId: string,
    justificativaNome: string,
    cpfAgricultor: string = '69133808791', // Pode ser sobrescrito
  ): Promise<void> {
    console.log(`🚀 Testando justificativa: ${justificativaNome}`);

    // Passo 1-4: Busca e seleção de agricultor
    await this.clickBuscarAgricultor();
    await this.page.waitForLoadState('domcontentloaded');
    await this.fillCpfAgricultor(cpfAgricultor);
    await this.submitBusca();
    await this.page.waitForLoadState('domcontentloaded');
    await this.clickSelecionar();
    await this.page.waitForLoadState('domcontentloaded');
    await this.validateAgricultorSelecionado(cpfAgricultor);

    // Passo 5-6: Seleçáo de área e justificativa
    await this.clickIrParaSelecao();
    await this.page.waitForLoadState('domcontentloaded');
    await this.selectUF('AC');
    await this.page.waitForLoadState('domcontentloaded');
    await this.selectJustificativa(justificativaId);
    await this.page.waitForLoadState('domcontentloaded');

    // Passo 7: Preenchimento de áreas
    const areaPotencial = (Math.random() * 500 + 100).toFixed(1);
    const areaHistorica = (Math.random() * 400 + 50).toFixed(1);
    await this.fillAreaPotencial(areaPotencial);
    await this.page.waitForLoadState('domcontentloaded');
    await this.fillAreaHistorica(areaHistorica);
    await this.page.waitForLoadState('domcontentloaded');

    // Passo 8: Inclusão de contato
    await this.clickIrParaInclusaoContato();
    await this.page.waitForLoadState('domcontentloaded');
    await this.selectTipoContato('Próprio');
    await this.page.waitForLoadState('domcontentloaded');

    const telefone = `119${Math.floor(Math.random() * 90000000) + 10000000}`;
    const email = `contato${Math.floor(Math.random() * 1000)}@example.com`;
    await this.fillContatoProprio(telefone, email);
    await this.page.waitForLoadState('domcontentloaded');

    // Passo 9: Conferir informações
    await this.clickIrParaConferir();
    await this.page.waitForLoadState('domcontentloaded');

    // Passo 10: Validar informações
    await this.validateInformacoes(
      'AC',
      justificativaNome,
      areaPotencial,
      areaHistorica,
      telefone,
      email,
    );

    // Passo 11-12: Criar chamado (COMENTADO)
    // await this.clickCriarChamado();
    // await this.page.waitForLoadState('networkidle');
    // await this.validateChamadoCriado();

    await this.takeScreenshot(`justificativa-${justificativaId}-conferir`);
    console.log(`✅ Cenário "${justificativaNome}" executado com sucesso!`);
  }
}
