# 🌊 Git Flow - Guia Essencial para Time de QA

## 📊 Diagrama do Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                         REPOSITÓRIO                              │
└─────────────────────────────────────────────────────────────────┘

    main ─────●────────────────●──────────────●─────────────►
              │                │              │
              │ hotfix         │ release      │ hotfix
              │                │              │
 develop ─────●───●───●───●────●───●───●──────●───●───●──────►
              │   │   │   │        │   │          │   │
              │   │   └───┼────────┘   │          │   │
              │   │       │            │          │   │
   feature/   └───┼───────┘            │          │   │
   TICKET-123     │                    │          │   │
                  │                    │          │   │
   feature/       └────────────────────┘          │   │
   TICKET-456                                     │   │
                                                  │   │
   bugfix/                                        └───┘
   TICKET-789

● = commit
─ = linha temporal
```

### Fluxo de Trabalho

```
┌──────────────┐
│   FEATURE    │
│    PRONTA    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  CRIAR PR    │ ◄─── Branch atualizada com develop
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ CODE REVIEW  │ ◄─── Reviewer testa e analisa
└──────┬───────┘
       │
       ├─── ❌ Solicitar mudanças ──► QA corrige ──┐
       │                                           │
       ▼                                           │
   ✅ Aprovado                                     │
       │                                           │
       ▼                                           │
