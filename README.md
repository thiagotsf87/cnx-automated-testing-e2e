# 🧪 Conexão Biotec - Testes Automatizados E2E

Este projeto contém a suíte de testes end-to-end (E2E) para a aplicação **Conexão Biotec**, focada na automação de diversos fluxos e regras de negócio, incluindo sistemas de permissionamento, monitoramento de lavouras e gestão de tickets.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração](#-configuração)
- [Execução dos Testes](#-execução-dos-testes)
- [Sistema de Roles](#-sistema-de-roles)
- [Fluxos de Negócio](#-fluxos-de-negócio)
- [Arquitetura](#-arquitetura)
- [Contribuição](#-contribuição)

## 🎯 Visão Geral

O projeto automatiza testes para uma aplicação de biotecnologia agrícola que gerencia:

- **Sistema de Permissionamento**: 12 diferentes tipos de usuários com níveis de acesso específicos
- **Monitoramento de Lavouras**: Criação e gestão de tickets de auditoria
- **Gestão de Chamados**: Workflows de aprovação e análise
- **Integração com APIs**: AWS Lambda para processamento de dados

## 🛠 Tecnologias

- **Playwright**: Framework de automação de testes E2E
- **TypeScript**: Linguagem de programação
- **Node.js**: Runtime JavaScript
- **Yarn**: Gerenciador de pacotes
- **Dotenv**: Gerenciamento de variáveis de ambiente
- **Faker.js**: Geração de dados de teste

## 📁 Estrutura do Projeto

```
cnx-automated-testing-e2e/
├── tests/
│   ├── e2e/                    # Testes de interface
│   │   ├── permissions/         # Testes de permissionamento
│   │   │   ├── admin.spec.ts
│   │   │   ├── n1.spec.ts
│   │   │   ├── n2.spec.ts
│   │   │   └── ... (13 arquivos)
│   │   ├── crop-monitoring/     # Testes de monitoramento
│   │   └── home.spec.ts         # Teste básico de login
│   ├── api/                     # Testes de API
│   │   └── crop-monitoring/
│   │       └── create-ticket.spec.ts
│   ├── support/                 # Utilitários e page objects
│   │   ├── pages/
│   │   │   └── login.page.ts
│   │   ├── utils/
│   │   │   ├── role.ts
│   │   │   └── token.ts
│   │   └── api/
│   │       └── crop-monitoring/
│   ├── setup/
│   │   └── global-setup.ts      # Configuração global
│   └── test-data/               # Dados de teste
├── storage/                     # Estados de autenticação
├── playwright.config.ts         # Configuração do Playwright
├── package.json
└── .env                         # Variáveis de ambiente
```

## ⚙️ Configuração

### 1. Instalação de Dependências

```bash
yarn install
```

### 2. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais dos usuários:

```env
BASE_URL='https://stg.conexaobiotec.com.br/?login=true'

# Credenciais dos usuários
ADMIN_CPF='47799782030'
ADMIN_PASSWORD='#Teste123'

N1_CPF='01234567890'
N1_PASSWORD='#Teste123'

N2_CPF='01234567891'
N2_PASSWORD='#Teste123'

# ... outras credenciais
```

### 3. Instalação do Playwright

```bash
npx playwright install
```

## 🚀 Execução dos Testes

### Comandos Principais

```bash
# Executar todos os testes
npx playwright test

# Executar testes específicos de permissionamento
npx playwright test --project=chromium-admin
npx playwright test --project=chromium-n1
npx playwright test --project=chromium-n2

# Executar múltiplos projetos
npx playwright test --project=chromium-admin --project=chromium-n2

# Executar com relatório HTML
npx playwright test --reporter=html
```

### Scripts Disponíveis

```bash
# Testar admin
yarn test:admin

# Testar N2
yarn test:n2

# Testar admin e N2 juntos
yarn test:two
```

## 👥 Sistema de Roles

O projeto testa **12 diferentes perfis de usuário**, cada um com suas permissões específicas:

| Role                   | Descrição                       | Arquivo Storage           |
| ---------------------- | ------------------------------- | ------------------------- |
| **Admin**              | Administrador                   | `admin.json`              |
| **N1**                 | Analista Nível 1                | `n1.json`                 |
| **N2**                 | Analista Nível 2                | `n2.json`                 |
| **N3**                 | Analista Nível 3                | `n3.json`                 |
| **Auditor**            | Auditor                         | `auditor.json`            |
| **Agricultor**         | Agricultor                      | `agricultor.json`         |
| **RTV**                | Representante Técnico de Vendas | `rtv.json`                |
| **RTI**                | Representante Técnico Interno   | `rti.json`                |
| **B2B**                | Business to Business            | `b2b.json`                |
| **Avaliador**          | Avaliador                       | `avaliador.json`          |
| **Avaliados Cashback** | Avaliados Cashback              | `avaliados_cashback.json` |
| **Multiplicador**      | Multiplicador                   | `multiplicador.json`      |
| **Distribuidor**       | Distribuidor                    | `distribuidor.json`       |

### Validação de Permissões

Cada teste de permissionamento verifica:

- ✅ Login bem-sucedido
- ✅ Exibição do rótulo correto na interface
- ✅ Acesso às funcionalidades apropriadas

## 🔄 Fluxos de Negócio

### 1. Sistema de Monitoramento de Lavouras

**API Endpoints Testados:**

- `POST /ticket/crop-monitoring` - Criação de tickets
- `PUT /user/crop-monitoring-participations` - Atualização de participações

**Dados de Teste:**

- Justificativas de auditoria
- Premissas legais contratuais
- Áreas de colheita e potencial
- Contatos preferenciais

### 2. Gestão de Chamados

**Funcionalidades Testadas:**

- Abertura de chamados
- Workflows de aprovação
- Transferência de volume
- Volume adicional
- Atendimento ao cliente

### 3. Sistema de Autenticação

**Características:**

- Login automático via global setup
- Persistência de sessões
- Validação de tokens JWT
- Gestão de storage states

## 🏗 Arquitetura

### Global Setup

- **Autenticação Automática**: Gera storage states para todos os roles
- **Validação de Login**: Verifica se o rótulo correto aparece
- **Otimização**: Reutiliza storages existentes
- **Flexibilidade**: Executa apenas roles necessários

### Configuração de Projetos

```typescript
// Exemplo de configuração de projeto
{
  name: 'chromium-admin',
  testMatch: /e2e\/permissions\/admin\.spec\.ts$/,
  use: {
    ...devices['Desktop Chrome'],
    storageState: 'storage/admin.json'
  },
}
```

### Page Objects

- **LoginPage**: Abstração para operações de login
- **CropMonitoringService**: Serviços de API
- **Utils**: Funções auxiliares para validação

## 📊 Relatórios

### Relatório HTML

```bash
npx playwright test --reporter=html
```

Acesse: `playwright-report/index.html`

### Screenshots e Vídeos

- Screenshots em falhas: `test-results/`
- Vídeos de execução: `test-results/`
- Trace files: Para debugging detalhado

## 🔧 Manutenção

### Atualização de Credenciais

1. Edite o arquivo `.env`
2. Delete o storage correspondente: `rm storage/role.json`
3. Execute o teste para regenerar o storage

### Adição de Novos Roles

1. Adicione credenciais no `.env`
2. Crie arquivo de teste em `tests/e2e/permissions/`
3. Configure projeto no `playwright.config.ts`
4. Atualize o `global-setup.ts`

### Debugging

```bash
# Executar com debug
npx playwright test --debug

# Executar em modo headed
npx playwright test --headed

# Executar com trace
npx playwright test --trace=on
```

## 🚨 Troubleshooting

### Problemas Comuns

**1. Storage não encontrado**

```bash
Error: ENOENT: no such file or directory, open 'storage/admin.json'
```

**Solução**: Execute o global setup ou delete o storage para regenerar

**2. Credenciais inválidas**

```bash
Error: Esperava ver o rótulo exato "Administrador"
```

**Solução**: Verifique as credenciais no `.env` e regenere o storage

**3. Timeout em testes**

```bash
Error: Timeout 15000ms exceeded
```

**Solução**: Aumente o timeout no `playwright.config.ts` ou verifique conectividade

## 📈 Métricas de Sucesso

- ✅ **100% dos testes de permissionamento passando**
- ✅ **12 roles diferentes validados**
- ✅ **Execução paralela otimizada (6 workers)**
- ✅ **Tempo médio de execução: ~12 segundos**

## 🤝 Contribuição

### Padrões de Código

- Use TypeScript para type safety
- Siga a estrutura de Page Objects
- Documente novos fluxos de negócio
- Mantenha testes independentes

### Processo de Desenvolvimento

1. Crie branch para nova funcionalidade
2. Implemente testes seguindo padrões existentes
3. Execute suite completa antes do commit
4. Documente mudanças no README

## 📞 Suporte

Para dúvidas ou problemas:

- Verifique os logs de execução
- Consulte a documentação do Playwright
- Analise screenshots em caso de falha
- Verifique conectividade com ambiente de staging

---

**Versão**: 1.0.0  
**Ambiente**: Staging (stg.conexaobiotec.com.br)  
**Última Atualização**: Setembro 2025
