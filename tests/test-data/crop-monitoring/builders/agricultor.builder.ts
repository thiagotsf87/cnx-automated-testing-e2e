import { Agricultor } from '../../agricultors';
import { AgricultorFactory, AgricultorFactoryConfig } from '../../factories/agricultor.factory';

// 🏗️ Builder para criação de payloads de agricultores
export class AgricultorBuilder {
  private agricultor: AgricultorFactoryConfig;

  constructor() {
    this.agricultor = AgricultorFactory.create();
  }

  /**
   * Define documento do agricultor
   */
  withDocument(document: string): this {
    this.agricultor.document = document;
    return this;
  }

  /**
   * Define nome do agricultor
   */
  withName(name: string): this {
    this.agricultor.name = name;
    return this;
  }

  /**
   * Define UF
   */
  withUF(uf: string): this {
    this.agricultor.uf = uf;
    return this;
  }

  /**
   * Define área
   */
  withArea(area: number): this {
    this.agricultor.area = area;
    return this;
  }

  /**
   * Define status
   */
  withStatus(status: string): this {
    this.agricultor.status = status;
    return this;
  }

  /**
   * Define código da safra
   */
  withHarvestCode(harvestCode: string): this {
    this.agricultor.harvestCode = harvestCode;
    return this;
  }

  /**
   * Cria agricultor para cenário de bloqueio
   */
  forBlockingScenario(): this {
    const blockingAgricultor = AgricultorFactory.createForScenario('blocking');
    this.agricultor = { ...this.agricultor, ...blockingAgricultor };
    return this;
  }

  /**
   * Cria agricultor para cenário de criação
   */
  forCreationScenario(): this {
    const creationAgricultor = AgricultorFactory.createForScenario('creation');
    this.agricultor = { ...this.agricultor, ...creationAgricultor };
    return this;
  }

  /**
   * Cria agricultor para cenário de validação
   */
  forValidationScenario(): this {
    const validationAgricultor = AgricultorFactory.createForScenario('validation');
    this.agricultor = { ...this.agricultor, ...validationAgricultor };
    return this;
  }


  build(): Agricultor {
    if (!this.agricultor.document || !this.agricultor.name) {
      throw new Error('Document e Name são obrigatórios');
    }
  
    const result: Agricultor = {
      document: this.agricultor.document,
      name: this.agricultor.name,
    };
  
    // Adicionar propriedades opcionais apenas se existirem
    if (this.agricultor.uf) result.uf = this.agricultor.uf;
    if (this.agricultor.area) result.area = this.agricultor.area;
    if (this.agricultor.status) result.status = this.agricultor.status;
    if (this.agricultor.harvestCode) result.harvestCode = this.agricultor.harvestCode;
  
    return result;
  }

  /**
   * Constrói como objeto simples (para APIs)
   */
  buildAsObject(): { document: string; name: string } {
    return {
      document: this.agricultor.document!,
      name: this.agricultor.name!,
    };
  }
}

// Funções de conveniência
export function createAgricultor(): AgricultorBuilder {
  return new AgricultorBuilder();
}

export function createBlockingAgricultor(): Agricultor {
  return new AgricultorBuilder().forBlockingScenario().build();
}

export function createCreationAgricultor(): Agricultor {
  return new AgricultorBuilder().forCreationScenario().build();
}

export function createValidationAgricultor(): Agricultor {
  return new AgricultorBuilder().forValidationScenario().build();
}
