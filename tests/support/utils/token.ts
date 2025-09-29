// tests/support/utils/token.ts
import { chromium } from '@playwright/test';
import { JWTHelper } from './jwt-helper';

export type RoleStorage =
  | 'admin'
  | 'n1'
  | 'n2'
  | 'n3'
  | 'auditor'
  | 'agricultor'
  | 'rtv'
  | 'rti'
  | 'b2b'
  | 'avaliador'
  | 'avaliados_cashback'
  | 'multiplicador'
  | 'distribuidor';

export const storageByRole: Record<RoleStorage, string> = {
  admin: 'storage/admin.json',
  n1: 'storage/n1.json',
  n2: 'storage/n2.json',
  n3: 'storage/n3.json',
  auditor: 'storage/auditor.json',
  agricultor: 'storage/agricultor.json',
  rtv: 'storage/rtv.json',
  rti: 'storage/rti.json',
  b2b: 'storage/b2b.json',
  avaliador: 'storage/avaliador.json',
  avaliados_cashback: 'storage/avaliados_cashback.json',
  multiplicador: 'storage/multiplicador.json',
  distribuidor: 'storage/distribuidor.json',
};

// --- helpers de JWT usando JWTHelper -----------------------

/**
 * Decodifica um token JWT (mantido para compatibilidade com código existente)
 * @deprecated Use JWTHelper.decode() diretamente
 */
export function decodeJwt(token: string): { header: any; payload: any; raw: string } {
  const decoded = JWTHelper.decode(token);
  if (!decoded) {
    throw new Error('JWT malformado');
  }
  return decoded;
}

/**
 * Verifica se token está expirado (função interna)
 */
function isExpiredSeconds(exp: any): boolean {
  return JWTHelper.isExpired(exp);
}


// --- principal: obter Bearer do storage do perfil ----------------

export async function getBearerTokenFromStorage(
  role: RoleStorage,
  baseURL: string,
): Promise<string> {
  const storageState = storageByRole[role];

  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState, baseURL });
  const page = await context.newPage();

  // Reidrata sessionStorage se a app usar isso
  await page.goto('/?login=true', { waitUntil: 'domcontentloaded' });

  // Captura possíveis tokens em LS/SS (strings e JSONs aninhados)
  const tokens = await page.evaluate(() => {
    const out: Record<string, string> = {};
    const JWT = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

    function add(k: string, v: string | null) {
      if (typeof v === 'string' && JWT.test(v)) out[k] = v;
    }
    function tryJson(k: string, v: string | null) {
      if (!v) return;
      try {
        const obj = JSON.parse(v);
        if (obj && typeof obj === 'object') {
          for (const [kk, vv] of Object.entries(obj)) {
            if (typeof vv === 'string' && JWT.test(vv)) out[`${k}:${kk}`] = vv;
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // eslint-disable-next-line no-undef
    for (let i = 0; i < localStorage.length; i++) {
      // eslint-disable-next-line no-undef
      const k = localStorage.key(i);
      if (k) {
        // eslint-disable-next-line no-undef
        const v = localStorage.getItem(k);
        add(`ls:${k}`, v);
        tryJson(`ls:${k}`, v);
      }
    }
    // eslint-disable-next-line no-undef
    for (let i = 0; i < sessionStorage.length; i++) {
      // eslint-disable-next-line no-undef
      const k = sessionStorage.key(i);
      if (k) {
        // eslint-disable-next-line no-undef
        const v = sessionStorage.getItem(k);
        add(`ss:${k}`, v);
        tryJson(`ss:${k}`, v);
      }
    }
    return out;
  });

  await browser.close();

  const entries = Object.entries(tokens);

  // Seleção preferencial: idToken -> accessToken -> qualquer JWT
  const pick = (pred: (k: string, v: string) => boolean) =>
    entries.find(([k, v]) => pred(k, v))?.[1];

  const token =
    // 1) chaves que parecem idToken
    pick(k => /idtoken|id_token/i.test(k)) ||
    // 2) tokens com token_use === 'id'
    pick((_, v) => JWTHelper.getTokenType(v) === 'id') ||
    // 3) chaves de access token
    pick(k => /accesstoken|access_token/i.test(k)) ||
    // 4) token_use === 'access'
    pick((_, v) => JWTHelper.getTokenType(v) === 'access') ||
    // 5) qualquer JWT encontrado
    entries.find(([, v]) => JWTHelper.isValidJWT(v))?.[1];

  if (!token) {
    const keys = entries.map(([k]) => k).join(', ') || '(nenhuma chave com JWT)';
    throw new Error(
      `Bearer token não encontrado no storage do perfil "${role}". Chaves inspecionadas: ${keys}`,
    );
  }

  // Verifica validade e dá mensagens claras
  if (!JWTHelper.isValid(token)) {
    const expirationInfo = JWTHelper.getExpirationInfo(token);
    if (expirationInfo?.isExpired) {
      throw new Error(
        `Token encontrado, mas EXPIRADO (exp=${expirationInfo.exp}, expirou em: ${expirationInfo.expiresAt.toISOString()}). Apague storage/${role}.json e gere novamente o login desse perfil.`,
      );
    }
    throw new Error(`Token inválido para o perfil "${role}".`);
  }

  return token;
}
