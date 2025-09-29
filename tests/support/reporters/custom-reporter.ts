import {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  roles: Record<string, { passed: number; failed: number; total: number }>;
}

class CustomReporter implements Reporter {
  private startTime: number = 0;
  private summary: TestSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    roles: {},
  };

  onBegin(config: FullConfig, _suite: Suite) {
    this.startTime = Date.now();
    console.log('🚀 Iniciando execução de testes...');
    console.log(`📊 Configuração: ${config.projects.length} projeto(s)`);
    console.log(`⚙️  Workers: ${config.workers || 'default'}`);
    console.log(`⏱️  Timeout: ${config.globalTimeout || 30000}ms`);
    console.log('');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.summary.total++;

    if (result.status === 'passed') {
      this.summary.passed++;
    } else if (result.status === 'failed') {
      this.summary.failed++;
    } else if (result.status === 'skipped') {
      this.summary.skipped++;
    }

    // Extrair informações do role do teste (buscar no suite title)
    let roleMatch = null;
    let suite: Suite | undefined = test.parent;
    while (suite && !roleMatch) {
      roleMatch = suite.title.match(/Permissionamento \| ([A-Z0-9_]+)/);
      suite = suite.parent;
    }

    if (roleMatch && roleMatch[1]) {
      const role = roleMatch[1].toLowerCase();
      if (!this.summary.roles[role]) {
        this.summary.roles[role] = { passed: 0, failed: 0, total: 0 };
      }

      this.summary.roles[role].total++;
      if (result.status === 'passed') {
        this.summary.roles[role].passed++;
      } else if (result.status === 'failed') {
        this.summary.roles[role].failed++;
      }
    }

    // Log do resultado individual
    const status = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
    const duration = `${(result.duration / 1000).toFixed(1)}s`;
    const role = roleMatch && roleMatch[1] ? roleMatch[1] : 'Unknown';

    console.log(`${status} ${role.padEnd(12)} | ${duration.padStart(6)} | ${test.title}`);

    if (result.status === 'failed' && result.error) {
      console.log(`   💥 Erro: ${result.error.message}`);
    }
  }

  onEnd(_result: FullResult) {
    this.summary.duration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DOS TESTES DE PERMISSIONAMENTO');
    console.log('='.repeat(60));

    // Estatísticas gerais
    console.log(`📈 Total de testes: ${this.summary.total}`);
    console.log(
      `✅ Passou: ${this.summary.passed} (${this.getPercentage(this.summary.passed, this.summary.total)}%)`,
    );
    console.log(
      `❌ Falhou: ${this.summary.failed} (${this.getPercentage(this.summary.failed, this.summary.total)}%)`,
    );
    console.log(
      `⏭️  Pulou: ${this.summary.skipped} (${this.getPercentage(this.summary.skipped, this.summary.total)}%)`,
    );
    console.log(`⏱️  Duração total: ${(this.summary.duration / 1000).toFixed(1)}s`);

    // Estatísticas por role
    console.log('\n📋 RESULTADO POR ROLE:');
    console.log('-'.repeat(40));
    Object.entries(this.summary.roles).forEach(([role, stats]) => {
      const status = stats.failed === 0 ? '✅' : '❌';
      const percentage = this.getPercentage(stats.passed, stats.total);
      console.log(
        `${status} ${role.toUpperCase().padEnd(15)} | ${stats.passed}/${stats.total} (${percentage}%)`,
      );
    });

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    if (this.summary.failed === 0) {
      console.log('🎉 Todos os testes de permissionamento passaram!');
      console.log('✅ Sistema de autenticação funcionando perfeitamente');
    } else {
      console.log('⚠️  Alguns testes falharam - verifique os logs acima');
      console.log('🔍 Analise os screenshots e vídeos em test-results/');
    }

    console.log('\n📁 Relatórios gerados:');
    console.log('   📄 HTML: playwright-report/index.html');
    console.log('   📊 JSON: test-results/results.json');
    console.log('   📋 JUnit: test-results/junit.xml');

    console.log('='.repeat(60));
  }

  private getPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  }
}

export default CustomReporter;
