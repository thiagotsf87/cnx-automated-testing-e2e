import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../support/pages/login.page';
import { MyTicketsPage } from '../../../support/pages/my-tickets.page';
import { CropMonitoringPage } from '../../../support/pages/crop-monitoring.page';
import { getAdminByIndex, getAgricultorByIndex } from '../../../test-data/agricultors';
import { cleanupAllScreenshots } from '../../../support/utils/screenshot-cleanup';
import { GrowerStatusService } from '../../../support/services/grower-status.service';

// Limpeza global de screenshots antes de todos os testes
test.beforeAll(() => {
  console.log('🧹 Iniciando limpeza de screenshots antigos...');
  cleanupAllScreenshots();
});

test.describe('criação de Ticket', () => {
  let loginPage: LoginPage;
  let myTicketsPage: MyTicketsPage;
  let monitoramentoPage: CropMonitoringPage;
  let growerStatusService: GrowerStatusService;

  test.beforeAll(async () => {
    growerStatusService = new GrowerStatusService();
  });

  // Setup das páginas no before para todos os testes do describe
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    myTicketsPage = new MyTicketsPage(page);
    monitoramentoPage = new CropMonitoringPage(page);

    const adminCpf = process.env.ADMIN_CPF;
    const adminPassword = process.env.ADMIN_PASSWORD;

    expect(adminCpf).toBeDefined();
    expect(adminPassword).toBeDefined();

    // Login automático - usar admin padrão para testes principais
    await loginPage.goto();
    await loginPage.login(adminCpf!, adminPassword!);

    // Aguardar login ser processado
    await page.waitForLoadState('domcontentloaded');
  });

  test('criar novo chamado de monitoramento com um agricultor', async () => {
    test.setTimeout(60000); // 60 segundos para este teste

    // Usar agricultor padrão para teste principal
    const agricultor = getAgricultorByIndex(2); // Usar o terceiro agricultor

    // 🔧 NOVO: Validar e configurar status do agricultor ANTES do teste
    console.log('🔄 Validando status do agricultor antes do teste E2E...');
    await growerStatusService.ensureCorrectStatus([agricultor.cpf]);
    console.log('✅ Status do agricultor validado - pronto para teste E2E');

    await myTicketsPage.clickAbrirChamado();
    await myTicketsPage.selectMonitoramentoLavoura();
    await myTicketsPage.validateOnMonitoramentoPage();

    await monitoramentoPage.executeCompleteTicketCreationFlow(
      'sem-chamado',
      'Sem chamado, com recebimento',
      agricultor.cpf,
    );

    console.log('🎉 Teste completo: Chamado de monitoramento criado com sucesso!');
  });
});

test.describe('criação com Justificativas Diferentes', () => {
  let loginPage: LoginPage;
  let myTicketsPage: MyTicketsPage;
  let monitoramentoPage: CropMonitoringPage;
  let growerStatusService: GrowerStatusService;

  test.beforeAll(async () => {
    growerStatusService = new GrowerStatusService();
  });

  test.beforeEach(async ({ page }, testInfo) => {
    loginPage = new LoginPage(page);
    myTicketsPage = new MyTicketsPage(page);
    monitoramentoPage = new CropMonitoringPage(page);

    // Usar admin diferente baseado no índice do teste para evitar conflitos
    const testIndex = testInfo.title.includes('Sem chamado')
      ? 0
      : testInfo.title.includes('Necessidade')
        ? 1
        : testInfo.title.includes('Recusa')
          ? 2
          : testInfo.title.includes('Redução')
            ? 0
            : 1; // Rotacionar admins

    const admin = getAdminByIndex(testIndex);

    await loginPage.goto();
    await loginPage.login(admin.cpf, admin.password);
    await page.waitForLoadState('domcontentloaded');
  });

  test('justificativa: Sem chamado, com recebimento', async () => {
    test.setTimeout(60000); // 60 segundos para este teste

    // Usar agricultor diferente para evitar conflitos
    const agricultor = getAgricultorByIndex(0);

    // 🔧 NOVO: Validar e configurar status do agricultor ANTES do teste
    console.log('🔄 Validando status do agricultor antes do teste E2E...');
    await growerStatusService.ensureCorrectStatus([agricultor.cpf]);
    console.log('✅ Status do agricultor validado - pronto para teste E2E');

    await myTicketsPage.clickAbrirChamado();
    await myTicketsPage.selectMonitoramentoLavoura();
    await myTicketsPage.validateOnMonitoramentoPage();

    await monitoramentoPage.executeCompleteTicketCreationFlow(
      'sem-chamado',
      'Sem chamado, com recebimento',
      agricultor.cpf,
    );
  });

  test('justificativa: Necessidade de regularização', async () => {
    test.setTimeout(60000); // 60 segundos para este teste

    // Usar agricultor diferente para evitar conflitos
    const agricultor = getAgricultorByIndex(1);

    // 🔧 NOVO: Validar e configurar status do agricultor ANTES do teste
    console.log('🔄 Validando status do agricultor antes do teste E2E...');
    await growerStatusService.ensureCorrectStatus([agricultor.cpf]);
    console.log('✅ Status do agricultor validado - pronto para teste E2E');

    await myTicketsPage.clickAbrirChamado();
    await myTicketsPage.selectMonitoramentoLavoura();
    await myTicketsPage.validateOnMonitoramentoPage();

    await monitoramentoPage.executeCompleteTicketCreationFlow(
      'regularizacao',
      'Necessidade de regularização',
      agricultor.cpf,
    );
  });

  test('justificativa: Recusa de auditoria', async () => {
    test.setTimeout(60000); // 60 segundos para este teste

    // Usar agricultor diferente para evitar conflitos
    const agricultor = getAgricultorByIndex(2);

    // 🔧 NOVO: Validar e configurar status do agricultor ANTES do teste
    console.log('🔄 Validando status do agricultor antes do teste E2E...');
    await growerStatusService.ensureCorrectStatus([agricultor.cpf]);
    console.log('✅ Status do agricultor validado - pronto para teste E2E');

    await myTicketsPage.clickAbrirChamado();
    await myTicketsPage.selectMonitoramentoLavoura();
    await myTicketsPage.validateOnMonitoramentoPage();

    await monitoramentoPage.executeCompleteTicketCreationFlow(
      'recusa-auditoria',
      'Recusa de auditoria',
      agricultor.cpf,
    );
  });

  test('justificativa: Redução de área, histórico de', async () => {
    test.setTimeout(60000); // 60 segundos para este teste

    // Usar agricultor diferente para evitar conflitos
    const agricultor = getAgricultorByIndex(0);

    // 🔧 NOVO: Validar e configurar status do agricultor ANTES do teste
    console.log('🔄 Validando status do agricultor antes do teste E2E...');
    await growerStatusService.ensureCorrectStatus([agricultor.cpf]);
    console.log('✅ Status do agricultor validado - pronto para teste E2E');

    await myTicketsPage.clickAbrirChamado();
    await myTicketsPage.selectMonitoramentoLavoura();
    await myTicketsPage.validateOnMonitoramentoPage();

    await monitoramentoPage.executeCompleteTicketCreationFlow(
      'reducao-area',
      'Redução de área, histórico de',
      agricultor.cpf,
    );
  });
});
