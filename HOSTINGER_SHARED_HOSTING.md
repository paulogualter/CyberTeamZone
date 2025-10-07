# 🚀 Deploy na Hostinger - Hospedagem Compartilhada

## 📋 Pré-requisitos

- Conta na Hostinger com hospedagem compartilhada
- Acesso ao painel de controle (hPanel)
- Banco de dados MySQL criado no painel
- Domínio configurado

## 🔧 Configuração na Hostinger

### 1. Criar Banco de Dados MySQL

1. Acesse o **hPanel** da Hostinger
2. Vá em **Bancos de Dados MySQL**
3. Crie um novo banco de dados:
   - **Nome do banco**: `cyberteamlms`
   - **Usuário**: `cyberteamlms`
   - **Senha**: `cyberteamLms` (ou uma senha forte)
   - **Host**: `localhost` (ou o host fornecido pela Hostinger)

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Database (use as credenciais do seu banco na Hostinger)
DATABASE_URL="mysql://cyberteamlms:cyberteamLms@localhost:3306/cyberteamlms"

# NextAuth
NEXTAUTH_URL="https://seu-dominio.com"
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui-minimo-32-caracteres"

# Google OAuth
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Mercado Pago (opcional)
MERCADOPAGO_ACCESS_TOKEN="seu-mercadopago-token"
MERCADOPAGO_WEBHOOK_SECRET="seu-mercadopago-webhook-secret"
```

## 🚀 Deploy via GitHub

### Opção 1: Deploy Automático (Recomendado)

1. **Conectar repositório ao Vercel**:
   - Acesse [Vercel](https://vercel.com)
   - Conecte sua conta GitHub
   - Importe o repositório `paulogualter/CyberTeamZone`
   - Configure as variáveis de ambiente no Vercel
   - Faça o deploy

2. **Configurar domínio personalizado**:
   - No Vercel, vá em Settings > Domains
   - Adicione seu domínio da Hostinger
   - Configure os DNS no painel da Hostinger

### Opção 2: Deploy Manual na Hostinger

1. **Fazer build local**:
   ```bash
   npm run build
   ```

2. **Compactar arquivos necessários**:
   - `.next/` (pasta de build)
   - `public/`
   - `package.json`
   - `package-lock.json`
   - `next.config.js`
   - `middleware.ts`
   - `prisma/`
   - `lib/`
   - `components/`
   - `app/`
   - `types/`
   - `hooks/`
   - `.env.local`

3. **Upload via File Manager**:
   - Acesse o File Manager no hPanel
   - Navegue até `public_html`
   - Faça upload dos arquivos
   - Extraia o arquivo compactado

4. **Configurar Node.js**:
   - No hPanel, vá em **Node.js**
   - Selecione a versão Node.js 18+
   - Configure o comando de start: `npm start`
   - Configure a pasta raiz: `public_html`

## 🗄️ Configuração do Banco de Dados

### 1. Aplicar Migrações

Execute no terminal local ou via SSH (se disponível):

```bash
npx prisma db push
npx prisma generate
```

### 2. Popular Dados Iniciais

```bash
node scripts/setup-database.js
node scripts/seed-secure-data.js
```

## 🔐 Configuração de Segurança

### 1. Arquivo .htaccess

Crie um arquivo `.htaccess` na raiz do projeto:

```apache
# Proteger arquivos sensíveis
<Files ".env*">
    Order allow,deny
    Deny from all
</Files>

# Redirecionar HTTP para HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Headers de segurança
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Cache para arquivos estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## 🌐 Configuração de DNS

### 1. Configurar Subdomínio (Recomendado)

- **Subdomínio**: `app.seu-dominio.com`
- **Tipo**: CNAME
- **Valor**: `cname.vercel-dns.com` (se usando Vercel)

### 2. Configurar Domínio Principal

- **Tipo**: A
- **Valor**: IP do servidor da Hostinger

## 📱 Configuração do Stripe Webhook

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Developers** > **Webhooks**
3. Clique em **Add endpoint**
4. **URL**: `https://seu-dominio.com/api/webhooks/stripe`
5. **Eventos**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## ✅ Verificações Pós-Deploy

1. **Testar aplicação**: Acesse `https://seu-dominio.com`
2. **Testar autenticação**: Faça login com Google
3. **Testar pagamentos**: Teste uma compra com cartão
4. **Verificar logs**: Monitore os logs no painel da Hostinger

## 🔧 Comandos de Manutenção

```bash
# Atualizar aplicação
git pull origin main
npm ci --omit=dev
npm run build
# Reiniciar aplicação no painel da Hostinger

# Verificar status do banco
npx prisma studio

# Limpar escudos expirados
node scripts/cleanup-expired-escudos.js
```

## 🚨 Limitações da Hospedagem Compartilhada

- **Sem acesso SSH**: Alguns comandos precisam ser executados localmente
- **Recursos limitados**: CPU e memória compartilhados
- **Sem PM2**: Use o gerenciador de processos da Hostinger
- **Sem Nginx**: Use Apache com .htaccess
- **Sem SSL automático**: Configure via painel da Hostinger

## 💡 Dicas de Otimização

1. **Usar CDN**: Configure Cloudflare para melhor performance
2. **Otimizar imagens**: Use WebP e compressão
3. **Minificar assets**: Use ferramentas de build
4. **Cache**: Configure cache no .htaccess
5. **Monitoramento**: Use ferramentas como UptimeRobot

## 🆘 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão instaladas
- Confirme se as variáveis de ambiente estão corretas

### Erro de Banco de Dados
- Verifique as credenciais no .env.local
- Confirme se o banco foi criado corretamente

### Erro de Permissões
- Verifique as permissões dos arquivos (644 para arquivos, 755 para pastas)
- Confirme se o .env.local tem as permissões corretas

### Erro de SSL
- Configure SSL no painel da Hostinger
- Verifique se o certificado está ativo
