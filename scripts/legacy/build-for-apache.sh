#!/bin/bash
set -euo pipefail

echo "🚀 Compilando projeto para hospedagem Apache"
echo "============================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# 1. Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf .next out dist

# 2. Instalar dependências de produção
echo "📦 Instalando dependências de produção..."
npm ci --omit=dev || npm install --omit=dev

# 3. Fazer build da aplicação
echo "🔨 Fazendo build da aplicação Next.js..."
npm run build

# 4. Criar diretório de distribuição
echo "📁 Criando diretório de distribuição..."
mkdir -p dist

# 5. Copiar arquivos necessários para Apache
echo "📋 Copiando arquivos para distribuição..."

# Copiar arquivos principais
cp -r .next dist/
cp -r public dist/
cp -r app dist/
cp -r components dist/
cp -r lib dist/
cp -r hooks dist/
cp -r types dist/
cp -r prisma dist/

# Copiar arquivos de configuração
cp package.json dist/
cp package-lock.json dist/
cp next.config.js dist/
cp middleware.ts dist/
cp tsconfig.json dist/
cp tailwind.config.js dist/
cp postcss.config.js dist/

# 6. Criar arquivo .htaccess otimizado para Apache
echo "🔐 Criando arquivo .htaccess otimizado..."
cat > dist/.htaccess << 'EOF'
# Apache configuration for Next.js on shared hosting
RewriteEngine On

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

# Protect sensitive files
<Files ".env*">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>

<Files "package*.json">
    Order allow,deny
    Deny from all
</Files>

# Redirect HTTP to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Prevent access to node_modules
RedirectMatch 404 /node_modules/.*
RedirectMatch 404 /\.next/.*
RedirectMatch 404 /\.git/.*
EOF

# 7. Criar arquivo de configuração para Node.js
echo "⚙️ Criando configuração Node.js..."
cat > dist/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'cyberteam-app',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# 8. Criar script de instalação para Apache
echo "📝 Criando script de instalação..."
cat > dist/install-apache.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "🚀 Instalando aplicação no Apache..."

# Criar diretório de logs
mkdir -p logs

# Instalar dependências
npm ci --omit=dev || npm install --omit=dev

# Gerar cliente Prisma
npx prisma generate --schema=prisma/schema.prisma

# Aplicar migrações (se necessário)
# npx prisma db push --schema=prisma/schema.prisma

# Criar diretório de uploads
mkdir -p public/uploads
chmod 755 public/uploads

# Configurar permissões
chmod 644 .htaccess
chmod 755 public/uploads
chmod 644 package.json

echo "✅ Instalação concluída!"
echo "📝 Próximos passos:"
echo "1. Configure as variáveis de ambiente no .env.local"
echo "2. Configure o banco de dados MySQL"
echo "3. Configure o Node.js no painel da Hostinger"
echo "4. Configure o domínio e SSL"
EOF

chmod +x dist/install-apache.sh

# 9. Criar arquivo de variáveis de ambiente de exemplo
echo "🔐 Criando arquivo de variáveis de ambiente..."
cat > dist/.env.example << 'EOF'
# Database (substitua pelas credenciais do seu banco)
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

# 10. Criar arquivo de instruções específicas para Apache
echo "📋 Criando instruções de deploy para Apache..."
cat > dist/INSTRUCOES_APACHE.md << 'EOF'
# 🚀 Deploy no Apache - Hostinger Hospedagem Compartilhada

## 📋 Pré-requisitos

- Conta na Hostinger com hospedagem compartilhada
- Acesso ao painel de controle (hPanel)
- Banco de dados MySQL criado
- Domínio configurado

## 🔧 Configuração

### 1. Upload dos Arquivos
- Faça upload de **TODOS** os arquivos da pasta `dist/` para `public_html`
- Mantenha a estrutura de pastas

### 2. Configurar Banco de Dados
1. No hPanel, vá em "Bancos de Dados MySQL"
2. Crie um banco de dados:
   - Nome: `cyberteamlms`
   - Usuário: `cyberteamlms`
   - Senha: `cyberteamLms`
