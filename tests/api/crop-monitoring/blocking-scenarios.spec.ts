import { test, expect } from '@playwright/test';
import { getBearerTokenFromStorage } from '../../support/utils/token';
import { newHttpContext } from '../../support/api/http';
import { CropMonitoringService } from '../../support/api/crop-monitoring/crop-monitoring.service';
import { buildCreateTicketPayload } from '../../test-data/crop-monitoring/builders/create-ticket.builder';
import { AutoTokenManager } from '../../support/utils/auto-token-manager';

// Importar o sistema de dados avançado
import { AgricultorDataManager } from '../../test-data/agricultors';

// Configuração centralizada
const TEST_CONFIG = {
  baseUrl: 'https://az6peeldh9.execute-api.us-east-1.amazonaws.com',
  harvestCode: '2025/2026',
};

// Variável global para armazenar o token
let globalToken: string;

test.beforeAll(async () => {
  await AutoTokenManager.ensureValidToken('admin');
  
  const baseUrl = process.env.BASE_URL;
  expect(baseUrl).toBeDefined();

  globalToken = await getBearerTokenFromStorage('admin', baseUrl!);
  console.log('✅ Token pronto para uso');
});
// Status que devem bloquear a criação de novos chamados
// Status validados e funcionais no sistema
// Status de bloqueio removidos - usando diretamente nos testes

// Status que permite criação de novos chamados
const ALLOWED_STATUS = 'Finalizado não regularizado';

/**
 * Função utilitária para executar o fluxo PUT → GET → POST
 */
async function executeBlockingTest(
  api: CropMonitoringService,
  grower: { document: string; name: string },
  status: string,
) {
  // 1. PUT: Configurar status de bloqueio
  console.log(`🔄 1. Configurando status "${status}" via PUT...`);
  const putRes = await api.updateParticipationStatus({
    document: grower.document,
    harvestCodesParticipations: [TEST_CONFIG.harvestCode],
    currentStatus: status,
  });
  expect(putRes.status()).toBe(200);

  // 2. GET: Verificar se o status foi configurado corretamente
  console.log('🔍 2. Verificando status via GET...');
  const getRes = await api.getUserByDocument(grower.document);
  expect(getRes.status()).toBe(200);
  const userData = await getRes.json();
  const currentStatus = userData[0]?.cropMonitoringParticipations?.currentStatus;
  expect(currentStatus).toBe(status);
  console.log(`✅ Status confirmado: "${currentStatus}"`);

  // 3. POST: Tentar criar chamado (deve ser bloqueado)
  console.log('🚫 3. Tentando criar chamado (deve ser bloqueado)...');
  const payload = buildCreateTicketPayload({
    document: grower.document,
    name: grower.name,
  });
  const createRes = await api.createTicket(payload);

  // Validar bloqueio
  expect(createRes.status()).toBe(422);
  const responseBody = await createRes.json();
  expect(responseBody.statusCode).toBe(422);
  expect(responseBody.path).toBe('/ticket/crop-monitoring');
  expect(responseBody.details?.message).toContain(
    'já possui participação em monitoramento com status:',
  );

  // Validar que a mensagem contém EXATAMENTE o status configurado no teste
  expect(responseBody.details?.message).toContain(status);
  console.log(
    `📝 Status esperado: "${status}", Mensagem completa: "${responseBody.details?.message}"`,
  );

  expect(responseBody.details?.error?.statusCode).toBe(422);
  expect(responseBody.details?.error?.message).toContain(status);
  expect(responseBody.details?.error?.error).toBe('Unprocessable Entity');

  console.log(`✅ Bloqueio confirmado para status: "${status}"`);
}

// ============================================================================
// TESTES BÁSICOS DE BLOQUEIO (do arquivo original)
// ============================================================================

// Teste de configuração inicial
test.describe('configuração Inicial', () => {
  test('API | configura status para teste de bloqueio', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

    const grower = AgricultorDataManager.getPrimary(0);

    // Configurar status que permite criação
    const putRes = await api.updateParticipationStatus({
      document: grower.document,
      harvestCodesParticipations: [TEST_CONFIG.harvestCode],
      currentStatus: ALLOWED_STATUS,
    });
    expect(putRes.status()).toBe(200);

    // Validar que a criação é permitida
    const payload = buildCreateTicketPayload({
      document: grower.document,
      name: grower.name,
    });
    const createRes = await api.createTicket(payload);
    expect([200, 201]).toContain(createRes.status());

    const responseBody = await createRes.json();
    expect(typeof responseBody?.id).toBe('string');
    console.log(`✅ Criação permitida! ID: ${responseBody.id}`);
  });
});

