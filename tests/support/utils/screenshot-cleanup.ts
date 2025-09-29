import * as fs from 'fs';
import * as path from 'path';

/**
 * Limpa screenshots antigos da pasta screenshots/
 * Mantém apenas os screenshots dos últimos N dias
 */
export function cleanupOldScreenshots(daysToKeep: number = 1): void {
  const screenshotsDir = path.resolve('screenshots');

  // Verificar se a pasta existe
  if (!fs.existsSync(screenshotsDir)) {
    console.log('📁 Pasta screenshots não existe, criando...');
    fs.mkdirSync(screenshotsDir, { recursive: true });
    return;
  }

  const files = fs.readdirSync(screenshotsDir);
  const now = Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000; // 1 dia em milissegundos
  const cutoffTime = now - daysToKeep * oneDayInMs;

  let deletedCount = 0;
  let totalSize = 0;

  files.forEach(file => {
    const filePath = path.join(screenshotsDir, file);
    const stats = fs.statSync(filePath);

    // Verificar se é um arquivo de screenshot (PNG)
    if (file.endsWith('.png') && stats.mtime.getTime() < cutoffTime) {
      const fileSize = stats.size;
      fs.unlinkSync(filePath);
      deletedCount++;
      totalSize += fileSize;
      console.log(`🗑️  Removido: ${file} (${(fileSize / 1024).toFixed(1)}KB)`);
    }
  });

  if (deletedCount > 0) {
    console.log(
      `✅ Limpeza concluída: ${deletedCount} screenshots removidos (${(totalSize / 1024).toFixed(1)}KB liberados)`,
    );
  } else {
    console.log('📸 Nenhum screenshot antigo encontrado para remoção');
  }
}

/**
 * Limpa todos os screenshots da pasta (para execuções limpas)
 */
export function cleanupAllScreenshots(): void {
  const screenshotsDir = path.resolve('screenshots');

  if (!fs.existsSync(screenshotsDir)) {
    console.log('📁 Pasta screenshots não existe');
    return;
  }

  const files = fs.readdirSync(screenshotsDir);
  let deletedCount = 0;
  let totalSize = 0;

  files.forEach(file => {
    if (file.endsWith('.png')) {
      const filePath = path.join(screenshotsDir, file);
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      fs.unlinkSync(filePath);
      deletedCount++;
      totalSize += fileSize;
    }
  });

  if (deletedCount > 0) {
    console.log(
      `🧹 Limpeza completa: ${deletedCount} screenshots removidos (${(totalSize / 1024).toFixed(1)}KB liberados)`,
    );
  } else {
    console.log('📸 Pasta screenshots já estava limpa');
  }
}
