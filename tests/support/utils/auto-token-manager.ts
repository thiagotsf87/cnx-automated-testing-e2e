import { chromium } from '@playwright/test';
import { TokenManager } from './token-manager';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * Auto Token Manager
 * 
 * Gerencia tokens automaticamente:
 * - Valida se tokens existem e são válidos
 * - Regenera automaticamente quando necessário
 * - Não requer comandos manuais
 */
export class AutoTokenManager {
  private static readonly STORAGE_DIR = 'storage';
  private static isRegenerating = false;

  /**
   * Garante que o token para um role específico está válido
   * Regenera automaticamente se necessário
   * 
   * @param role - Nome do role (ex: 'admin')
   * @returns Promise<void>
   */
  static async ensureValidToken(role: string = 'admin'): Promise<void> {
    // Evitar regeneração concorrente
    if (this.isRegenerating) {
      console.log('⏳ Aguardando regeneração em andamento...');
      await this.waitForRegeneration();
      return;
    }

    console.log(`🔍 Verificando token ${role}...`);

    // Verificar se token existe e é válido
    const isValid = await TokenManager.validateToken(role);

    if (isValid) {
      console.log(`✅ Token ${role} válido - prosseguindo`);
      return;
    }

    // Token inválido ou ausente - regenerar
    console.log(`⚠️  Token ${role} inválido ou ausente`);
    await this.regenerateTokens();
  }

  /**
   * Regenera todos os tokens executando login para cada role
   */
  private static async regenerateTokens(): Promise<void> {
    this.isRegenerating = true;

    try {
      console.log('🔄 Regenerando tokens automaticamente...');
      console.log('⏱️  Isso pode levar 30-60 segundos...');

      // Garantir que pasta storage existe
      if (!existsSync(this.STORAGE_DIR)) {
        mkdirSync(this.STORAGE_DIR, { recursive: true });
        console.log('📁 Pasta storage criada');
      }

      // Carregar credenciais do .env
      const roles = this.getRolesToGenerate();

      // Gerar token para cada role
      for (const role of roles) {
        await this.generateTokenForRole(role);
      }

      console.log('✅ Tokens regenerados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao regenerar tokens:', error);
      throw new Error(
        'Falha ao regenerar tokens automaticamente. ' +
        'Verifique suas credenciais no .env'
      );
    } finally {
      this.isRegenerating = false;
    }
  }

  /**
   * Gera token para um role específico
   */
  private static async generateTokenForRole(role: {
    key: string;
    cpf: string | undefined;
    password: string | undefined;
  }): Promise<void> {
    const storagePath = path.join(this.STORAGE_DIR, `${role.key}.json`);

    // Se já existe e é válido, pular
    if (existsSync(storagePath)) {
      const isValid = await TokenManager.validateToken(role.key);
      if (isValid) {
        console.log(`✓ ${role.key}: já válido`);
        return;
      }
    }

    // Validar credenciais
    if (!role.cpf || !role.password) {
      console.log(`↷ ${role.key}: sem credenciais no .env`);
      return;
    }

    console.log(`→ ${role.key}: gerando token...`);

    const baseURL = process.env.BASE_URL || 'https://stg.conexaobiotec.com.br';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    try {
      // Fazer login
      await page.goto('/?login=true', { waitUntil: 'domcontentloaded' });
      await page.locator('input[name="document"]').fill(role.cpf);
      await page.locator('input[name="password"]').fill(role.password);
      await page.click('button:has-text("ENTRAR")');

      // Aguardar navegação
      await page.waitForTimeout(2000);

      // Salvar storage state
      await context.storageState({ path: storagePath });
      console.log(`✓ ${role.key}: token gerado`);
    } catch (error) {
      console.error(`✗ ${role.key}: erro ao gerar token`, error);
    } finally {
      await browser.close();
    }
  }

  /**
   * Retorna lista de roles para gerar tokens
   */
  private static getRolesToGenerate() {
    return [
      {
        key: 'admin',
        cpf: process.env.ADMIN_CPF,
        password: process.env.ADMIN_PASSWORD,
      },
      {
        key: 'n1',
        cpf: process.env.N1_CPF,
        password: process.env.N1_PASSWORD,
      },
      {
        key: 'n2',
        cpf: process.env.N2_CPF,
        password: process.env.N2_PASSWORD,
      },
      {
        key: 'n3',
        cpf: process.env.N3_CPF,
        password: process.env.N3_PASSWORD,
      },
      {
        key: 'auditor',
        cpf: process.env.AUDITOR_CPF,
        password: process.env.AUDITOR_PASSWORD,
      },
      {
        key: 'agricultor',
        cpf: process.env.AGRICULTOR_CPF,
        password: process.env.AGRICULTOR_PASSWORD,
      },
      {
        key: 'rtv',
        cpf: process.env.RTVS_CPF,
        password: process.env.RTVS_PASSWORD,
      },
      {
        key: 'rti',
        cpf: process.env.RTVI_CPF,
        password: process.env.RTVI_PASSWORD,
      },
      {
        key: 'b2b',
        cpf: process.env.B2B_CPF,
        password: process.env.B2B_PASSWORD,
      },
      {
        key: 'avaliador',
        cpf: process.env.AVALIADOR_CPF,
        password: process.env.AVALIADOR_PASSWORD,
      },
      {
        key: 'avaliados_cashback',
        cpf: process.env.AVALIADOR_CASHBACK_CPF,
        password: process.env.AVALIADOR_CASHBACK_PASSWORD,
      },
      {
        key: 'multiplicador',
        cpf: process.env.MULTIPLICADOR_CPF,
        password: process.env.MULTIPLICADOR_PASSWORD,
      },
      {
        key: 'distribuidor',
        cpf: process.env.DISTRIBUIDOR_CPF,
        password: process.env.DISTRIBUIDOR_PASSWORD,
      },
    ];
  }

  /**
   * Aguarda regeneração em andamento
   */
  private static async waitForRegeneration(): Promise<void> {
    while (this.isRegenerating) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}