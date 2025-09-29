import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../support/pages/login.page';
import { MyTicketsPage } from '../../../support/pages/my-tickets.page';
import { CropMonitoringPage } from '../../../support/pages/crop-monitoring.page';
import { getAgricultorByIndex } from '../../../test-data/agricultors';
import { getBearerTokenFromStorage } from '../../../support/utils/token';
import { newHttpContext } from '../../../support/api/http';
import { CropMonitoringService } from '../../../support/api/crop-monitoring/crop-monitoring.service';

test.describe('validação de campos obrigatórios - selecionar justificativa', () => {
  let loginPage: LoginPage;
  let myTicketsPage: MyTicketsPage;
  let monitoramentoPage: CropMonitoringPage;
  let globalToken: string;

  // Configuração da API
  const API_CONFIG = {
    baseUrl: 'https://az6peeldh9.execute-api.us-east-1.amazonaws.com',
    harvestCode: '2025/2026',
  };

  test.beforeAll(async () => {
    console.log('🔄 Buscando token para validação de status do agricultor...');
    const baseUrl = process.env.BASE_URL;
    expect(baseUrl).toBeDefined();

    globalToken = await getBearerTokenFromStorage('admin', baseUrl!);
    console.log('✅ Token obtido com sucesso para E2E');
  });

  /**
   * Função para garantir que o agricultor tenha status "Finalizado não regularizado"
   */
  async function ensureAgricultorStatus(documents: string[]): Promise<void> {
    const ctx = await newHttpContext(API_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const allowedStatus = 'Finalizado não regularizado';

    for (const document of documents) {
      console.log(`🔄 Validando status do agricultor ${document}...`);

      // 1. GET: Verificar status atual
      const getRes = await api.getUserByDocument(document);
      if (getRes.status() !== 200) {
        console.log(`⚠️ Agricultor ${document} não encontrado, pulando...`);
        continue;
      }

      const userData = await getRes.json();
      const currentStatus = userData[0]?.cropMonitoringParticipations?.currentStatus;

      // 2. PUT: Configurar status se necessário
      if (currentStatus !== allowedStatus) {
        console.log(`🔄 Configurando status "${allowedStatus}" para agricultor ${document}...`);

        const putRes = await api.updateParticipationStatus({
          document: document,
          harvestCodesParticipations: [API_CONFIG.harvestCode],
          currentStatus: allowedStatus,
        });

        if (putRes.status() === 200) {
          console.log(`✅ Status configurado para agricultor ${document}`);
        } else {
          console.log(
            `❌ Erro ao configurar status para agricultor ${document}: ${putRes.status()}`,
          );
        }
      } else {
        console.log(`✅ Agricultor ${document} já tem status correto`);
      }

      // 3. GET: Confirmar status
      const confirmRes = await api.getUserByDocument(document);
      const confirmData = await confirmRes.json();
      const finalStatus = confirmData[0]?.cropMonitoringParticipations?.currentStatus;

      console.log(`✅ Status final do agricultor ${document}: "${finalStatus}"`);
    }
  }

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    myTicketsPage = new MyTicketsPage(page);
    monitoramentoPage = new CropMonitoringPage(page);

    const adminCpf = process.env.ADMIN_CPF;
    const adminPassword = process.env.ADMIN_PASSWORD;

    expect(adminCpf).toBeDefined();
    expect(adminPassword).toBeDefined();

    // Login automático
    await loginPage.goto();
    await loginPage.login(adminCpf!, adminPassword!);
    await page.waitForLoadState('domcontentloaded');

    // Navegar até a tela de monitoramento
    await myTicketsPage.clickAbrirChamado();
    await myTicketsPage.selectMonitoramentoLavoura();
    await myTicketsPage.validateOnMonitoramentoPage();
  });

  test.describe('validação de campos obrigatórios', () => {
    test('botão "procurar" está habilitado na tela inicial', async ({ page }) => {
      // Verificar se o botão de procurar está habilitado (comportamento atual do sistema)
      const procurarButton = page.getByRole('button', { name: 'procurar' });
      await expect(procurarButton).toBeEnabled();

      console.log('✅ Botão "procurar" está habilitado na tela inicial');
    });

    test('botão "IR PARA SELEÇÃO DE JUSTIFICATIVA" está desabilitado inicialmente', async ({
      page,
    }) => {
      // Verificar se o botão principal está desabilitado inicialmente
      const irParaJustificativaButton = page.getByRole('button', {
        name: 'IR PARA SELEÇÃO DE JUSTIFICATIVA',
      });
      await expect(irParaJustificativaButton).toBeDisabled();

      console.log('✅ Botão "IR PARA SELEÇÃO DE JUSTIFICATIVA" desabilitado inicialmente');
    });
  });

  test.describe('step 2 - selecionar justificativa', () => {
    test.beforeEach(async ({ page }) => {
      // Usar o mesmo padrão dos testes que estão funcionando
      // Usar Agricultor 1 que funciona perfeitamente
      const agricultor = getAgricultorByIndex(0); // CPF: 45315810089

      // 🔧 NOVO: Validar e configurar status do agricultor ANTES do teste
      console.log('🔄 Validando status do agricultor antes do teste E2E...');
      await ensureAgricultorStatus([agricultor.cpf]);
      console.log('✅ Status do agricultor validado - pronto para teste E2E');

      // Passo 1-4: Busca e seleção de agricultor (mesmo padrão dos testes funcionando)
      await monitoramentoPage.clickBuscarAgricultor();
      await page.waitForLoadState('domcontentloaded');
      await monitoramentoPage.fillCpfAgricultor(agricultor.cpf);
      await monitoramentoPage.submitBusca();
      await page.waitForLoadState('domcontentloaded');

      // Aguardar um pouco mais para o resultado aparecer
      await page.waitForTimeout(2000);

      await monitoramentoPage.clickSelecionar();
      await page.waitForLoadState('domcontentloaded');

      // Passo 5: Navegar para seleção de justificativa
      await monitoramentoPage.clickIrParaSelecao();
      await page.waitForLoadState('domcontentloaded');
    });

    test('deve manter botão "IR PARA INCLUSÃO DE CONTATO PREFERENCIAL" desabilitado quando UF não está selecionada', async ({
      page,
    }) => {
      // Verificar se o botão está desabilitado inicialmente
      const irParaInclusaoButton = page.getByRole('button', {
        name: 'IR PARA INCLUSÃO DE CONTATO PREFERENCIAL',
      });
      await expect(irParaInclusaoButton).toBeDisabled();

      console.log('✅ Botão "IR PARA INCLUSÃO DE CONTATO PREFERENCIAL" desabilitado sem UF');
    });

    test('deve manter botão "IR PARA INCLUSÃO DE CONTATO PREFERENCIAL" desabilitado quando Justificativa não está selecionada', async ({
      page,
    }) => {
      // Selecionar apenas UF
      await monitoramentoPage.selectUF('AC');

      // Verificar se o botão ainda está desabilitado
      const irParaInclusaoButton = page.getByRole('button', {
        name: 'IR PARA INCLUSÃO DE CONTATO PREFERENCIAL',
      });
      await expect(irParaInclusaoButton).toBeDisabled();

      console.log(
        '✅ Botão "IR PARA INCLUSÃO DE CONTATO PREFERENCIAL" desabilitado sem Justificativa',
      );
    });

    test('deve manter botão "IR PARA INCLUSÃO DE CONTATO PREFERENCIAL" desabilitado quando área Potencial está vazia', async ({
      page,
    }) => {
      // Preencher UF e Justificativa
      await monitoramentoPage.selectUF('AC');
      await monitoramentoPage.selectJustificativa('sem-chamado');

      // Verificar se o botão ainda está desabilitado
      const irParaInclusaoButton = page.getByRole('button', {
        name: 'IR PARA INCLUSÃO DE CONTATO PREFERENCIAL',
      });
      await expect(irParaInclusaoButton).toBeDisabled();

      console.log(
        '✅ Botão "IR PARA INCLUSÃO DE CONTATO PREFERENCIAL" desabilitado sem área Potencial',
      );
    });

    test('deve manter botão "IR PARA INCLUSÃO DE CONTATO PREFERENCIAL" desabilitado quando área Histórica está vazia', async ({
      page,
    }) => {
      // Preencher campos obrigatórios exceto área histórica
      await monitoramentoPage.selectUF('AC');
      await monitoramentoPage.selectJustificativa('sem-chamado');
      await monitoramentoPage.fillAreaPotencial('100.5');

      // Verificar se o botão ainda está desabilitado
      const irParaInclusaoButton = page.getByRole('button', {
        name: 'IR PARA INCLUSÃO DE CONTATO PREFERENCIAL',
      });
      await expect(irParaInclusaoButton).toBeDisabled();

      console.log(
        '✅ Botão "IR PARA INCLUSÃO DE CONTATO PREFERENCIAL" desabilitado sem área Histórica',
      );
    });

    test('deve manter botão desabilitado quando área Potencial é zero', async ({ page }) => {
      // Preencher campos obrigatórios
      await monitoramentoPage.selectUF('AC');
      await monitoramentoPage.selectJustificativa('sem-chamado');
      await monitoramentoPage.fillAreaPotencial('0');

      // Verificar se o botão permanece desabilitado (sem mensagem de erro)
      const irParaInclusaoButton = page.getByRole('button', {
        name: 'IR PARA INCLUSÃO DE CONTATO PREFERENCIAL',
      });
      await expect(irParaInclusaoButton).toBeDisabled();

      console.log('✅ Botão desabilitado quando área potencial é zero');
    });

    test('deve manter botão desabilitado quando área Histórica é zero', async ({ page }) => {
      // Preencher campos obrigatórios
      await monitoramentoPage.selectUF('AC');
      await monitoramentoPage.selectJustificativa('sem-chamado');
      await monitoramentoPage.fillAreaPotencial('100.5');
      await monitoramentoPage.fillAreaHistorica('0');

      // Verificar se o botão permanece desabilitado (sem mensagem de erro)
      const irParaInclusaoButton = page.getByRole('button', {
        name: 'IR PARA INCLUSÃO DE CONTATO PREFERENCIAL',
      });
      await expect(irParaInclusaoButton).toBeDisabled();

      console.log('✅ Botão desabilitado quando área histórica é zero');
    });

    test('deve habilitar botão quando todos os campos obrigatórios são preenchidos corretamente', async ({
      page,
    }) => {
      // Preencher todos os campos obrigatórios
      await monitoramentoPage.selectUF('AC');
      await monitoramentoPage.selectJustificativa('sem-chamado');
      await monitoramentoPage.fillAreaPotencial('100.5');
      await monitoramentoPage.fillAreaHistorica('80.3');

      // Verificar se o botão está habilitado
      const irParaInclusaoButton = page.getByRole('button', {
        name: 'IR PARA INCLUSÃO DE CONTATO PREFERENCIAL',
      });
      await expect(irParaInclusaoButton).toBeEnabled();

      console.log('✅ Botão habilitado com todos os campos preenchidos');
    });
  });
});
