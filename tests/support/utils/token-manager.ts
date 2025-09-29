import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { JWTHelper } from './jwt-helper';

/**
 * TokenManager class for automatic token validation
 * Handles token validation for E2E tests
 */
export class TokenManager {
  private static readonly STORAGE_DIR = 'storage';

  /**
   * Validates if a token exists and is not expired
   * @param role - The role name (e.g., 'admin', 'agricultor')
   * @returns Promise<boolean> - true if token is valid, false otherwise
   */
  static async validateToken(role: string): Promise<boolean> {
    const tokenPath = path.join(this.STORAGE_DIR, `${role}.json`);

    console.log(`🔄 Checking ${role} token validity...`);

    // Check if storage file exists
    if (!existsSync(tokenPath)) {
      console.log(`⚠️ Token file not found: ${tokenPath}`);
      return false;
    }

    try {
      // Read and parse the storage file
      const storageContent = readFileSync(tokenPath, 'utf8');
      const storage = JSON.parse(storageContent);

      if (!storage.origins || !storage.origins[0] || !storage.origins[0].localStorage) {
        console.log(`⚠️ Invalid storage format for ${role}`);
        return false;
      }

      // Find the token in localStorage using same logic as getBearerTokenFromStorage
      const localStorage = storage.origins[0].localStorage;
      const entries = localStorage.map((item: any) => [item.name, item.value]);

      // Selection logic (same as getBearerTokenFromStorage)
      const pick = (pred: (k: string, v: string) => boolean) =>
        entries.find(([k, v]: [string, string]) => pred(k, v))?.[1];

      const token =
        // 1) chaves que parecem idToken
        pick((k: string) => /idtoken|id_token/i.test(k)) ||
        // 2) tokens com token_use === 'id'
        pick((_, v) => JWTHelper.getTokenType(v) === 'id') ||
        // 3) chaves de access token
        pick(k => /accesstoken|access_token/i.test(k)) ||
        // 4) token_use === 'access'
        pick((_, v) => JWTHelper.getTokenType(v) === 'access') ||
        // 5) qualquer JWT encontrado
        entries.find(([, v]: [string, string]) => typeof v === 'string' && JWTHelper.isValidJWT(v))?.[1];

      if (!token || typeof token !== 'string') {
        console.log(`⚠️ No token found in storage for ${role}`);
        return false;
      }

      // Validar token usando JWTHelper
      if (!JWTHelper.isValid(token)) {
        const expirationInfo = JWTHelper.getExpirationInfo(token);
        
        if (expirationInfo?.isExpired) {
          console.log(
            `⚠️ Token expired for ${role} (exp: ${expirationInfo.exp}, expired at: ${expirationInfo.expiresAt.toISOString()})`,
          );
        } else {
          console.log(`⚠️ Invalid token format for ${role}`);
        }
        
        return false;
      }

      const expirationInfo = JWTHelper.getExpirationInfo(token);
      if (expirationInfo) {
        const minutesRemaining = Math.floor(expirationInfo.timeRemaining / 60);
        console.log(
          `✅ Valid token found for ${role} (expires: ${expirationInfo.expiresAt.toISOString()}, ${minutesRemaining} minutes remaining)`,
        );
      }

      return true;
    } catch (error) {
      console.log(`❌ Error validating token for ${role}:`, error);
      return false;
    }
  }

  /**
   * Ensures a valid token exists for the specified role
   * Provides clear instructions if token is missing or expired
   * @param role - The role name
   * @returns Promise<void>
   */
  static async ensureValidToken(role: string): Promise<void> {
    console.log(`🔄 Checking ${role} token validity...`);

    const isValid = await this.validateToken(role);

    if (!isValid) {
      const tokenPath = path.join(this.STORAGE_DIR, `${role}.json`);
      const exists = existsSync(tokenPath);

      if (exists) {
        console.log(`⚠️ Token expired for ${role}`);
      } else {
        console.log(`⚠️ Token file missing for ${role}`);
      }

      throw new Error(
        `Token validation failed for ${role}. ` +
          'Please run: npx playwright test --global-setup',
      );
    }

    console.log(`✅ Valid token found for ${role}, proceeding...`);
  }
}