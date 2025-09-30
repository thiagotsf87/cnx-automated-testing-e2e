# 🎭 Playwright MCP - GitHub Actions Workflows

Este diretório contém os workflows do GitHub Actions para execução automatizada de testes usando o MCP (Model Context Protocol) do Playwright.

## 📁 Arquivos de Workflow

### 1. `playwright-mcp.yml` - Workflow Principal
**Descrição**: Workflow completo com múltiplos jobs para diferentes tipos de teste.

**Características**:
- ✅ Execução em múltiplos navegadores (Chromium, Firefox, WebKit)
- ✅ Jobs separados para API, E2E, Smoke e Permissions
- ✅ Upload de artifacts e relatórios
- ✅ Notificações via Slack
- ✅ Deploy automático de relatórios para GitHub Pages
- ✅ Execução manual com seleção de tipo de teste

**Triggers**:
- Push para `main` e `develop`
- Pull Requests para `main` e `develop`
- Execução manual com parâmetros

### 2. `playwright-mcp-simple.yml` - Workflow Simplificado
**Descrição**: Workflow mais simples e rápido para execução diária.

**Características**:
- ✅ Execução rápida (15-45 minutos)
- ✅ Comentários automáticos em PRs
- ✅ Limpeza automática de artifacts antigos
- ✅ Execução agendada diariamente às 2h UTC

**Triggers**:
- Push para `main` e `develop`
- Pull Requests para `main` e `develop`
- Execução agendada (cron: `0 2 * * *`)

### 3. `playwright-mcp-visual.yml` - Testes Visuais
**Descrição**: Workflow especializado em testes de regressão visual.

**Características**:
- ✅ Geração de imagens baseline
- ✅ Comparação visual de screenshots
- ✅ Relatórios de performance visual
- ✅ Análise de métricas de teste

**Triggers**:
- Push para `main` e `develop`
- Pull Requests para `main` e `develop`
- Execução manual com opção de gerar baseline

## 🚀 Como Usar

### Execução Automática
Os workflows são executados automaticamente quando:
- Você faz push para as branches `main` ou `develop`
- Você cria um Pull Request para essas branches
- O cron job executa (apenas o workflow simples)

### Execução Manual

1. **Via GitHub UI**:
   - Vá para a aba "Actions" no repositório
   - Selecione o workflow desejado
   - Clique em "Run workflow"
   - Escolha os parâmetros (se disponível)

2. **Via Script Local**:
   ```bash
   # Executa todos os testes
   ./scripts/run-mcp-tests.sh all
   
   # Executa apenas testes de API
   ./scripts/run-mcp-tests.sh api
   
   # Executa testes visuais
   ./scripts/run-mcp-tests.sh visual
   
   # Atualiza baselines visuais
   ./scripts/run-mcp-tests.sh visual --update
   ```

### Parâmetros de Execução

#### Workflow Principal (`playwright-mcp.yml`)
- `test_type`: Tipo de teste a executar
  - `all`: Todos os testes
  - `api`: Apenas testes de API
  - `e2e`: Apenas testes E2E
  - `smoke`: Apenas testes de smoke
  - `permissions`: Apenas testes de permissões

#### Workflow Visual (`playwright-mcp-visual.yml`)
- `generate_baseline`: Gerar novas imagens baseline
  - `true`: Atualiza as imagens de referência
  - `false`: Executa comparação visual (padrão)

## 📊 Relatórios e Artifacts

### Artifacts Gerados
- **playwright-report-{browser}**: Relatórios HTML por navegador
- **playwright-failures-{browser}**: Screenshots e vídeos de falhas
- **api-test-results**: Resultados dos testes de API
- **smoke-test-results**: Resultados dos testes de smoke
- **permissions-test-results**: Resultados dos testes de permissões
- **visual-test-results**: Screenshots e comparações visuais
- **visual-report**: Relatório HTML de testes visuais
- **performance-report**: Análise de performance dos testes

### Acesso aos Relatórios
1. **Durante a execução**: Visite a aba "Actions" do GitHub
2. **Após execução**: Download dos artifacts
3. **Relatório online**: GitHub Pages (workflow principal)
4. **Comentários em PR**: Resumo automático dos resultados

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

#### Obrigatórias
- `BASE_URL`: URL base da aplicação (ex: `https://stg.conexaobiotec.com.br`)

#### Opcionais
- `SLACK_WEBHOOK_URL`: Para notificações no Slack
- `DEBUG`: Ativar modo debug (`true`/`false`)
- `CI`: Indicar execução em CI (`true`/`false`)

### Secrets do GitHub
Configure os seguintes secrets no repositório:
- `SLACK_WEBHOOK_URL`: Webhook do Slack para notificações
- `PROD_CPF`: CPF para testes em produção (se necessário)
- `PROD_PASSWORD`: Senha para testes em produção (se necessário)

### Configuração do MCP
O arquivo `mcp-playwright.config.js` contém configurações específicas para o MCP Playwright, incluindo:
- Configurações de browser
- Timeouts e retries
- Configurações de relatório
- Configurações de notificação

## 🐛 Troubleshooting

### Problemas Comuns

1. **Falha na instalação de dependências**:
   - Verifique se o `yarn.lock` está atualizado
   - Execute `yarn install` localmente

2. **Timeouts nos testes**:
   - Ajuste os timeouts no `playwright.config.ts`
   - Verifique a conectividade com a aplicação

3. **Falhas de screenshot**:
   - Verifique se o diretório `screenshots/` existe
   - Confirme permissões de escrita

4. **Problemas com MCP**:
   - Verifique se `playwright-mcp-server` está instalado
   - Confirme a configuração no `mcp-playwright.config.js`

### Logs e Debug
- **Logs detalhados**: Disponíveis na aba "Actions" do GitHub
- **Screenshots de falha**: Upload automático em artifacts
- **Vídeos de falha**: Upload automático em artifacts
- **Traces**: Disponíveis para testes que falharam

## 📈 Métricas e Performance

### Métricas Coletadas
- Tempo total de execução
- Número de testes executados
- Taxa de sucesso/falha
- Tamanho dos artifacts gerados
- Performance de diferentes navegadores

### Otimizações
- **Paralelização**: Testes de API executam em paralelo
- **Caching**: Dependências e browsers são cacheados
- **Artifacts**: Limpeza automática de artifacts antigos
- **Retries**: Configuração inteligente de tentativas

## 🔄 Manutenção

### Atualizações Regulares
- **Dependências**: Atualize regularmente o Playwright e MCP
- **Browsers**: Mantenha os browsers atualizados
- **Baselines visuais**: Atualize quando houver mudanças na UI

### Monitoramento
- Configure alertas para falhas recorrentes
- Monitore o tempo de execução dos workflows
- Acompanhe o uso de recursos (storage, compute)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do workflow
2. Consulte a documentação do Playwright MCP
3. Abra uma issue no repositório
4. Entre em contato com a equipe de QA

---

**Última atualização**: $(date)
**Versão**: 1.0.0

