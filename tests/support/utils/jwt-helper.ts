export class JWTHelper {
    // Regex para validar formato JWT (3 partes separadas por ponto)
    private static readonly JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;
  
    /**
     * Valida se uma string tem formato válido de JWT
     * @param token - String a ser validada
     * @returns true se o formato é válido
     */
    static isValidJWT(token: string): boolean {
      if (!token || typeof token !== 'string') {
        return false;
      }
      
      // Verificar formato básico primeiro
      if (!this.JWT_REGEX.test(token)) {
        return false;
      }
      
      // Garantir que tem exatamente 3 partes
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      // Garantir que header e payload não estão vazios
      if (!parts[0] || !parts[1]) {
        return false;
      }
      
      return true;
    }
  
    /**
     * Decodifica um token JWT sem validar assinatura
     * @param token - Token JWT a ser decodificado
     * @returns Objeto com header, payload e token original, ou null se inválido
     */
    static decode(token: string): { header: any; payload: any; raw: string } | null {
      try {
        const parts = token.split('.');
        
        // JWT deve ter exatamente 3 partes: header.payload.signature
        if (parts.length !== 3) {
          return null;
        }
  
        const [headerB64, payloadB64] = parts;
        
        if (!headerB64 || !payloadB64) {
          return null;
        }
  
        return {
          header: JSON.parse(this.b64urlToUtf8(headerB64)),
          payload: JSON.parse(this.b64urlToUtf8(payloadB64)),
          raw: token,
        };
      } catch (error) {
        console.error('Erro ao decodificar JWT:', error);
        return null;
      }
    }
  
    /**
     * Verifica se um token JWT está expirado
     * @param exp - Timestamp de expiração (em segundos desde epoch)
     * @returns true se o token está expirado ou exp é inválido
     */
    static isExpired(exp: number | undefined | null): boolean {
      // Se não tem exp, consideramos como não expirado (alguns tokens não têm)
      if (exp == null || exp === undefined) {
        return false;
      }
  
      const expNum = Number(exp);
      
      // Se não for número válido, consideramos expirado
      if (isNaN(expNum)) {
        return true;
      }
  
      const nowInSeconds = Math.floor(Date.now() / 1000);
      return expNum <= nowInSeconds;
    }
  
    /**
     * Obtém informações sobre expiração do token
     * @param token - Token JWT
     * @returns Objeto com informações de expiração ou null se inválido
     */
    static getExpirationInfo(token: string): {
      exp: number;
      expiresAt: Date;
      isExpired: boolean;
      timeRemaining: number; // em segundos
    } | null {
      const decoded = this.decode(token);
      
      if (!decoded || !decoded.payload || !decoded.payload.exp) {
        return null;
      }
  
      const exp = decoded.payload.exp;
      const expiresAt = new Date(exp * 1000);
      const isExpired = this.isExpired(exp);
      const timeRemaining = isExpired ? 0 : exp - Math.floor(Date.now() / 1000);
  
      return {
        exp,
        expiresAt,
        isExpired,
        timeRemaining,
      };
    }
  
    /**
     * Converte Base64 URL-safe para UTF-8
     * Adiciona padding se necessário
     * @param b64url - String em formato Base64 URL-safe
     * @returns String decodificada em UTF-8
     */
    private static b64urlToUtf8(b64url: string): string {
      // Converter URL-safe base64 para base64 padrão
      let base64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Adicionar padding se necessário (Base64 deve ter tamanho múltiplo de 4)
      const padding = base64.length % 4;
      if (padding > 0) {
        base64 += '='.repeat(4 - padding);
      }
      
      // Decodificar de Base64 para UTF-8
      return Buffer.from(base64, 'base64').toString('utf8');
    }
  
    /**
     * Extrai o tipo de token (id ou access) do payload
     * @param token - Token JWT
     * @returns 'id', 'access' ou undefined
     */
    static getTokenType(token: string): 'id' | 'access' | undefined {
      const decoded = this.decode(token);
      return decoded?.payload?.token_use;
    }
  
    /**
     * Valida se o token é válido (formato correto e não expirado)
     * @param token - Token JWT a ser validado
     * @returns true se o token é válido
     */
    static isValid(token: string): boolean {
      if (!this.isValidJWT(token)) {
        return false;
      }
  
      const decoded = this.decode(token);
      if (!decoded) {
        return false;
      }
  
      // Verificar expiração se houver exp no payload
      if (decoded.payload.exp !== undefined) {
        return !this.isExpired(decoded.payload.exp);
      }
  
      // Se não tem exp, consideramos válido (pelo formato)
      return true;
    }
  }