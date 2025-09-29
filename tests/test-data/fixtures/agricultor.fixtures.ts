import { Agricultor } from '../agricultors';
import { AgricultorFactory } from '../factories/agricultor.factory';

// 🌱 Fixtures - dados pré-definidos para cenários específicos
export class AgricultorFixtures {
  /**
   * Fixture para testes de bloqueio
   */
  static readonly BLOCKING_TESTS = {
    DEFININDO_AUDITOR: {
      document: '11111111111',
      name: 'AGRICULTOR DEFININDO AUDITOR',
      status: 'Definindo auditor',
      uf: 'SP',
      area: 100.0,
    } as Agricultor,

    EM_AGENDAMENTO: {
      document: '22222222222',
      name: 'AGRICULTOR EM AGENDAMENTO',
      status: 'Em agendamento',
      uf: 'MG',
      area: 150.0,
    } as Agricultor,

    AGENDADO: {
      document: '33333333333',
      name: 'AGRICULTOR AGENDADO',
      status: 'Agendado',
      uf: 'RS',
      area: 200.0,
    } as Agricultor,

    EM_MONITORAMENTO: {
      document: '44444444444',
      name: 'AGRICULTOR EM MONITORAMENTO',
      status: 'Em monitoramento',
      uf: 'PR',
      area: 180.0,
    } as Agricultor,

    AGUARDANDO_PAGAMENTO: {
      document: '55555555555',
      name: 'AGRICULTOR AGUARDANDO PAGAMENTO',
      status: 'Aguardando pagamento',
      uf: 'SC',
      area: 120.0,
    } as Agricultor,
  };

  /**
   * Fixture para testes de criação
   */
  static readonly CREATION_TESTS = {
    FINALIZADO_NAO_REGULARIZADO: {
      document: '66666666666',
      name: 'AGRICULTOR FINALIZADO NAO REGULARIZADO',
      status: 'Finalizado não regularizado',
      uf: 'AC',
      area: 250.0,
    } as Agricultor,

    SEM_PARTICIPACAO: {
      document: '77777777777',
      name: 'AGRICULTOR SEM PARTICIPACAO',
      uf: 'GO',
      area: 300.0,
    } as Agricultor,
  };

  /**
   * Fixture para testes de validação
   */
  static readonly VALIDATION_TESTS = {
    ANALISE_BACKOFFICE: {
      document: '88888888888',
      name: 'AGRICULTOR ANALISE BACKOFFICE',
      status: 'Análise Backoffice',
      uf: 'BA',
      area: 90.0,
    } as Agricultor,

    ANALISE_FINAL: {
      document: '99999999999',
      name: 'AGRICULTOR ANALISE FINAL',
      status: 'Análise final',
      uf: 'CE',
      area: 110.0,
    } as Agricultor,

    PENDENTE_REGULARIZACAO: {
      document: '10101010101',
      name: 'AGRICULTOR PENDENTE REGULARIZACAO',
      status: 'Pendente de regularização',
      uf: 'PE',
      area: 160.0,
    } as Agricultor,

    FINALIZADO: {
      document: '12121212121',
      name: 'AGRICULTOR FINALIZADO',
      status: 'Finalizado',
      uf: 'RJ',
      area: 140.0,
    } as Agricultor,
  };

  /**
   * Obtém fixture por nome
   */
  static getFixture(
    category: 'BLOCKING_TESTS' | 'CREATION_TESTS' | 'VALIDATION_TESTS',
    name: string,
  ): Agricultor {
    const fixtures = this[category] as any;
    return fixtures[name];
  }

  /**
   * Obtém todos os fixtures de uma categoria
   */
  static getFixturesByCategory(
    category: 'BLOCKING_TESTS' | 'CREATION_TESTS' | 'VALIDATION_TESTS',
  ): Agricultor[] {
    const fixtures = this[category] as any;
    return Object.values(fixtures);
  }

  /**
   * Gera agricultor dinâmico para cenário específico
   */
  static generateForScenario(scenario: string, overrides: Partial<Agricultor> = {}): Agricultor {
    const baseAgricultor = AgricultorFactory.createForScenario(scenario as any);
    return { ...baseAgricultor, ...overrides } as Agricultor;
  }
}