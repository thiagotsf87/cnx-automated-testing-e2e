/**
 * Configuração do MCP Playwright para GitHub Actions
 * Este arquivo contém configurações específicas para execução em CI/CD
 */

module.exports = {
  // Configurações do MCP Playwright
  mcp: {
    enabled: true,
    server: {
      port: process.env.MCP_PORT || 3001,
      host: 'localhost'
    },
    browser: {
      // Configurações específicas para CI
      headless: process.env.CI ? true : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    },
    // Configurações de timeout para CI
    timeouts: {
      navigation: 30000,
      action: 10000,
      test: 60000
    },
    // Configurações de retry para CI
    retries: process.env.CI ? 3 : 1,
    // Configurações de workers para CI
    workers: process.env.CI ? 1 : 4
  },

  // Configurações específicas para GitHub Actions
  github: {
    // Upload de artifacts
    artifacts: {
      enabled: true,
      retentionDays: 30,
      include: [
        'playwright-report/**/*',
        'test-results/**/*',
        'screenshots/**/*',
        'videos/**/*'
      ]
    },
    
    // Configurações de comentários em PR
    prComments: {
      enabled: true,
      template: `
## 🎭 Playwright MCP Test Results

### 📊 Estatísticas
- **Status**: {{status}}
- **Duração**: {{duration}}s
- **Testes**: {{total}}
- **Passou**: {{passed}} ✅
- **Falhou**: {{failed}} ❌
- **Pulou**: {{skipped}} ⏭️

### 📁 Artefatos
- [Relatório HTML]({{reportUrl}})
- [Screenshots de falha]({{screenshotsUrl}})
- [Vídeos de falha]({{videosUrl}})

### 🔍 Detalhes
{{#if failures}}
**Testes que falharam:**
{{#each failures}}
- {{this.title}} - {{this.error}}
{{/each}}
{{else}}
✅ **Todos os testes passaram!**
{{/if}}
      `
    },

    // Configurações de notificação
    notifications: {
      slack: {
        enabled: process.env.SLACK_WEBHOOK_URL ? true : false,
        channel: '#qa-automation',
        template: `
🎭 **Playwright MCP Tests** - {{branch}}

📊 **Resultados:**
- Status: {{status}}
- Testes: {{total}}
- Passou: {{passed}} ✅
- Falhou: {{failed}} ❌

🔗 **Links:**
- Commit: {{commitUrl}}
- Workflow: {{workflowUrl}}
- Relatório: {{reportUrl}}
        `
      }
    }
  },

  // Configurações de ambiente
  environments: {
    staging: {
      baseUrl: 'https://stg.conexaobiotec.com.br',
      credentials: {
        cpf: '477.997.820-30',
        password: '#Teste123'
      }
    },
    production: {
      baseUrl: 'https://conexaobiotec.com.br',
      credentials: {
        // Credenciais de produção seriam definidas via secrets
        cpf: process.env.PROD_CPF,
        password: process.env.PROD_PASSWORD
      }
    }
  },

  // Configurações de teste
  tests: {
    // Configurações para diferentes tipos de teste
    smoke: {
      timeout: 15000,
      retries: 2,
      parallel: false
    },
    regression: {
      timeout: 30000,
      retries: 1,
      parallel: true
    },
    api: {
      timeout: 10000,
      retries: 3,
      parallel: true
    }
  },

  // Configurações de relatório
  reporting: {
    html: {
      enabled: true,
      outputDir: 'playwright-report',
      open: false
    },
    json: {
      enabled: true,
      outputFile: 'test-results/results.json'
    },
    junit: {
      enabled: true,
      outputFile: 'test-results/junit.xml'
    },
    blob: {
      enabled: true,
      outputFile: 'test-results/blob-report.zip'
    }
  },

  // Configurações de debug
  debug: {
    enabled: process.env.DEBUG === 'true',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
};

