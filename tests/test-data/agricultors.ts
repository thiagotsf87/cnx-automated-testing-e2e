// 🎯 Dados centralizados de agricultores para testes
export interface Agricultor {
  document: string;
  name: string;
  uf?: string;
  area?: number;
  status?: string;
  harvestCode?: string;
}

// Agricultores válidos existentes no sistema
export const AGRICULTORS_DATABASE = {
  // Agricultores principais (sempre disponíveis)
  PRIMARY: [
    {
      document: '53169811894',
      name: 'YURI KAIQUE TIAGO FIGUEIREDO',
      uf: 'AC',
      area: 120.5,
    },
    {
      document: '45315810089',
      name: 'MELISSA BEATRIZ ROSÂNGELA REZENDE',
      uf: 'SP',
      area: 85.0,
    },
    {
      document: '31624163025',
      name: 'AGRICULTOR TREINAMENTO 2',
      uf: 'MG',
      area: 200.0,
    },
    {
      document: '69133808791',
      name: 'AGRICULTOR TREINAMENTO 3',
      uf: 'RS',
      area: 150.0,
    },
  ],

  // Agricultores para cenários específicos
  SCENARIOS: {
    // Para testes de bloqueio
    BLOCKING: [
      { document: '11111111111', name: 'AGRICULTOR BLOQUEIO 1' },
      { document: '22222222222', name: 'AGRICULTOR BLOQUEIO 2' },
      { document: '33333333333', name: 'AGRICULTOR BLOQUEIO 3' },
    ],

    // Para testes de criação
    CREATION: [
      { document: '44444444444', name: 'AGRICULTOR CRIACAO 1' },
      { document: '55555555555', name: 'AGRICULTOR CRIACAO 2' },
    ],

    // Para testes de validação
    VALIDATION: [
      { document: '66666666666', name: 'AGRICULTOR VALIDACAO 1' },
      { document: '77777777777', name: 'AGRICULTOR VALIDACAO 2' },
    ],
  },
} as const;

// Funções utilitárias para acesso aos dados
export class AgricultorDataManager {
  /**
   * Obtém agricultor principal por índice
   */
  static getPrimary(index: number): Agricultor {
    const agricultors = AGRICULTORS_DATABASE.PRIMARY;
    const agricultor = agricultors[index % agricultors.length];
    if (!agricultor) {
      throw new Error(`Agricultor not found at index ${index}`);
    }
    return agricultor;
  }

  /**
   * Obtém agricultor para cenário específico
   */
  static getForScenario(
    scenario: keyof typeof AGRICULTORS_DATABASE.SCENARIOS,
    index: number = 0,
  ): Agricultor {
    const agricultors = AGRICULTORS_DATABASE.SCENARIOS[scenario];
    const agricultor = agricultors[index % agricultors.length];
    if (!agricultor) {
      throw new Error(`Agricultor not found for scenario ${scenario} at index ${index}`);
    }
    return agricultor;
  }

  /**
   * Obtém agricultor único para teste (evita conflitos)
   */
  static getUniqueForTest(testName: string): Agricultor {
    // Gera índice baseado no nome do teste
    const hash = testName.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const index = Math.abs(hash) % AGRICULTORS_DATABASE.PRIMARY.length;
    return this.getPrimary(index);
  }

  /**
   * Obtém múltiplos agricultores únicos
   */
  static getMultiple(count: number, startIndex: number = 0): Agricultor[] {
    const agricultors = AGRICULTORS_DATABASE.PRIMARY;
    const result: Agricultor[] = [];
  
    for (let i = 0; i < count; i++) {
      const grower = agricultors[(startIndex + i) % agricultors.length];
      if (!grower) {
        throw new Error(`Agricultor não encontrado no índice ${(startIndex + i) % agricultors.length}`);
      }
      result.push(grower);
    }
  
    return result;
  }

  /**
   * Filtra agricultores por critério
   */
  static filterBy(criteria: Partial<Agricultor>): Agricultor[] {
    return AGRICULTORS_DATABASE.PRIMARY.filter(agricultor => {
      return Object.entries(criteria).every(([key, value]) => {
        const agricultorValue = agricultor[key as keyof typeof agricultor];
        return agricultorValue === value;
      });
    });
  }
}

// Funções de conveniência (backward compatibility)
export function getTestGrower(index: number): Agricultor {
  return AgricultorDataManager.getPrimary(index);
}

// Função para obter agricultor baseado no índice (compatibilidade com test-data.ts)
export function getAgricultorByIndex(index: number): { cpf: string; name: string } {
  const agricultor = AgricultorDataManager.getPrimary(index);
  return { cpf: agricultor.document, name: agricultor.name };
}

export function getAgricultorForBlocking(index: number): Agricultor {
  return AgricultorDataManager.getForScenario('BLOCKING', index);
}

export function getAgricultorForCreation(index: number): Agricultor {
  return AgricultorDataManager.getForScenario('CREATION', index);
}

// ===== ADMIN USERS =====
export interface AdminUser {
  cpf: string;
  password: string;
}

export const ADMIN_USERS: AdminUser[] = [
  { cpf: '47799782030', password: '#Teste123' },
  { cpf: '40806262079', password: '#Teste123' },
  { cpf: '01222320037', password: '#Teste123' },
];

// Função para obter admin baseado no índice
export function getAdminByIndex(index: number): AdminUser {
  const admin = ADMIN_USERS[index % ADMIN_USERS.length];
  if (!admin) {
    throw new Error(`Admin not found at index ${index}`);
  }
  return { cpf: admin.cpf, password: admin.password };
}

// ===== JUSTIFICATIVAS =====
export interface Justificativa {
  id: string;
  nome: string;
}

export const JUSTIFICATIVAS: Justificativa[] = [
  { id: 'sem-chamado', nome: 'Sem chamado, com recebimento' },
  { id: 'regularizacao', nome: 'Necessidade de regularização' },
  { id: 'recusa-auditoria', nome: 'Recusa de auditoria' },
  { id: 'reducao-area', nome: 'Redução de área, histórico de' },
  { id: 'indicacao-rtvs', nome: 'Indicação RTVs' },
];

// Função para obter justificativa por ID
export function getJustificativaById(id: string): Justificativa | undefined {
  return JUSTIFICATIVAS.find(j => j.id === id);
}

// Função para obter justificativa por nome
export function getJustificativaByNome(nome: string): Justificativa | undefined {
  return JUSTIFICATIVAS.find(j => j.nome === nome);
}
