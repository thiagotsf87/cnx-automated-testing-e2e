import { test, expect } from '@playwright/test';
import { getBearerTokenFromStorage, decodeJwt } from '../../support/utils/token';
import { newHttpContext } from '../../support/api/http';
import { CropMonitoringRoutes } from '../../support/api/crop-monitoring/routes';
import { CropMonitoringService } from '../../support/api/crop-monitoring/crop-monitoring.service';
import { buildCreateTicketPayload } from '../../test-data/crop-monitoring/builders/create-ticket.builder';
import { AutoTokenManager } from '../../support/utils/auto-token-manager';

// Agricultores válidos existentes no sistema (evita conflito de estado)
const TEST_GROWERS = [
  { document: '53169811894', name: 'YURI KAIQUE TIAGO FIGUEIREDO' },
  { document: '45315810089', name: 'MELISSA BEATRIZ ROSÂNGELA REZENDE' },
  { document: '31624163025', name: 'AGRICULTOR TREINAMENTO 2' },
  { document: '69133808791', name: 'AGRICULTOR TREINAMENTO 3' },
];

// Função para obter agricultor único por teste
function getTestGrower(testIndex: number) {
  const grower = TEST_GROWERS[testIndex % TEST_GROWERS.length];
  if (!grower) {
    throw new Error(`Agricultor não encontrado no índice ${testIndex}`);
  }
  return grower;
}

// Variável global para armazenar o token
let globalToken: string;

test.beforeAll(async () => {
  // Auto-validação e regeneração de token
  await AutoTokenManager.ensureValidToken('admin');
  
  const baseUrl = process.env.BASE_URL;
  expect(baseUrl).toBeDefined();

  globalToken = await getBearerTokenFromStorage('admin', baseUrl!);
  console.log('✅ Token pronto para uso');
});

test('API | atualiza status de participação (PUT)', async () => {
  const baseUrl = process.env.BASE_URL;
  expect(baseUrl).toBeDefined();

  const ctx = await newHttpContext(CropMonitoringRoutes.baseUrl, globalToken);
  const api = new CropMonitoringService(ctx);

  // Usar agricultor específico para este teste
  const grower = getTestGrower(0);

  // Testar atualização de status
  const updateRes = await api.updateParticipationStatus({
    document: grower.document,
    harvestCodesParticipations: ['2024/2025'],
    currentStatus: 'Finalizado não regularizado',
  });

  console.log('PUT Status:', updateRes.status());
  const updateBody = await updateRes.json();
  console.log('PUT Response:', JSON.stringify(updateBody, null, 2));

  // Validar que o PUT foi bem-sucedido
  expect([200, 201]).toContain(updateRes.status());
});

test('API | cria chamado de monitoramento (200/201 + id)', async () => {
  const baseUrl = process.env.BASE_URL;
  expect(baseUrl).toBeDefined();

  const ctx = await newHttpContext(CropMonitoringRoutes.baseUrl, globalToken);
  const api = new CropMonitoringService(ctx);

  // Usar agricultor específico para este teste
  const grower = getTestGrower(1);

  // Primeiro, garantir que o agricultor está no status "Finalizado não regularizado"
  await api.updateParticipationStatus({
    document: grower.document,
    harvestCodesParticipations: ['2024/2025'],
    currentStatus: 'Finalizado não regularizado',
  });

  // Aguardar um pouco para garantir que a atualização foi processada
  await new Promise(resolve => setTimeout(resolve, 1000));

  const payload = buildCreateTicketPayload({
    document: grower.document,
    name: grower.name,
  });
  const res = await api.createTicket(payload);

  // Validar que a API respondeu com sucesso
  expect([200, 201]).toContain(res.status());
  const body = await res.json();

  // Sucesso: validar que retornou um ID
  expect(typeof body?.id).toBe('string');
  expect(body.id.length).toBeGreaterThan(0);
  console.log('✅ Ticket criado com sucesso. ID:', body.id);

  // Validar que o token está válido
  const dj = decodeJwt(globalToken);
  expect(dj.payload?.token_use).toBe('id');
  expect(dj.payload?.exp).toBeGreaterThan(Date.now() / 1000);
});

// Testes de bloqueio para cada status que deve impedir criação de novo chamado
const blockingStatuses = [
  'Definindo auditor',
  'Em agendamento',
  'Agendado',
  'Em monitoramento',
  'Análise Backoffice',
  'Análise final',
  'Aguardando pagamento',
  'Pendente de regularização',
  'Finalizado',
];

blockingStatuses.forEach((status, index) => {
  test(`API | bloqueia criação de chamado quando status é "${status}" (422)`, async () => {
    const baseUrl = process.env.BASE_URL;
    expect(baseUrl).toBeDefined();

    const ctx = await newHttpContext(CropMonitoringRoutes.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

    // Usar agricultor específico para este teste (index + 2 para evitar conflito com testes anteriores)
    const grower = getTestGrower(2 + index);

    // Primeiro, tentar definir o agricultor com o status que deve bloquear
    const putRes = await api.updateParticipationStatus({
      document: grower.document,
      harvestCodesParticipations: ['2024/2025'],
      currentStatus: status,
    });

    // Verificar se o PUT foi bem-sucedido (status válido)
    if (putRes.status() === 200) {
      console.log(`✅ Status "${status}" é válido - configurado com sucesso`);

      // Aguardar um pouco para garantir que a atualização foi processada
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Tentar criar um novo chamado (deve ser bloqueado)
      const payload = buildCreateTicketPayload({
        document: grower.document,
        name: grower.name,
      });
      const res = await api.createTicket(payload);

      // Verificar o status recebido
      console.log(`Status recebido para "${status}":`, res.status());
      const body = await res.json();
      console.log(`Response body para "${status}":`, JSON.stringify(body, null, 2));

      // Validar que o status é 422 (bloqueado)
      expect(res.status()).toBe(422);

      // Validar a estrutura da resposta de erro
      expect(body.statusCode).toBe(422);
      expect(body.path).toBe('/ticket/crop-monitoring');
      expect(body.details?.message).toContain(
        'já possui participação em monitoramento com status:',
      );
      expect(body.details?.error?.statusCode).toBe(422);
      expect(body.details?.error?.error).toBe('Unprocessable Entity');

      console.log(`✅ Bloqueio confirmado para status: "${status}"`);
    } else {
      // Status inválido - validar que retorna erro apropriado
      console.log(`❌ Status "${status}" é inválido - PUT retornou:`, putRes.status());
      const errorBody = await putRes.json();
      console.log('Error body:', JSON.stringify(errorBody, null, 2));

      // Validar que retorna 400 (Bad Request) para status inválido
      expect(putRes.status()).toBe(400);
      expect(errorBody.details?.error?.message).toContain(
        'currentStatus must be a valid enum value',
      );

      console.log(`✅ Status "${status}" confirmado como inválido (400)`);
    }
  });
});