┌──────────────┐                                  │
│    MERGE     │ ◄────────────────────────────────┘
│  → develop   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   DELETAR    │
│    BRANCH    │
└──────────────┘
```

---

## 🌳 Estrutura das Branches

```
main (produção)
  │
  ├─ hotfix/*          ← Correções urgentes em produção
  │
  └─ develop (desenvolvimento)
       │
       ├─ feature/*    ← Novas funcionalidades e testes
       │
       ├─ bugfix/*     ← Correções de bugs
       │
       └─ test/*       ← Experimentos e POCs
```

### Descrição das Branches

| Branch | Descrição | Origem | Destino | Proteção |
|--------|-----------|--------|---------|----------|
| **main** | Código em produção | - | - | 🔒 Alta |
| **develop** | Integração contínua | main | main | 🔒 Média |
| **feature/** | Novas features | develop | develop | - |
| **bugfix/** | Correção de bugs | develop | develop | - |
| **hotfix/** | Correção urgente | main | main + develop | - |
| **test/** | Experimentos | develop | (não merge) | - |

---

## 📝 Padrão de Nomenclaturas

### Estrutura Geral

```
<tipo>/<ticket>-<descrição-curta>
```

### Exemplos por Tipo

#### Features (Novos testes ou funcionalidades)
```bash
feature/TICKET-123-adicionar-testes-api
feature/TICKET-456-implementar-page-object-checkout
feature/criar-testes-permissionamento
feature/melhorar-gestao-tokens
```

#### Bugfixes (Correção de testes falhando)
```bash
bugfix/TICKET-789-corrigir-teste-login
bugfix/TICKET-234-ajustar-seletor-agricultor
bugfix/corrigir-timeout-api
bugfix/resolver-falha-token-expirado
```

#### Hotfix (Correção urgente em produção)
```bash
hotfix/TICKET-999-corrigir-teste-critico
hotfix/TICKET-555-resolver-erro-producao
hotfix/corrigir-token-expirado
```

#### Test/Experiment (Testes experimentais)
```bash
test/poc-parallel-execution
test/explorar-nova-estrategia-dados
test/validar-nova-biblioteca
```

### ✅ Boas Práticas de Nomenclatura

- ✅ **Use kebab-case:** `adicionar-testes-api` (não `adicionarTestesApi` ou `adicionar_testes_api`)
- ✅ **Seja descritivo:** Inclua contexto suficiente
- ✅ **Máximo 50 caracteres:** Nomes concisos
- ✅ **Sem caracteres especiais:** Apenas letras, números e hífens
- ✅ **Inclua ticket quando possível:** `TICKET-123-descricao`

### ❌ Evite

- ❌ `feature/teste` (muito vago)
- ❌ `bugfix/fix` (não diz o que está corrigindo)
- ❌ `feature/adicionar_novos_testes_de_api_para_monitoramento` (muito longo)
- ❌ `feature/João-teste` (nome pessoal)
- ❌ `teste` (sem tipo)

---

## 🔧 Regras de Criação

### 1. Features e Bugfixes

```bash
# SEMPRE criar a partir de develop atualizada
git checkout develop
git pull origin develop
git checkout -b feature/TICKET-123-adicionar-testes-api
```

**Checklist antes de criar:**
- [ ] Branch develop está atualizada localmente
- [ ] Nome segue o padrão estabelecido
- [ ] Ticket existe e está atribuído a você
- [ ] Não há outra branch com o mesmo nome

### 2. Hotfix

```bash
# SEMPRE criar a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/TICKET-999-corrigir-teste-critico
```

**Checklist antes de criar:**
- [ ] É realmente urgente e crítico?
- [ ] Main está atualizada localmente
- [ ] Tech Lead foi notificado
- [ ] Tem aprovação para hotfix

### 3. Test/Experiment

```bash
# Criar a partir de develop
git checkout develop
git pull origin develop
git checkout -b test/poc-parallel-execution
```

**Checklist:**
- [ ] É realmente experimental?
- [ ] Não vai afetar develop?
- [ ] Sabe que pode ser descartada?

### 4. Regras Gerais

#### ✅ PERMITIDO

- Uma branch por pessoa por vez (máximo 2-3 ativas)
- Commits frequentes e pequenos
- Push diário para backup
- WIP (Work In Progress) em commits intermediários

#### ❌ NÃO PERMITIDO

- Criar branch a partir de outra feature branch
- Manter branch por mais de 5 dias sem PR
- Fazer merge manual sem code review
- Push direto em main ou develop
- Force push em branches compartilhadas

---

## 💬 Padrão de Mensagens de Commit

### Estrutura

```
<tipo>(<escopo>): <descrição curta em até 50 caracteres>

<corpo da mensagem - opcional, linhas com até 72 caracteres>

<rodapé - opcional>
```

### Componentes

**1. Tipo** (obrigatório)
- Define a natureza da mudança

**2. Escopo** (opcional, mas recomendado)
- Área do código afetada: `api`, `e2e`, `page-object`, `service`, `data`, `config`

**3. Descrição** (obrigatório)
- Presente do indicativo
- Minúscula
- Sem ponto final
- Máximo 50 caracteres

**4. Corpo** (opcional)
- Explica O QUE e POR QUÊ (não o COMO)
- Quebras de linha a cada 72 caracteres
- Separado do título por linha em branco

**5. Rodapé** (opcional)
- Referências: `Refs: TICKET-123`
- Issues fechadas: `Fixes: #45`
- Breaking changes: `BREAKING CHANGE: descrição`
- Co-autoria: `Co-authored-by: Nome <email>`

### Exemplos Completos

#### Exemplo 1: Commit Simples
```bash
test(api): adicionar validação de status bloqueados
```

#### Exemplo 2: Commit com Corpo
```bash
test(api): adicionar testes de bloqueio por status

Implementa validação para 9 status diferentes que devem
bloquear a criação de novos chamados. Adiciona função
utilitária executeBlockingTest para evitar duplicação.

Refs: TICKET-123
```

#### Exemplo 3: Commit de Pair Programming
```bash
refactor(data): centralizar gerenciamento de dados

Cria AgricultorDataManager para gerenciar todos os dados
de teste de forma centralizada. Remove duplicação em
múltiplos arquivos.

Co-authored-by: QA2 Name <qa2@email.com>
Refs: TICKET-456
```

#### Exemplo 4: Correção de Bug
```bash
fix(token): corrigir padding em decodificação JWT

Token falhava ao validar devido a padding incorreto no
base64. Implementa b64urlToUtf8 com padding automático.

Refs: TICKET-789
Fixes: #45
```

#### Exemplo 5: Breaking Change
```bash
refactor(data): reestruturar sistema de dados de teste

BREAKING CHANGE: getTestGrower() removido. Use
AgricultorDataManager.getPrimary() no lugar.

Migração necessária em todos os testes existentes.

Refs: TICKET-234
```

---

## 📋 Tipos de Commit

| Tipo | Descrição | Quando Usar | Exemplo |
|------|-----------|-------------|---------|
| **test** | Adicionar ou modificar testes | Criar novos testes ou alterar existentes | `test(api): adicionar testes de bloqueio` |
| **feat** | Nova funcionalidade | Adicionar Page Object, Service, Helper | `feat(page-object): criar CropMonitoringPage` |
| **fix** | Correção de bug | Corrigir teste falhando, erro de lógica | `fix(token): corrigir validação expirada` |
| **refactor** | Refatoração | Melhorar código sem mudar comportamento | `refactor(service): extrair lógica comum` |
| **docs** | Documentação | README, comentários, guias | `docs(readme): atualizar guia instalação` |
| **style** | Formatação | Prettier, indentação, espaços | `style: aplicar prettier em todos arquivos` |
| **chore** | Manutenção | Dependências, configuração, build | `chore: atualizar Playwright para v1.40` |
| **perf** | Performance | Otimizações de velocidade | `perf(api): paralelizar chamadas` |
| **ci** | CI/CD | Workflows, pipelines | `ci: adicionar testes noturnos` |
| **WIP** | Work in Progress | Commits intermediários incompletos | `WIP: test(api): implementando validação` |

### Detalhamento por Tipo

#### 🧪 test
```bash
# Adicionar novos testes
test(api): adicionar testes de criação de ticket

# Modificar testes existentes
test(e2e): atualizar seletores da tela de login

# Adicionar casos de teste
test(api): cobrir cenários de erro 422
```

#### ✨ feat
```bash
# Novo Page Object
feat(page-object): criar LoginPage class

# Novo Service
feat(service): adicionar TokenManager

# Nova função utilitária
feat(utils): criar helper de validação de CPF
```

#### 🐛 fix
```bash
# Corrigir teste falhando
fix(e2e): corrigir seletor do botão submit

# Corrigir lógica
fix(service): ajustar validação de token expirado

# Corrigir timeout
fix(api): aumentar timeout para 10 segundos
```

#### ♻️ refactor
```bash
# Extrair código duplicado
refactor(page-object): extrair métodos comuns para BasePage

# Melhorar estrutura
refactor(data): reorganizar fixtures de agricultores

# Simplificar código
refactor(service): simplificar lógica de validação
```

#### 📝 docs
```bash
# Atualizar README
docs(readme): adicionar seção de troubleshooting

# Adicionar comentários
docs(code): documentar função complexa

# Criar guia
docs: criar guia de git flow
```

#### 🔧 chore
```bash
# Atualizar dependências
chore(deps): atualizar Playwright para 1.40.0

# Configuração
chore: adicionar ESLint config

# Build
chore: atualizar tsconfig.json
```

### Escopos Comuns

| Escopo | Uso | Exemplo |
|--------|-----|---------|
| `api` | Testes de API | `test(api): adicionar validação` |
| `e2e` | Testes E2E | `test(e2e): criar fluxo completo` |
| `page-object` | Page Objects | `feat(page-object): criar nova page` |
| `service` | Services | `feat(service): adicionar helper` |
| `data` | Dados de teste | `refactor(data): centralizar fixtures` |
| `config` | Configurações | `chore(config): atualizar playwright.config` |
| `utils` | Utilitários | `feat(utils): criar helper de data` |
| `token` | Sistema de tokens | `fix(token): corrigir validação` |

---

## 👀 Code Review

### Processo de Review

```
┌─────────────────────────────────────────────────────────┐
│ 1. NOTIFICAÇÃO                                          │
│    ├─ QA1 abre PR                                       │
│    ├─ QA2 recebe notificação                            │
│    └─ SLA: Iniciar review em até 2 horas                │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│ 2. ANÁLISE INICIAL                                      │
│    ├─ Ler descrição do PR                               │
│    ├─ Verificar checklist preenchido                    │
│    ├─ Confirmar CI passou                               │
│    └─ Estimar tempo necessário (15-45min)               │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│ 3. BAIXAR E TESTAR                                      │
│    ├─ git fetch && git checkout branch                  │
│    ├─ npm install (se necessário)                       │
│    ├─ npm test (executar testes)                        │
│    └─ Testar casos de borda manualmente                 │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│ 4. ANÁLISE DE CÓDIGO                                    │
│    ├─ Lógica está correta?                              │
│    ├─ Código está limpo e legível?                      │
│    ├─ Segue padrões do projeto?                         │
│    ├─ Tem testes adequados?                             │
│    ├─ Documentação necessária?                          │
│    └─ Performance está OK?                              │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│ 5. DEIXAR FEEDBACK                                      │
│    ├─ Comentários construtivos                          │
│    ├─ Sugestões de melhoria                             │
│    └─ Elogios pelo bom trabalho                         │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│ 6. DECISÃO                                              │
│    ├─ ✅ Aprovar (LGTM - Looks Good To Me)             │
│    ├─ 💬 Comentar (sugestões sem bloquear)              │
│    └─ ❌ Solicitar mudanças (problemas a corrigir)      │
└─────────────────────────────────────────────────────────┘
```

### Checklist do Reviewer

#### ✅ Aspectos Técnicos

- [ ] **Funcionalidade**
  - Código faz o que deveria fazer?
  - Testes passam consistentemente?
  - Casos de borda cobertos?

- [ ] **Qualidade**
  - Código limpo e legível?
  - Nomes descritivos?
  - Sem código comentado ou debug?
  - Sem duplicação desnecessária?

- [ ] **Padrões**
  - Segue Page Object Pattern?
  - Usa convenções estabelecidas?
  - Formatação consistente (Prettier)?
  - Linter sem warnings?

- [ ] **Testes**
  - Cobertura adequada?
  - Testes independentes?
  - Não há testes flaky?
  - Mensagens de erro claras?

- [ ] **Performance**
  - Timeouts apropriados?
  - Sem esperas desnecessárias?
  - Uso eficiente de recursos?

- [ ] **Segurança**
  - Sem credenciais hardcoded?
  - Dados sensíveis em .env?
  - Tokens gerenciados corretamente?

#### 📝 Aspectos de Documentação

- [ ] Descrição do PR clara e completa?
- [ ] Referência ao ticket incluída?
- [ ] Comentários necessários no código?
- [ ] README atualizado (se necessário)?
- [ ] Screenshots incluídos (se UI)?

### Como Deixar Feedback

#### ✅ Feedback Construtivo (BOM)

```markdown
💡 **Sugestão:** Considere extrair essa lógica para um helper reutilizável.

Isso facilitaria o uso em outros testes e manteria o código DRY.
```

```markdown
❓ **Pergunta:** Por que escolheu essa abordagem em vez de usar o
`AgricultorDataManager`?

Só para entender o raciocínio!
```

```markdown
🐛 **Possível Bug:** E se o agricultor não existir no sistema? Esse
teste não vai falhar?

Talvez adicionar validação antes de criar o ticket.
```

```markdown
✨ **Elogio:** Excelente implementação! O uso do Builder Pattern
deixou o código muito mais legível.
```

#### ❌ Feedback Não Construtivo (EVITAR)

```markdown
❌ "Isso está errado."
✅ "Acho que há um problema aqui. Quando X acontecer, Y pode falhar..."
```

```markdown
❌ "Não faça assim."
✅ "Que tal tentar essa abordagem? [sugestão]"
```

```markdown
❌ "Código confuso."
✅ "Tive dificuldade em entender essa parte. Poderia adicionar
    um comentário explicando?"
```

### Tipos de Comentários

| Prefixo | Significado | Ação do Autor | Exemplo |
|---------|-------------|---------------|---------|
| 🐛 **bug:** | Possível erro | Corrigir | "🐛 bug: Falta validação de null" |
| 💡 **nitpick:** | Sugestão menor | Opcional | "💡 nitpick: Nome mais descritivo?" |
| ❓ **question:** | Dúvida | Explicar | "❓ question: Por que essa abordagem?" |
| 💭 **thought:** | Ideia futura | Apenas considerar | "💭 thought: Futuramente podemos..." |
| 🚨 **critical:** | Deve ser corrigido | Obrigatório | "🚨 critical: Security issue aqui" |
| ✨ **praise:** | Elogio | Continuar assim | "✨ praise: Implementação excelente!" |

### SLA (Service Level Agreement)

| Ação | Tempo Máximo | Prioridade |
|------|--------------|------------|
| Iniciar review | 2 horas | Normal |
| Iniciar review (hotfix) | 30 minutos | Crítica |
| Completar review | 4 horas | Normal |
| Completar review (hotfix) | 1 hora | Crítica |
| Re-review após mudanças | 2 horas | Normal |

### Aprovação e Merge

#### ✅ Critérios para Aprovar

1. **Testes passando:** CI verde
2. **Código revisado:** Sem problemas críticos
3. **Padrões seguidos:** Consistente com projeto
4. **Funciona localmente:** Reviewer testou
5. **Documentação OK:** Se necessário, está presente

#### 🔀 Quem Pode Fazer Merge?

| Branch Destino | Quem Pode Mergear | Requisitos |
|----------------|-------------------|------------|
| **main** | Apenas Tech Lead | 1+ aprovação + CI verde |
| **develop** | Tech Lead ou após aprovação | 1 aprovação + CI verde |
| **feature/** | Qualquer um (própria branch) | - |

#### 📝 Após o Merge

**Responsabilidades do Autor:**
1. Verificar se merge foi bem-sucedido
2. Deletar branch remota (automático ou manual)
3. Deletar branch local
4. Notificar time no Slack
5. Atualizar ticket para "Done"

**Comandos pós-merge:**
```bash
# Atualizar develop local
git checkout develop
git pull origin develop

# Deletar branch local
git branch -d feature/TICKET-123-nome

# Limpar branches antigas
npm run git:cleanup
```

### Situações Especiais

#### 🔄 Re-Review Necessário

Solicitar re-review quando:
- Mudanças significativas após aprovação
- Novos commits adicionados
- Lógica alterada substancialmente

```bash
# No PR, comentar:
"@reviewer - Fiz as mudanças solicitadas. Pode revisar novamente? 🙏"
```

#### ⚡ Auto-Merge (Quando Permitido)

Permitido apenas se:
- [ ] Mudança trivial (typo, formatação)
- [ ] Hotfix aprovado verbalmente
- [ ] Você é o Tech Lead
- [ ] Emergency (produção quebrada)

**Sempre avisar o time mesmo em auto-merge!**