3. Anote o host do banco

### 3. Configurar Variáveis de Ambiente
1. Renomeie `.env.example` para `.env.local`
2. Edite com suas credenciais reais
3. Substitua `seu-dominio.com` pelo seu domínio

### 4. Configurar Node.js
1. No hPanel, vá em "Node.js"
2. Selecione versão Node.js 18+
3. Configure:
   - Comando: `npm start`
   - Pasta: `public_html`
   - Porta: `3000`

### 5. Executar Instalação
1. Acesse o terminal via SSH
2. Execute: `bash install-apache.sh`

### 6. Configurar SSL
1. No hPanel, ative SSL
2. Configure redirecionamento HTTP → HTTPS

## 🔧 Comandos Úteis

```bash
# Ver logs
pm2 logs cyberteam-app

# Reiniciar
pm2 restart cyberteam-app

# Status
pm2 status
```

## ⚠️ Importante

- O arquivo `.htaccess` está configurado para Next.js
- As rotas API funcionam via Node.js
- Páginas estáticas são servidas pelo Apache
- Páginas dinâmicas são servidas pelo Node.js

## 🆘 Troubleshooting

### Erro 500
- Verifique se o Node.js está rodando
- Confirme as variáveis de ambiente
- Verifique os logs: `pm2 logs cyberteam-app`

### Erro de Banco
- Confirme as credenciais no .env.local
- Verifique se o banco foi criado

### Erro de Permissões
- Verifique permissões dos arquivos (644/755)
- Confirme se .env.local tem permissões corretas
EOF

# 11. Criar arquivo de configuração do Next.js otimizado para Apache
echo "⚙️ Criando configuração Next.js otimizada..."
cat > dist/next.config.apache.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração otimizada para Apache
  output: 'standalone',
  
  // Configuração de imagens
  images: {
    domains: ['lh3.googleusercontent.com', 'images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true // Para hospedagem compartilhada
  },
  
  // Configuração de headers para Apache
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Configuração de redirecionamentos
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/courses',
        permanent: false
      }
    ]
  },
  
  // Configuração de rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  
  // Configuração de ambiente
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
  },
  
  // Configuração de build
  generateBuildId: async () => {
    return 'cyberteam-build-' + Date.now()
  },
  
  // Configuração de compressão
  compress: true,
  
  // Configuração de power
  poweredByHeader: false,
  
  // Configuração de trailing slash
  trailingSlash: false,
  
  // Configuração de experimental
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react']
  }
}

module.exports = nextConfig
EOF

# 12. Criar script de build final
echo "📦 Criando script de build final..."
cat > dist/build-final.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "🔨 Executando build final para Apache..."

# Instalar dependências
npm ci --omit=dev

# Gerar cliente Prisma
npx prisma generate --schema=prisma/schema.prisma

# Fazer build final
npm run build

# Criar diretórios necessários
mkdir -p logs
mkdir -p public/uploads

# Configurar permissões
chmod 755 public/uploads
chmod 644 .htaccess
chmod 644 package.json

echo "✅ Build final concluído!"
echo "🚀 Aplicação pronta para deploy no Apache!"
EOF

chmod +x dist/build-final.sh

# 13. Criar arquivo de verificação
echo "🔍 Criando arquivo de verificação..."
cat > dist/verify-deployment.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "🔍 Verificando deployment..."

# Verificar se os arquivos essenciais existem
echo "📁 Verificando arquivos essenciais..."
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json"
[ -f ".htaccess" ] && echo "✅ .htaccess" || echo "❌ .htaccess"
[ -f "next.config.js" ] && echo "✅ next.config.js" || echo "❌ next.config.js"
[ -f ".env.local" ] && echo "✅ .env.local" || echo "❌ .env.local"

