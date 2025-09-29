import { getBearerTokenFromStorage } from '../utils/token';
import { newHttpContext } from '../api/http';
import { CropMonitoringService } from '../api/crop-monitoring/crop-monitoring.service';
import { TokenManager } from '../utils/token-manager';

/**
 * Service for managing grower status to ensure correct configuration for tests
 */
export class GrowerStatusService {
  private readonly baseUrl = 'https://az6peeldh9.execute-api.us-east-1.amazonaws.com';
  private readonly harvestCode = '2025/2026';
  private readonly targetStatus = 'Finalizado não regularizado';

  /**
   * Ensures that the specified growers have the correct status to allow ticket creation
   * @param documents Array of grower document numbers (CPFs)
   */
  async ensureCorrectStatus(documents: string[]): Promise<void> {
    console.log('🔄 Iniciando validação de status de agricultores...');

    // NEW: Validate token before proceeding
    await TokenManager.ensureValidToken('admin');

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      throw new Error('BASE_URL não definida');
    }

    const globalToken = await getBearerTokenFromStorage('admin', baseUrl);

    // Create HTTP context
    const ctx = await newHttpContext(this.baseUrl, globalToken);
    const api = new CropMonitoringService(ctx);

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
      if (currentStatus !== this.targetStatus) {
        console.log(`🔄 Configurando status "${this.targetStatus}" para agricultor ${document}...`);

        const putRes = await api.updateParticipationStatus({
          document: document,
          harvestCodesParticipations: [this.harvestCode],
          currentStatus: this.targetStatus,
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
}
