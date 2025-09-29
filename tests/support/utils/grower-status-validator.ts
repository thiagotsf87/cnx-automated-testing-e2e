import { newHttpContext } from '../api/http';
import { CropMonitoringRoutes } from '../api/crop-monitoring/routes';
import { CropMonitoringService } from '../api/crop-monitoring/crop-monitoring.service';
import { getBearerTokenFromStorage } from './token';

// Status que permite criação de novos chamados
const ALLOWED_STATUS = 'Finalizado não regularizado';

// Status que bloqueiam criação de novos chamados
const BLOCKING_STATUSES = [
  'Em agendamento',
  'Em auditoria',
  'Aguardando análise',
  'Finalizado sem contato',
  'Finalizado regularizado',
];

export interface GrowerStatusInfo {
  document: string;
  name: string;
  currentStatus?: string;
  needsUpdate: boolean;
}

/**
 * Valida e ajusta o status de um agricultor para permitir criação de chamados
 */
export async function validateAndUpdateGrowerStatus(
  document: string,
  name: string,
  harvestCode: string = '2025/2026',
): Promise<GrowerStatusInfo> {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL não definida');
  }

  try {
    // Obter token de autenticação
    const bearer = await getBearerTokenFromStorage('admin', baseUrl);
    const ctx = await newHttpContext(CropMonitoringRoutes.baseUrl, bearer);
    const api = new CropMonitoringService(ctx);

    console.log(`🔍 Validando status do agricultor: ${document} (${name})`);

    // 1. Verificar status atual via GET
    const getResponse = await api.getUserByDocument(document);

    if (getResponse.status() !== 200) {
      console.log(`⚠️ GET falhou para ${document}: Status ${getResponse.status()}`);
      // Se não conseguir buscar, assumir que precisa atualizar
      return {
        document,
        name,
        currentStatus: 'Desconhecido',
        needsUpdate: true,
      };
    }

    const statusData = await getResponse.json();
    const userData = statusData[0]; // getUserByDocument retorna array
    const currentStatus = userData?.cropMonitoringParticipations?.currentStatus;

    console.log(`📊 Status atual do ${name} (${document}): "${currentStatus}"`);

    // 2. Verificar se o status permite criação de chamados
    const needsUpdate = currentStatus !== ALLOWED_STATUS;

    if (needsUpdate) {
      console.log(
        `🔄 Status "${currentStatus}" não permite criação de chamados. Atualizando para "${ALLOWED_STATUS}"`,
      );

      // 3. Atualizar status via PUT
      const updateResponse = await api.updateParticipationStatus({
        document,
        harvestCodesParticipations: [harvestCode],
        currentStatus: ALLOWED_STATUS,
      });

      if (updateResponse.status() === 200) {
        console.log(`✅ Status atualizado com sucesso para ${name} (${document})`);
        return {
          document,
          name,
          currentStatus: ALLOWED_STATUS,
          needsUpdate: false,
        };
      } else {
        console.log(
          `❌ Falha ao atualizar status para ${name} (${document}): Status ${updateResponse.status()}`,
        );
        return {
          document,
          name,
          currentStatus,
          needsUpdate: true,
        };
      }
    } else {
      console.log(`✅ Status "${currentStatus}" já está correto para ${name} (${document})`);
      return {
        document,
        name,
        currentStatus,
        needsUpdate: false,
      };
    }
  } catch (error) {
    console.log(`❌ Erro ao validar status do agricultor ${document}: ${error}`);
    return {
      document,
      name,
      currentStatus: 'Erro',
      needsUpdate: true,
    };
  }
}

/**
 * Valida e ajusta o status de múltiplos agricultores
 */
export async function validateAndUpdateMultipleGrowers(
  growers: Array<{ document: string; name: string }>,
  harvestCode: string = '2025/2026',
): Promise<GrowerStatusInfo[]> {
  console.log(`🚀 Iniciando validação de status para ${growers.length} agricultores`);

  const results: GrowerStatusInfo[] = [];

  for (const grower of growers) {
    const result = await validateAndUpdateGrowerStatus(grower.document, grower.name, harvestCode);
    results.push(result);

    // Pequena pausa entre requisições para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Resumo dos resultados
  const successful = results.filter(r => !r.needsUpdate).length;
  const failed = results.filter(r => r.needsUpdate).length;

  console.log('📊 Resumo da validação:');
  console.log(`   ✅ Sucessos: ${successful}`);
  console.log(`   ❌ Falhas: ${failed}`);

  if (failed > 0) {
    console.log('⚠️ Agricultores que ainda precisam de ajuste:');
    results
      .filter(r => r.needsUpdate)
      .forEach(r => console.log(`   - ${r.name} (${r.document}): ${r.currentStatus}`));
  }

  return results;
}
