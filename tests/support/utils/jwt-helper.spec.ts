import { test, expect } from '@playwright/test';
import { JWTHelper } from './jwt-helper';

test.describe('JWTHelper', () => {
  // Token de exemplo (gerado para teste, já expirado)
  const validFormatToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsInRva2VuX3VzZSI6ImlkIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const invalidToken = 'invalid.token';
  const malformedToken = 'only.two';

  test('deve validar formato de JWT correto', () => {
    expect(JWTHelper.isValidJWT(validFormatToken)).toBe(true);
    console.log('✅ Formato de JWT válido reconhecido');
  });

  test('deve invalidar formato de JWT incorreto', () => {
    expect(JWTHelper.isValidJWT(invalidToken)).toBe(false);
    expect(JWTHelper.isValidJWT(malformedToken)).toBe(false);
    expect(JWTHelper.isValidJWT('a.b')).toBe(false);
    expect(JWTHelper.isValidJWT('')).toBe(false);
    expect(JWTHelper.isValidJWT('...')).toBe(false);
    console.log('✅ Formatos inválidos rejeitados');
  });

  test('deve decodificar JWT válido', () => {
    const decoded = JWTHelper.decode(validFormatToken);
    
    expect(decoded).not.toBeNull();
    expect(decoded?.payload).toBeDefined();
    expect(decoded?.header).toBeDefined();
    expect(decoded?.raw).toBe(validFormatToken);
    
    console.log('✅ JWT decodificado com sucesso');
    console.log('   Header:', decoded?.header);
    console.log('   Payload:', decoded?.payload);
  });

  test('deve retornar null para token inválido', () => {
    const decoded = JWTHelper.decode(invalidToken);
    expect(decoded).toBeNull();
    console.log('✅ Token inválido retorna null');
  });

  test('deve detectar token expirado', () => {
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hora atrás
    expect(JWTHelper.isExpired(expiredTimestamp)).toBe(true);
    console.log('✅ Token expirado detectado');
  });

  test('deve detectar token válido (não expirado)', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hora no futuro
    expect(JWTHelper.isExpired(futureTimestamp)).toBe(false);
    console.log('✅ Token válido detectado');
  });

  test('deve extrair tipo de token', () => {
    const tokenType = JWTHelper.getTokenType(validFormatToken);
    
    expect(tokenType).toBe('id');
    console.log('✅ Tipo de token extraído:', tokenType);
  });

  test('deve obter informações de expiração', () => {
    const expirationInfo = JWTHelper.getExpirationInfo(validFormatToken);
    
    expect(expirationInfo).not.toBeNull();
    expect(expirationInfo?.exp).toBeDefined();
    expect(expirationInfo?.expiresAt).toBeInstanceOf(Date);
    expect(expirationInfo?.isExpired).toBeDefined();
    
    console.log('✅ Informações de expiração obtidas');
    console.log('   Expira em:', expirationInfo?.expiresAt.toISOString());
    console.log('   Está expirado:', expirationInfo?.isExpired);
    console.log('   Tempo restante:', expirationInfo?.timeRemaining, 'segundos');
  });

  test('deve validar token completo', () => {
    // Token expirado = inválido
    expect(JWTHelper.isValid(validFormatToken)).toBe(false);
    
    // Token mal formatado = inválido
    expect(JWTHelper.isValid(invalidToken)).toBe(false);
    
    console.log('✅ Validação completa de token funcionando');
  });
});