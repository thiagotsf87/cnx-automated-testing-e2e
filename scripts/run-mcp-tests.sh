#!/bin/bash

# Script para executar testes Playwright com MCP
# Uso: ./scripts/run-mcp-tests.sh [tipo_de_teste]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verifica se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Configurações padrão
TEST_TYPE=${1:-"all"}
BASE_URL=${BASE_URL:-"https://stg.conexaobiotec.com.br"}
CI=${CI:-false}
DEBUG=${DEBUG:-false}

log "🎭 Iniciando testes Playwright MCP..."
log "Tipo de teste: $TEST_TYPE"
log "Base URL: $BASE_URL"
log "CI Mode: $CI"
log "Debug Mode: $DEBUG"

# Instala dependências se necessário
if [ ! -d "node_modules" ]; then
    log "📦 Instalando dependências..."
    yarn install
fi

# Instala Playwright MCP Server se não estiver instalado
if ! yarn list playwright-mcp-server >/dev/null 2>&1; then
    log "🔧 Instalando Playwright MCP Server..."
    yarn add playwright-mcp-server
fi

# Instala browsers do Playwright
log "🌐 Instalando browsers do Playwright..."
npx playwright install chromium

# Cria diretórios necessários
mkdir -p test-results playwright-report screenshots

# Função para executar testes
run_tests() {
    local test_command=$1
    local test_name=$2
    
    log "🚀 Executando $test_name..."
    
    if eval "$test_command"; then
        success "$test_name concluído com sucesso!"
        return 0
    else
        error "$test_name falhou!"
        return 1
    fi
}

# Executa testes baseado no tipo
case "$TEST_TYPE" in
    "api")
        run_tests "yarn test:api" "Testes de API"
        ;;
    "e2e")
        run_tests "yarn test:e2e" "Testes E2E"
        ;;
    "smoke")
        run_tests "yarn test:smoke" "Testes de Smoke"
        ;;
    "permissions")
        run_tests "yarn test:permissions" "Testes de Permissões"
        ;;
    "visual")
        log "🖼️ Executando testes de regressão visual..."
        if [ "$2" == "--update" ]; then
            run_tests "yarn test:e2e --update-snapshots" "Testes Visuais (Atualizando baselines)"
        else
            run_tests "yarn test:e2e" "Testes de Regressão Visual"
        fi
        ;;
    "debug")
        log "🐛 Executando testes em modo debug..."
        run_tests "yarn test:debug" "Testes em Modo Debug"
        ;;
    "all")
        log "🔄 Executando todos os testes..."
        
        # Executa testes em sequência para evitar conflitos
        run_tests "yarn test:api" "Testes de API" || true
        run_tests "yarn test:e2e" "Testes E2E" || true
        run_tests "yarn test:smoke" "Testes de Smoke" || true
        run_tests "yarn test:permissions" "Testes de Permissões" || true
        ;;
    *)
        error "Tipo de teste inválido: $TEST_TYPE"
        echo "Tipos disponíveis: api, e2e, smoke, permissions, visual, debug, all"
        exit 1
        ;;
esac

# Gera relatório final
log "📊 Gerando relatório final..."

# Conta resultados
TOTAL_TESTS=$(find test-results -name "*.json" -exec cat {} \; | jq -r '.stats.total // 0' | awk '{sum += $1} END {print sum}')
PASSED_TESTS=$(find test-results -name "*.json" -exec cat {} \; | jq -r '.stats.passed // 0' | awk '{sum += $1} END {print sum}')
FAILED_TESTS=$(find test-results -name "*.json" -exec cat {} \; | jq -r '.stats.failed // 0' | awk '{sum += $1} END {print sum}')

log "📈 Estatísticas finais:"
echo "  - Total de testes: $TOTAL_TESTS"
echo "  - Passou: $PASSED_TESTS"
echo "  - Falhou: $FAILED_TESTS"

# Abre relatório se não estiver em CI
if [ "$CI" != "true" ] && [ -f "playwright-report/index.html" ]; then
    log "🌐 Abrindo relatório no navegador..."
    yarn report:open
fi

# Verifica se houve falhas
if [ "$FAILED_TESTS" -gt 0 ]; then
    warning "Alguns testes falharam. Verifique o relatório para detalhes."
    exit 1
else
    success "Todos os testes passaram! 🎉"
    exit 0
fi

