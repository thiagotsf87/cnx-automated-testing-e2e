import { CropMonitoringService } from './crop-monitoring/crop-monitoring.service';
import { TestConfigService } from './test-config.service';

/**
 * Service para operações auxiliares em testes de API
 * Encapsula lógicas comuns de setup e validação
 */
export class TestHelperService {
  /**
   * Configura o status de participação para um teste
   */
  static async setupParticipationStatus(api: CropMonitoringService, status: string): Promise<void> {
    const putRes = await api.updateParticipationStatus({
      document: TestConfigService.CROP_MONITORING.TEST_DOCUMENT,
      harvestCodesParticipations: [TestConfigService.CROP_MONITORING.TEST_HARVEST_CODE],
      currentStatus: status,
    });

    if (putRes.status() === 200) {
      console.log(`✅ Status configurado para: "${status}"`);
    } else {
      const errorBody = await putRes.json();
      console.log(
        `❌ Erro ao configurar status "${status}": ${putRes.status()} - ${JSON.stringify(errorBody)}`,
      );
      throw new Error(`Status "${status}" não é válido (${putRes.status()})`);
    }

    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Valida se a criação de ticket está sendo bloqueada corretamente
   */
  static async validateBlocking(api: CropMonitoringService, expectedStatus: string): Promise<void> {
    const { buildCreateTicketPayload } = await import(
      '../../test-data/crop-monitoring/builders/create-ticket.builder'
    );

    const payload = buildCreateTicketPayload({
      document: TestConfigService.CROP_MONITORING.TEST_DOCUMENT,
      name: TestConfigService.CROP_MONITORING.TEST_GROWER_NAME,
    });

    const createRes = await api.createTicket(payload);
    const responseBody = await createRes.json();

    console.log(`📋 Status recebido: ${createRes.status()}`);
    console.log(`📋 Mensagem: ${responseBody.details?.message}`);

    // Validar a estrutura da resposta de erro
    if (createRes.status() !== 422) {
      throw new Error(`Esperava status 422, mas recebeu ${createRes.status()}`);
    }

    if (!responseBody.details?.message?.includes(expectedStatus)) {
      throw new Error(`Mensagem de erro não contém o status esperado: ${expectedStatus}`);
    }

    console.log(`✅ Bloqueio confirmado para status: "${expectedStatus}"`);
  }

  /**
   * Valida se a criação de ticket está sendo permitida
   */
  static async validateAllowedCreation(api: CropMonitoringService): Promise<void> {
    const { buildCreateTicketPayload } = await import(
      '../../test-data/crop-monitoring/builders/create-ticket.builder'
    );

    const payload = buildCreateTicketPayload({
      document: TestConfigService.CROP_MONITORING.TEST_DOCUMENT,
      name: TestConfigService.CROP_MONITORING.TEST_GROWER_NAME,
    });

    const createRes = await api.createTicket(payload);
    const responseBody = await createRes.json();

    console.log(`📋 Status recebido: ${createRes.status()}`);

    // Validar que foi criado com sucesso
    if (![200, 201].includes(createRes.status())) {
      throw new Error(`Esperava status 200/201, mas recebeu ${createRes.status()}`);
    }

    if (!responseBody?.id || typeof responseBody.id !== 'string') {
      throw new Error('Resposta não contém ID válido');
    }

    console.log(`✅ Criação permitida! ID: ${responseBody.id}`);
  }

  /**
   * Aguarda um tempo específico para processamento
   */
  static async waitForProcessing(ms: number = 1000): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}
