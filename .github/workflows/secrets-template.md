# 🔐 GitHub Secrets - Template

Este arquivo serve como template para configurar os secrets necessários nos workflows do GitHub Actions.

## 📋 Secrets Obrigatórios

Configure os seguintes secrets no seu repositório GitHub:

### 1. SLACK_WEBHOOK_URL
**Descrição**: URL do webhook do Slack para notificações automáticas
**Como obter**:
1. Acesse o Slack e vá para "Apps" > "Incoming Webhooks"
2. Clique em "Add to Slack"
3. Escolha o canal (ex: #qa-automation)
4. Copie a URL do webhook
**Formato**: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`

### 2. BASE_URL (Variável de Ambiente)
**Descrição**: URL base da aplicação para testes
**Valor sugerido**: `https://stg.conexaobiotec.com.br`

## 🔧 Secrets Opcionais

### 3. PROD_CPF
**Descrição**: CPF para testes em ambiente de produção
**Quando usar**: Apenas se houver testes específicos para produção
**Formato**: `123.456.789-00`

### 4. PROD_PASSWORD
**Descrição**: Senha para testes em ambiente de produção
**Quando usar**: Apenas se houver testes específicos para produção
**Formato**: Senha forte com caracteres especiais

### 5. GITHUB_TOKEN (Automático)
**Descrição**: Token automático do GitHub para deploy de páginas
**Configuração**: Automático, não precisa configurar manualmente

## 🚀 Como Configurar

### Via GitHub UI:
1. Acesse seu repositório no GitHub
2. Vá para "Settings" > "Secrets and variables" > "Actions"
3. Clique em "New repository secret"
4. Adicione cada secret conforme a lista acima

### Via GitHub CLI:
```bash
# Configurar webhook do Slack
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/..."

# Configurar CPF de produção (opcional)
gh secret set PROD_CPF --body "123.456.789-00"

# Configurar senha de produção (opcional)
gh secret set PROD_PASSWORD --body "Senh@Segura123"
```

## 🔒 Segurança

### Boas Práticas:
- ✅ **Nunca** commite secrets no código
- ✅ **Use** variáveis de ambiente para valores não sensíveis
- ✅ **Rotacione** secrets regularmente
- ✅ **Limite** acesso apenas a quem precisa
- ✅ **Monitore** uso dos secrets

### Valores Seguros para Commitar:
- URLs públicas (ex: `https://stg.conexaobiotec.com.br`)
- Configurações de timeout
- Nomes de branches
- Configurações de retry

### Valores que DEVEM ser Secrets:
- Senhas e tokens
- Chaves de API
- URLs de webhooks
- Credenciais de banco de dados
- Certificados e chaves privadas

## 📝 Variáveis de Ambiente Públicas

Estas variáveis podem ser definidas diretamente nos workflows:

```yaml
env:
  BASE_URL: https://stg.conexaobiotec.com.br
  CI: true
  DEBUG: false
  PLAYWRIGHT_MCP_ENABLED: true
```

## 🔍 Verificação de Configuração

### Script de Verificação:
```bash
# Verificar se todos os secrets estão configurados
gh secret list

# Testar webhook do Slack (se configurado)
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Teste de configuração do webhook"}' \
  $SLACK_WEBHOOK_URL
```

### Checklist de Configuração:
- [ ] SLACK_WEBHOOK_URL configurado
- [ ] BASE_URL definido nos workflows
- [ ] Secrets opcionais configurados (se necessário)
- [ ] Permissões do repositório ajustadas
- [ ] Branch protection rules configuradas
- [ ] Workflows habilitados

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Webhook do Slack não funciona**:
   - Verifique se a URL está correta
   - Confirme se o canal existe
   - Teste manualmente com curl

2. **Secrets não são encontrados**:
   - Verifique se estão configurados no repositório correto
   - Confirme se não há espaços extras
   - Verifique se o nome está exatamente igual

3. **Permissões insuficientes**:
   - Verifique se o usuário tem permissão para configurar secrets
   - Confirme se o repositório permite Actions

### Logs de Debug:
Para debugar problemas com secrets, adicione logs temporários:
```yaml
- name: Debug secrets
  run: |
    echo "SLACK_WEBHOOK_URL está configurado: ${{ secrets.SLACK_WEBHOOK_URL != '' }}"
    echo "BASE_URL: ${{ env.BASE_URL }}"
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique a documentação oficial do GitHub Actions
2. Consulte os logs do workflow
3. Teste a configuração localmente
4. Entre em contato com a equipe de DevOps

---

**Lembre-se**: Mantenha este arquivo atualizado conforme novos secrets forem adicionados aos workflows.
