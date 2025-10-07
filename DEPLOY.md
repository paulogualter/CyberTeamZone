# 🚀 Guia de Deploy - CyberTeam.Zone

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com)
- Banco de dados MySQL (recomendado: [PlanetScale](https://planetscale.com) ou [Railway](https://railway.app))
- Conta no [Stripe](https://stripe.com) para pagamentos
- Conta no [Google Cloud Console](https://console.cloud.google.com) para OAuth

## 🔧 Configuração do Banco de Dados

### Opção 1: PlanetScale (Recomendado)
1. Acesse [PlanetScale](https://planetscale.com)
2. Crie um novo banco de dados
3. Copie a string de conexão
4. Use no formato: `mysql://usuario:senha@host:porta/database`

### Opção 2: Railway
1. Acesse [Railway](https://railway.app)
2. Crie um novo projeto
3. Adicione o serviço MySQL
4. Copie a string de conexão

## 🔐 Configuração do Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione existente
3. Ative a API do Google+
4. Crie credenciais OAuth 2.0
5. Configure URIs de redirecionamento:
   - `https://seu-dominio.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (desenvolvimento)

## 💳 Configuração do Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Copie as chaves de API (teste e produção)
3. Configure webhooks:
   - URL: `https://seu-dominio.vercel.app/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## 🚀 Deploy no Vercel

### 1. Conectar Repositório
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe o repositório `paulogualter/CyberTeamZone`
4. Configure o framework como "Next.js"

### 2. Configurar Variáveis de Ambiente
No painel do Vercel, adicione as seguintes variáveis:

```env
# Database
DATABASE_URL=mysql://usuario:senha@host:porta/database

# NextAuth
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=seu-secret-super-seguro-aqui

# Google OAuth
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Configurar Build
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse a URL fornecida

## 🗄️ Configuração do Banco de Dados

### 1. Aplicar Migrações
Após o deploy, execute no terminal:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Executar migrações
vercel env pull .env.local
npx prisma db push
npx prisma generate
```

### 2. Popular Dados Iniciais
```bash
# Executar scripts de seed
node scripts/setup-database.js
node scripts/seed-secure-data.js
```

## 🔧 Pós-Deploy

### 1. Criar Usuário Admin
```bash
# Promover usuário a admin
node scripts/make-user-admin.js admin@seu-dominio.com
```

### 2. Configurar Domínio Personalizado (Opcional)
1. No painel do Vercel, vá em "Domains"
2. Adicione seu domínio personalizado
3. Configure os registros DNS
4. Atualize `NEXTAUTH_URL` com o novo domínio

### 3. Configurar SSL
O Vercel já fornece SSL automático, mas você pode configurar certificados personalizados.

## 📊 Monitoramento

### 1. Logs do Vercel
- Acesse o painel do Vercel
- Vá em "Functions" para ver logs das APIs
- Monitore erros e performance

### 2. Banco de Dados
- Use o Prisma Studio: `npx prisma studio`
- Monitore queries e performance
- Configure backups automáticos

### 3. Stripe Dashboard
- Monitore transações
- Configure alertas de webhook
- Acompanhe métricas de pagamento

## 🚨 Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar string de conexão
echo $DATABASE_URL

# Testar conexão
npx prisma db pull
```

### Erro de Autenticação
- Verificar `NEXTAUTH_URL` e `NEXTAUTH_SECRET`
- Confirmar configuração do Google OAuth
- Verificar URIs de redirecionamento

### Erro de Pagamento
- Verificar chaves do Stripe
- Confirmar webhooks configurados
- Testar em modo sandbox primeiro

## 🔄 Atualizações

### 1. Deploy Automático
O Vercel faz deploy automático a cada push para a branch `main`.

### 2. Deploy Manual
```bash
# Fazer push das mudanças
git add .
git commit -m "Update: descrição da mudança"
git push origin main
```

### 3. Rollback
No painel do Vercel, você pode fazer rollback para versões anteriores.

## 📈 Otimizações

### 1. Performance
- Configure CDN do Vercel
- Otimize imagens
- Use cache do Next.js

### 2. Segurança
- Configure rate limiting
- Use HTTPS sempre
- Monitore logs de segurança

### 3. Escalabilidade
- Configure auto-scaling
- Monitore uso de recursos
- Otimize queries do banco

## 🎉 Conclusão

Após seguir este guia, seu sistema CyberTeam.Zone estará rodando em produção com:

- ✅ Deploy automático
- ✅ Banco de dados configurado
- ✅ Autenticação funcionando
- ✅ Pagamentos integrados
- ✅ SSL configurado
- ✅ Monitoramento ativo

**URL de Produção**: `https://seu-dominio.vercel.app`

---

**Suporte**: Para dúvidas, abra uma issue no repositório GitHub.