// Testes individuais para cada status de bloqueio
test.describe('status de Bloqueio - Testes Básicos', () => {
  test('API | bloqueia criação quando status é "Definindo auditor"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(0); // Usar agricultor válido

    await executeBlockingTest(api, grower, 'Definindo auditor');
  });

  test('API | bloqueia criação quando status é "Em agendamento"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(1);

    await executeBlockingTest(api, grower, 'Em agendamento');
  });

  test('API | bloqueia criação quando status é "Agendado"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(2);

    await executeBlockingTest(api, grower, 'Agendado');
  });

  test('API | bloqueia criação quando status é "Em monitoramento"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(3);

    await executeBlockingTest(api, grower, 'Em monitoramento');
  });

  test('API | bloqueia criação quando status é "Aguardando pagamento"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(1); // Usar agricultor válido

    await executeBlockingTest(api, grower, 'Aguardando pagamento');
  });

  test('API | bloqueia criação quando status é "Análise Backoffice"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(3); // Usar agricultor único

    await executeBlockingTest(api, grower, 'Análise Backoffice');
  });

  test('API | bloqueia criação quando status é "Análise final"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(4); // Usar agricultor único

    await executeBlockingTest(api, grower, 'Análise final');
  });

  test('API | bloqueia criação quando status é "Pendente de regularização"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(2); // Usar agricultor válido

    await executeBlockingTest(api, grower, 'Pendente de regularização');
  });

  test('API | bloqueia criação quando status é "Finalizado"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(3); // Usar agricultor válido

    await executeBlockingTest(api, grower, 'Finalizado');
  });
});

// Teste de cenário de sucesso
test.describe('cenário de Sucesso', () => {
  test('API | permite criação quando status é "Finalizado não regularizado"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);
    const grower = AgricultorDataManager.getPrimary(0); // Usar agricultor válido

    // Configurar status que permite criação
    const putRes = await api.updateParticipationStatus({
      document: grower.document,
      harvestCodesParticipations: [TEST_CONFIG.harvestCode],
      currentStatus: ALLOWED_STATUS,
    });
    expect(putRes.status()).toBe(200);

    // Validar que a criação é permitida
    const payload = buildCreateTicketPayload({
      document: grower.document,
      name: grower.name,
    });
    const createRes = await api.createTicket(payload);
    expect([200, 201]).toContain(createRes.status());

    const responseBody = await createRes.json();
    expect(typeof responseBody?.id).toBe('string');
    console.log(`✅ Criação permitida! ID: ${responseBody.id}`);
  });
});

// ============================================================================
// TESTES AVANÇADOS COM ESTRATÉGIAS DE DADOS (do arquivo improved)
// ============================================================================

test.describe('estratégias de Dados - Bloqueio', () => {
  test('API | usando DataManager - bloqueia "Definindo auditor"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

    // Estratégia 1: DataManager (dados centralizados)
    const grower = AgricultorDataManager.getPrimary(2); // Usar agricultor válido

    await executeBlockingTest(api, grower, 'Definindo auditor');
  });

  test('API | usando Fixtures - bloqueia "Em agendamento"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

    // Estratégia 2: Fixtures (dados pré-definidos) - usar agricultor que existe
    const grower = AgricultorDataManager.getPrimary(1);

    await executeBlockingTest(api, grower, 'Em agendamento');
  });

  test('API | usando Builder - bloqueia "Agendado"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

    // Estratégia 3: Builder Pattern (construção fluida) - usar agricultor que existe
    const grower = AgricultorDataManager.getPrimary(2);

    await executeBlockingTest(api, grower, 'Agendado');
  });

  test('API | usando Factory - bloqueia "Em monitoramento"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

    // Estratégia 4: Factory (geração dinâmica) - usar agricultor que existe
    const grower = AgricultorDataManager.getPrimary(3);

    await executeBlockingTest(api, grower, 'Em monitoramento');
  });

  test('API | usando DataManager único - bloqueia "Aguardando pagamento"', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

    // Estratégia 5: DataManager com agricultor único por teste
    const grower = AgricultorDataManager.getUniqueForTest('Aguardando pagamento');

    await executeBlockingTest(api, grower, 'Aguardando pagamento');
  });
});

test.describe('cenários Específicos', () => {
  test('API | múltiplos agricultores para teste paralelo', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

    // Obter múltiplos agricultores únicos
    const agricultors = AgricultorDataManager.getMultiple(3, 0);

    // Testar cada um
    for (let i = 0; i < agricultors.length; i++) {
      const grower = agricultors[i];
      if (!grower) continue; // Pular se grower for undefined
      const status = ['Definindo auditor', 'Em agendamento', 'Agendado'][i];
      if (!status) continue; // Pular se status for undefined

      await executeBlockingTest(api, grower, status);
    }
  });

  test('API | filtrar agricultores por UF', async () => {
    const ctx = await newHttpContext(TEST_CONFIG.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

    // Filtrar agricultores por UF específica
    const agricultorsSP = AgricultorDataManager.filterBy({ uf: 'SP' });

    if (agricultorsSP.length > 0) {
      const grower = agricultorsSP[0];
      if (grower) {
        await executeBlockingTest(api, grower, 'Definindo auditor');
      }
    }
  });
});
