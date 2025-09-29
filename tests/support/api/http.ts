import { request, APIRequestContext } from '@playwright/test';
import { TestConfigService } from './test-config.service';

/**
 * Factory para criação de contexto HTTP
 */
export async function newHttpContext(baseURL: string, bearer: string): Promise<APIRequestContext> {
  return await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
    },
    timeout: TestConfigService.TIMEOUTS.API_REQUEST,
  });
}

/**
 * Service para criação de contextos HTTP com configurações padrão
 */
export class HttpContextService {
  /**
   * Cria contexto para crop monitoring API
   */
  static async createCropMonitoringContext(bearer: string): Promise<APIRequestContext> {
    return await newHttpContext(TestConfigService.BASE_URLS.CROP_MONITORING, bearer);
  }

  /**
   * Cria contexto para a aplicação principal
   */
  static async createMainAppContext(bearer: string): Promise<APIRequestContext> {
    return await newHttpContext(TestConfigService.BASE_URLS.MAIN_APP, bearer);
  }
}
