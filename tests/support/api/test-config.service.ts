/**
 * Service para configuração centralizada de testes de API
 * Encapsula configurações comuns e URLs
 */
export class TestConfigService {
  // URLs base dos serviços
  static readonly BASE_URLS = {
    CROP_MONITORING: 'https://az6peeldh9.execute-api.us-east-1.amazonaws.com',
    MAIN_APP: process.env.BASE_URL || 'https://stg.conexaobiotec.com.br/?login=true',
  } as const;

  // Configurações de teste para crop monitoring
  static readonly CROP_MONITORING = {
    TEST_DOCUMENT: '53169811894',
    TEST_GROWER_NAME: 'YURI KAIQUE TIAGO FIGUEIREDO',
    TEST_HARVEST_CODE: '2025/2026',
  } as const;

  // Status válidos para testes
  static readonly STATUS = {
    BLOCKING: [
      'Definindo auditor',
      'Em agendamento',
      'Agendado',
      'Em monitoramento',
      'Aguardando pagamento',
    ],
    INVALID: [
      'Análise final N2',
      'Análise final N3',
      'Pendente de regularização boleto não pago',
      'Pendente de regularização recusa de pagamento',
      'Finalizado sem contato',
      'Finalizado regularizado',
    ],
    ALLOWED: 'Finalizado não regularizado',
  } as const;

  // Timeouts padrão
  static readonly TIMEOUTS = {
    API_REQUEST: 10000,
    TEST_EXECUTION: 60000,
    PAGE_LOAD: 30000,
  } as const;
}
