import { faker } from '@faker-js/faker';

// 🏭 Factory para geração dinâmica de dados de agricultores
export interface AgricultorFactoryConfig {
  document?: string;
  name?: string;
  uf?: string;
  area?: number;
  status?: string;
  harvestCode?: string;
}

export class AgricultorFactory {
  /**
   * Cria agricultor com dados válidos mas aleatórios
   */
  static create(config: AgricultorFactoryConfig = {}): AgricultorFactoryConfig {
    return {
      document: config.document || this.generateValidCPF(),
      name: config.name || this.generateValidName(),
      uf: config.uf || this.generateRandomUF(),
      area: config.area || this.generateRandomArea(),
      status: config.status || 'Finalizado não regularizado',
      harvestCode: config.harvestCode || '2025/2026',
    };
  }

  /**
   * Cria múltiplos agricultores únicos
   */
  static createMultiple(
    count: number,
    config: AgricultorFactoryConfig = {},
  ): AgricultorFactoryConfig[] {
    const agricultors: AgricultorFactoryConfig[] = [];

    for (let i = 0; i < count; i++) {
      agricultors.push(
        this.create({
          ...config,
          document: config.document || this.generateUniqueCPF(i),
        }),
      );
    }

    return agricultors;
  }

  /**
   * Cria agricultor para cenário específico
   */
  static createForScenario(
    scenario: 'blocking' | 'creation' | 'validation',
  ): AgricultorFactoryConfig {
    const baseConfig = this.create();

    switch (scenario) {
      case 'blocking':
        return {
          ...baseConfig,
          status: 'Em monitoramento',
          name: `AGRICULTOR BLOQUEIO ${faker.number.int({ min: 1000, max: 9999 })}`,
        };

      case 'creation':
        return {
          ...baseConfig,
          status: 'Finalizado não regularizado',
          name: `AGRICULTOR CRIACAO ${faker.number.int({ min: 1000, max: 9999 })}`,
        };

      case 'validation':
        return {
          ...baseConfig,
          status: 'Pendente de regularização',
          name: `AGRICULTOR VALIDACAO ${faker.number.int({ min: 1000, max: 9999 })}`,
        };

      default:
        return baseConfig;
    }
  }

  // Métodos privados para geração de dados
  private static generateValidCPF(): string {
    const digits = Array.from({ length: 9 }, () => faker.number.int({ min: 0, max: 9 }));
  
    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const digit = digits[i];
      if (digit === undefined) continue;
      sum += digit * (10 - i);
    }
    const firstDigit = (sum * 10) % 11;
    digits.push(firstDigit === 10 ? 0 : firstDigit);
  
    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      const digit = digits[i];
      if (digit === undefined) continue;
      sum += digit * (11 - i);
    }
    const secondDigit = (sum * 10) % 11;
    digits.push(secondDigit === 10 ? 0 : secondDigit);
  
    return digits.join('');
  }

  private static generateUniqueCPF(seed: number): string {
    // Gera CPF único baseado no seed
    const base = 100000000 + seed;
    return base.toString().padEnd(11, '0');
  }

  private static generateValidName(): string {
    return `${faker.person.firstName()} ${faker.person.lastName()} ${faker.person.lastName()}`.toUpperCase();
  }

  private static generateRandomUF(): string {
    const ufs = [
      'AC',
      'AL',
      'AP',
      'AM',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MT',
      'MS',
      'MG',
      'PA',
      'PB',
      'PR',
      'PE',
      'PI',
      'RJ',
      'RN',
      'RS',
      'RO',
      'RR',
      'SC',
      'SP',
      'SE',
      'TO',
    ];
    return faker.helpers.arrayElement(ufs);
  }

  private static generateRandomArea(): number {
    return faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
  }
}