# Verificar se as pastas existem
echo "📁 Verificando pastas..."
[ -d ".next" ] && echo "✅ .next" || echo "❌ .next"
[ -d "public" ] && echo "✅ public" || echo "❌ public"
[ -d "app" ] && echo "✅ app" || echo "❌ app"
[ -d "components" ] && echo "✅ components" || echo "❌ components"

# Verificar permissões
echo "🔐 Verificando permissões..."
[ -r ".htaccess" ] && echo "✅ .htaccess legível" || echo "❌ .htaccess não legível"
[ -w "public/uploads" ] && echo "✅ public/uploads gravável" || echo "❌ public/uploads não gravável"

# Verificar Node.js
echo "🟢 Verificando Node.js..."
node --version && echo "✅ Node.js instalado" || echo "❌ Node.js não instalado"

# Verificar npm
echo "📦 Verificando npm..."
npm --version && echo "✅ npm instalado" || echo "❌ npm não instalado"

echo "✅ Verificação concluída!"
EOF

chmod +x dist/verify-deployment.sh

# 14. Criar arquivo de limpeza
echo "🧹 Criando arquivo de limpeza..."
cat > dist/cleanup.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "🧹 Limpando arquivos desnecessários..."

# Remover arquivos de desenvolvimento
rm -rf node_modules/.cache
rm -rf .next/cache
rm -rf logs/*.log

# Remover arquivos temporários
find . -name "*.tmp" -delete
find . -name "*.temp" -delete

# Remover arquivos de backup
find . -name "*.backup" -delete
find . -name "*.bak" -delete

echo "✅ Limpeza concluída!"
EOF

chmod +x dist/cleanup.sh

# 15. Criar arquivo README final
echo "📖 Criando README final..."
cat > dist/README.md << 'EOF'
# 🚀 CyberTeam.Zone - Deploy Apache

## 📋 Arquivos Incluídos

- `.next/` - Build da aplicação Next.js
- `public/` - Arquivos estáticos
- `app/` - Páginas da aplicação
- `components/` - Componentes React
- `lib/` - Bibliotecas e utilitários
- `hooks/` - React hooks customizados
- `types/` - Definições TypeScript
- `prisma/` - Schema do banco de dados
- `.htaccess` - Configuração Apache
- `ecosystem.config.js` - Configuração PM2
- `package.json` - Dependências Node.js

## 🚀 Deploy Rápido

1. **Upload**: Faça upload de todos os arquivos para `public_html`
2. **Configurar**: Renomeie `.env.example` para `.env.local` e configure
3. **Instalar**: Execute `bash install-apache.sh`
4. **Verificar**: Execute `bash verify-deployment.sh`

## 🔧 Comandos Úteis

```bash
# Instalar dependências
bash install-apache.sh

# Verificar deployment
bash verify-deployment.sh

# Limpeza
bash cleanup.sh

# Build final
bash build-final.sh
```

## 📞 Suporte

Para problemas ou dúvidas, consulte:
- `INSTRUCOES_APACHE.md` - Instruções detalhadas
- Logs da aplicação via PM2
- Painel de controle da Hostinger

## ⚠️ Importante

- Mantenha o arquivo `.env.local` seguro
- Configure SSL no painel da Hostinger
- Monitore os logs regularmente
- Faça backup do banco de dados
EOF

echo "✅ Compilação para Apache concluída!"
echo ""
echo "📁 Arquivos compilados em: dist/"
echo "📋 Próximos passos:"
echo "1. Faça upload da pasta dist/ para public_html na Hostinger"
echo "2. Configure as variáveis de ambiente"
echo "3. Execute o script de instalação"
echo "4. Configure o Node.js no painel da Hostinger"
echo ""
echo "📁 Arquivos criados:"
echo "- dist/ (pasta completa para upload)"
echo "- .htaccess (configuração Apache)"
echo "- ecosystem.config.js (configuração PM2)"
echo "- install-apache.sh (script de instalação)"
echo "- verify-deployment.sh (script de verificação)"
echo "- cleanup.sh (script de limpeza)"
echo "- INSTRUCOES_APACHE.md (instruções detalhadas)"
echo "- README.md (documentação)"
