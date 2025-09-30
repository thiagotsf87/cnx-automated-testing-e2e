import { test, expect } from '@playwright/test';
import { getBearerTokenFromStorage } from '../../support/utils/token';
import { newHttpContext } from '../../support/api/http';
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
  await AutoTokenManager.ensureValidToken('admin');
  
  const baseUrl = process.env.BASE_URL;
  expect(baseUrl).toBeDefined();

  globalToken = await getBearerTokenFromStorage('admin', baseUrl!);
  console.log('✅ Token pronto para uso');
});

test('API | valida PUT + GET para verificar alteração de status', async () => {
  const baseUrl = process.env.BASE_URL;
  expect(baseUrl).toBeDefined();

  const ctx = await newHttpContext(
    'https://az6peeldh9.execute-api.us-east-1.amazonaws.com',
    globalToken,
  );
  const api = new CropMonitoringService(ctx);

  // Usar agricultor específico para este teste
  const grower = getTestGrower(0);
  const document = grower.document;
  const testStatus = 'Definindo auditor'; // Status que deve bloquear criação

  // 1. GET inicial para ver o status atual
  console.log('🔍 1. Verificando status atual...');
  const getInitial = await api.getUserByDocument(document);
  expect(getInitial.status()).toBe(200);
  const initialData = await getInitial.json();
  console.log(
    '📊 Estrutura completa da resposta GET inicial:',
    JSON.stringify(initialData, null, 2),
  );
  const initialStatus = initialData[0]?.cropMonitoringParticipations?.currentStatus;
  const initialHarvest = initialData[0]?.cropMonitoringParticipations?.harvestCodesParticipations;
  console.log('Status inicial:', initialStatus);
  console.log('Safra inicial:', initialHarvest);

  // 2. PUT para alterar o status
  console.log(`🔄 2. Alterando status para: "${testStatus}"`);
  const putRes = await api.updateParticipationStatus({
    document: document,
    harvestCodesParticipations: ['2025/2026'],
    currentStatus: testStatus,
  });

  console.log('PUT Status:', putRes.status());
  expect([200, 201]).toContain(putRes.status());

  const putBody = await putRes.json();
  console.log(
    'PUT Response - Status atualizado:',
    putBody.cropMonitoringParticipations?.currentStatus,
  );

  // 3. Aguardar um pouco para garantir processamento
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 4. GET final para confirmar a alteração
  console.log('🔍 3. Verificando se o status foi alterado...');
  const getFinal = await api.getUserByDocument(document);
  expect(getFinal.status()).toBe(200);
  const finalData = await getFinal.json();
  console.log('📊 Estrutura completa da resposta GET final:', JSON.stringify(finalData, null, 2));
  const finalStatus = finalData[0]?.cropMonitoringParticipations?.currentStatus;
  const finalHarvest = finalData[0]?.cropMonitoringParticipations?.harvestCodesParticipations;

  console.log('Status final:', finalStatus);
  console.log('Safra final:', finalHarvest);
  console.log('Status esperado:', testStatus);
  console.log('Safra esperada:', ['2025/2026']);
  console.log('Status foi alterado?', finalStatus === testStatus ? '✅ SIM' : '❌ NÃO');
  console.log(
    'Safra foi alterada?',
    JSON.stringify(finalHarvest) === JSON.stringify(['2025/2026']) ? '✅ SIM' : '❌ NÃO',
  );

  // 5. Validações
  expect(finalStatus).toBe(testStatus);
  expect(finalData[0].document).toBe(document);
  expect(finalData[0].cropMonitoringParticipations?.harvestCodesParticipations).toContain(
    '2025/2026',
  );

  console.log('✅ Teste concluído com sucesso!');
  console.log(`📝 Status alterado de "${initialStatus}" para "${finalStatus}"`);
  console.log(`🔄 PUT funcionou? ${putRes.status() === 200 ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`🔍 GET confirmou alteração? ${finalStatus === testStatus ? '✅ SIM' : '❌ NÃO'}`);

  // 6. Teste adicional: Tentar criar chamado com status de bloqueio
  console.log('🚫 4. Testando bloqueio de criação com status de bloqueio...');

  const payload = buildCreateTicketPayload({
    document: document,
    name: grower.name,
  });

  const createRes = await api.createTicket(payload);
  console.log(`📝 Status da criação: ${createRes.status()}`);

  // Validar que o status é 422 (bloqueado)
  expect(createRes.status()).toBe(422);

  const errorBody = await createRes.json();
  console.log('✅ Bloqueio funcionou! Erro esperado:', errorBody.details?.message);
  expect(errorBody.details?.message).toContain(testStatus);
});
