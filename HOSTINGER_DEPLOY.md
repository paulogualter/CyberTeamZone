# 🚀 Guia de Deploy - Hostinger

## 📋 Pré-requisitos

- Conta na [Hostinger](https://hostinger.com.br)
- Plano de hospedagem com suporte a Node.js
- Banco de dados MySQL
- Domínio configurado

## 🔧 Configuração Inicial

### 1. **Configurar Banco de Dados MySQL**

1. Acesse o painel da Hostinger
2. Vá para "Bancos de Dados MySQL"
3. Crie um novo banco de dados
4. Anote as credenciais:
   - Host: `localhost` ou IP fornecido
   - Porta: `3306`
   - Nome do banco: `seu_banco`
   - Usuário: `seu_usuario`
   - Senha: `sua_senha`

### 2. **Configurar Variáveis de Ambiente**

1. Copie `env.production.example` para `.env.local`
2. Configure as variáveis:

```env
# Database - Hostinger MySQL
DATABASE_URL="mysql://cyberteamlms:cyberteamLms@localhost:3306/cyberteamlms"

# NextAuth
NEXTAUTH_URL="https://seudominio.com"
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui-minimo-32-caracteres"

# Google OAuth
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Stripe - Produção
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 📤 Upload dos Arquivos

### 1. **Via File Manager (Recomendado)**

1. Acesse o File Manager da Hostinger
2. Navegue até a pasta `public_html`
3. Faça upload de todos os arquivos do projeto
4. **NÃO** faça upload da pasta `node_modules`

### 2. **Via FTP/SFTP**

```bash
# Exemplo com SFTP
sftp usuario@seudominio.com
put -r /caminho/do/projeto/* /public_html/
```

## 🚀 Deploy

### 1. **Executar Script de Deploy**

```bash
# Conectar via SSH (se disponível)
ssh usuario@seudominio.com

# Navegar para o diretório
cd public_html

# Executar script de deploy
chmod +x scripts/deploy-hostinger.sh
./scripts/deploy-hostinger.sh
```

### 2. **Deploy Manual**

```bash
# 1. Instalar dependências
npm install --production

# 2. Gerar cliente Prisma
npx prisma generate

# 3. Aplicar migrações
npx prisma db push

# 4. Popular dados iniciais
node scripts/setup-database.js
node scripts/seed-secure-data.js

# 5. Criar admin
node scripts/create-admin.js

# 6. Build da aplicação
npm run build

# 7. Iniciar aplicação
npm start
```

## 🔐 Configurações de Segurança

### 1. **SSL/HTTPS**

1. No painel da Hostinger, ative o SSL
2. Configure redirecionamento HTTP → HTTPS
3. Atualize `NEXTAUTH_URL` para `https://`

### 2. **Firewall**

Configure as seguintes regras:
- Porta 80 (HTTP): Aberta
- Porta 443 (HTTPS): Aberta
- Porta 3306 (MySQL): Apenas localhost
- Outras portas: Bloqueadas

### 3. **Backup Automático**

Configure backup automático do banco de dados:
1. Acesse "Backup" no painel
2. Configure backup diário
3. Mantenha pelo menos 7 dias de backup

## 🔧 Configuração do Stripe

### 1. **Webhook de Produção**

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá para "Developers" > "Webhooks"
3. Clique em "Add endpoint"
4. URL: `https://seudominio.com/api/webhooks/stripe`
5. Eventos: `checkout.session.completed`
6. Copie o webhook secret para `.env.local`

### 2. **Chaves de Produção**

1. No Stripe Dashboard, ative o modo "Live"
2. Copie as chaves de produção
3. Atualize `.env.local` com as chaves corretas

## 📊 Monitoramento

### 1. **Logs da Aplicação**

```bash
# Ver logs em tempo real
tail -f logs/app.log

# Ver logs de erro
tail -f logs/error.log
```

### 2. **Monitoramento de Performance**

- Use o painel da Hostinger para monitorar CPU/RAM
- Configure alertas para uso alto de recursos
- Monitore o espaço em disco

### 3. **Backup e Restauração**

```bash
# Backup do banco
mysqldump -u cyberteamlms -p cyberteamlms > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u cyberteamlms -p cyberteamlms < backup_20240101.sql
```

## 🛠️ Manutenção

### 1. **Atualizações**

```bash
# Atualizar dependências
npm update

# Aplicar migrações
npx prisma db push

# Rebuild da aplicação
npm run build
```

### 2. **Limpeza**

```bash
# Limpar logs antigos
find logs/ -name "*.log" -mtime +30 -delete

# Limpar cache
rm -rf .next/cache
```

## ❗ Troubleshooting

### **Erro de Conexão com Banco**

1. Verifique as credenciais no `.env.local`
2. Teste a conexão: `mysql -u usuario -p -h localhost`
3. Verifique se o banco existe

### **Erro 500**

1. Verifique os logs: `tail -f logs/error.log`
2. Verifique as variáveis de ambiente
3. Verifique as permissões dos arquivos

### **Webhook não funciona**

1. Verifique se a URL está correta
2. Teste com `curl -X POST https://seudominio.com/api/webhooks/stripe`
3. Verifique os logs do Stripe

## 📞 Suporte

- **Hostinger**: [Suporte Técnico](https://hostinger.com.br/suporte)
- **Documentação**: Este arquivo e README.md
- **Logs**: Sempre verifique os logs primeiro

---

**🎉 Parabéns! Sua aplicação está pronta para produção!**
