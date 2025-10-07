#!/bin/bash
set -euo pipefail

echo "🚀 Deploy para Hospedagem Compartilhada - Hostinger"
echo "=================================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# 1. Fazer build da aplicação
echo "📦 Fazendo build da aplicação..."
npm run build

# 2. Criar arquivo .htaccess
echo "🔐 Criando arquivo .htaccess..."
cat > .htaccess << 'EOF'
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

# Configurações do Next.js
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]
EOF

# 3. Criar arquivo de configuração para Node.js
echo "⚙️ Criando arquivo de configuração Node.js..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'cyberteam-app',
    script: 'npm',
    args: 'start',
    cwd: '/home/cyberteam/htdocs/cyberteam.zone',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 4. Criar script de instalação
echo "📝 Criando script de instalação..."
cat > install-on-hostinger.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "🚀 Instalando aplicação na Hostinger..."

# Instalar dependências
npm ci --omit=dev || npm install --omit=dev

# Gerar cliente Prisma
npx prisma generate --schema=prisma/schema.prisma

# Aplicar migrações (se necessário)
# npx prisma db push --schema=prisma/schema.prisma

# Criar diretório de uploads
mkdir -p public/uploads
chmod 755 public/uploads

echo "✅ Instalação concluída!"
echo "📝 Próximos passos:"
echo "1. Configure as variáveis de ambiente no .env.local"
echo "2. Configure o banco de dados MySQL no painel da Hostinger"
echo "3. Configure o Node.js no painel da Hostinger"
echo "4. Configure o domínio e SSL"
EOF

chmod +x install-on-hostinger.sh

# 5. Criar arquivo de variáveis de ambiente de exemplo
echo "🔐 Criando arquivo de variáveis de ambiente..."
cat > .env.production << 'EOF'
# Database (substitua pelas credenciais do seu banco na Hostinger)
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
EOF

# 6. Criar arquivo de instruções
echo "📋 Criando arquivo de instruções..."
cat > INSTRUCOES_DEPLOY.md << 'EOF'
# 📋 Instruções de Deploy - Hostinger Hospedagem Compartilhada

## 🚀 Passos para Deploy

### 1. Upload dos Arquivos
- Faça upload de todos os arquivos para `public_html` no File Manager da Hostinger
- Certifique-se de que o arquivo `.env.production` está incluído

### 2. Configurar Banco de Dados
1. Acesse o hPanel da Hostinger
2. Vá em "Bancos de Dados MySQL"
3. Crie um banco de dados:
   - Nome: `cyberteamlms`
   - Usuário: `cyberteamlms`
   - Senha: `cyberteamLms`
4. Anote o host do banco (pode ser diferente de localhost)

### 3. Configurar Variáveis de Ambiente
1. Renomeie `.env.production` para `.env.local`
2. Edite o arquivo com suas credenciais reais:
   - Substitua `seu-dominio.com` pelo seu domínio
   - Substitua `seu-secret-super-seguro-aqui` por um secret forte
   - Configure suas chaves do Google OAuth
   - Configure suas chaves do Stripe

### 4. Configurar Node.js
1. No hPanel, vá em "Node.js"
2. Selecione a versão Node.js 18+
3. Configure:
   - Comando de start: `npm start`
   - Pasta raiz: `public_html`
   - Porta: `3000`

### 5. Executar Instalação
1. Acesse o terminal via SSH (se disponível) ou use o terminal do hPanel
2. Execute: `bash install-on-hostinger.sh`

### 6. Configurar SSL
1. No hPanel, vá em "SSL"
2. Ative o SSL para seu domínio
3. Configure redirecionamento HTTP para HTTPS

### 7. Configurar DNS (se necessário)
- Se usando subdomínio, configure CNAME apontando para seu domínio
- Se usando domínio principal, configure A record

## 🔧 Comandos Úteis

```bash
# Ver logs da aplicação
pm2 logs cyberteam-app

# Reiniciar aplicação
pm2 restart cyberteam-app

# Parar aplicação
pm2 stop cyberteam-app

# Ver status
pm2 status
```

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
EOF

# 7. Criar arquivo .gitignore para produção
echo "📝 Criando .gitignore para produção..."
cat > .gitignore.production << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.production
.env.development

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output/

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/
EOF

echo "✅ Script de deploy para hospedagem compartilhada criado!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: chmod +x scripts/deploy-shared-hosting.sh"
echo "2. Execute: ./scripts/deploy-shared-hosting.sh"
echo "3. Faça upload dos arquivos para a Hostinger"
echo "4. Siga as instruções em INSTRUCOES_DEPLOY.md"
echo ""
echo "📁 Arquivos criados:"
echo "- .htaccess (configuração Apache)"
echo "- ecosystem.config.js (configuração PM2)"
echo "- install-on-hostinger.sh (script de instalação)"
echo "- .env.production (variáveis de ambiente de exemplo)"
echo "- INSTRUCOES_DEPLOY.md (instruções detalhadas)"
echo "- .gitignore.production (gitignore para produção)"
