#!/bin/bash
set -euo pipefail

echo "🚀 Deploy no CloudPanel - CyberTeam.Zone"
echo "=========================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Variáveis de configuração
DOMAIN="${1:-seu-dominio.com}"
APP_DIR="/home/cyberteam/htdocs/$DOMAIN"
APP_NAME="cyberteam-app"

echo "📋 Configuração:"
echo "  - Domínio: $DOMAIN"
echo "  - Diretório: $APP_DIR"
echo "  - App Name: $APP_NAME"
echo ""

# 1. Fazer build da aplicação
echo "🔨 Fazendo build da aplicação Next.js..."
npm run build

# 2. Criar diretório de distribuição
echo "📁 Criando diretório de distribuição..."
mkdir -p dist-cloudpanel

# 3. Copiar arquivos necessários
echo "📋 Copiando arquivos para distribuição..."
cp -r .next dist-cloudpanel/
cp -r public dist-cloudpanel/
cp -r app dist-cloudpanel/
cp -r components dist-cloudpanel/
cp -r lib dist-cloudpanel/
cp -r hooks dist-cloudpanel/
cp -r types dist-cloudpanel/
cp -r prisma dist-cloudpanel/

# Copiar arquivos de configuração
cp package.json dist-cloudpanel/
cp package-lock.json dist-cloudpanel/
cp next.config.js dist-cloudpanel/
cp middleware.ts dist-cloudpanel/
cp tsconfig.json dist-cloudpanel/
cp tailwind.config.js dist-cloudpanel/
cp postcss.config.js dist-cloudpanel/

# 4. Criar arquivo .htaccess para CloudPanel
echo "🔐 Criando arquivo .htaccess para CloudPanel..."
cat > dist-cloudpanel/.htaccess << 'EOF'
# CloudPanel configuration for Next.js
RewriteEngine On

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
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

# Prevent access to sensitive directories
RedirectMatch 404 /node_modules/.*
RedirectMatch 404 /\.next/.*
RedirectMatch 404 /\.git/.*
EOF

# 5. Criar configuração PM2 para CloudPanel
echo "⚙️ Criando configuração PM2 para CloudPanel..."
cat > dist-cloudpanel/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
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
    time: true,
    // CloudPanel specific settings
    exec_mode: 'fork',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
}
EOF

# 6. Criar script de instalação para CloudPanel
echo "📝 Criando script de instalação para CloudPanel..."
cat > dist-cloudpanel/install-cloudpanel.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "🚀 Instalando aplicação no CloudPanel..."

# Criar diretório de logs
mkdir -p logs

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --omit=dev || npm install --omit=dev

# Gerar cliente Prisma
echo "🗄️ Configurando banco de dados..."
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

# Instalar PM2 se não estiver instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação..."
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar com o sistema
pm2 startup systemd -u $USER --hp $HOME >/dev/null 2>&1 || true

echo "✅ Instalação concluída!"
echo "📝 Próximos passos:"
echo "1. Configure as variáveis de ambiente no .env.local"
echo "2. Configure o banco de dados MySQL no CloudPanel"
echo "3. Configure o Node.js no CloudPanel"
echo "4. Configure o Nginx para proxy reverso"
echo "5. Configure SSL no CloudPanel"
EOF

chmod +x dist-cloudpanel/install-cloudpanel.sh

# 7. Criar arquivo de variáveis de ambiente
echo "🔐 Criando arquivo de variáveis de ambiente..."
cat > dist-cloudpanel/.env.example << 'EOF'
# Database (substitua pelas credenciais do seu banco no CloudPanel)
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

# 8. Criar configuração Nginx para CloudPanel
echo "🌐 Criando configuração Nginx para CloudPanel..."
cat > dist-cloudpanel/nginx-cloudpanel.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration (CloudPanel gerencia automaticamente)
    ssl_certificate /home/cyberteam/conf/ssl/$DOMAIN/fullchain.pem;
    ssl_certificate_key /home/cyberteam/conf/ssl/$DOMAIN/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files
    location /_next/static/ {
        alias /home/cyberteam/htdocs/$DOMAIN/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /public/ {
        alias /home/cyberteam/htdocs/$DOMAIN/public/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Upload size limit
    client_max_body_size 20M;
}
EOF

# 9. Criar script de deploy completo
echo "📝 Criando script de deploy completo..."
cat > dist-cloudpanel/deploy-complete.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "🚀 Deploy Completo no CloudPanel - CyberTeam.Zone"

# Variáveis
DOMAIN="seu-dominio.com"
APP_DIR="/home/cyberteam/htdocs/$DOMAIN"
APP_NAME="cyberteam-app"

# 1. Navegar para o diretório
cd "$APP_DIR"

# 2. Instalar dependências
echo "📦 Instalando dependências..."
npm ci --omit=dev

# 3. Gerar cliente Prisma
echo "🗄️ Configurando banco de dados..."
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push --schema=prisma/schema.prisma

# 4. Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p public/uploads
mkdir -p logs

# 5. Configurar permissões
echo "🔐 Configurando permissões..."
chmod 755 public/uploads
chmod 644 .htaccess
chmod 644 package.json

# 6. Iniciar/Reiniciar aplicação
echo "🚀 Iniciando aplicação..."
pm2 restart "$APP_NAME" || pm2 start ecosystem.config.js

# 7. Salvar configuração PM2
pm2 save

# 8. Configurar Nginx (se necessário)
echo "🌐 Configurando Nginx..."
if [ -f "nginx-cloudpanel.conf" ]; then
    sudo cp nginx-cloudpanel.conf /home/cyberteam/conf/nginx/conf.d/$DOMAIN.conf
    sudo nginx -t && sudo systemctl reload nginx
fi

echo "✅ Deploy concluído!"
echo "🌐 Aplicação disponível em: https://$DOMAIN"
echo "📋 Para ver logs: pm2 logs $APP_NAME"
echo "🔄 Para reiniciar: pm2 restart $APP_NAME"
EOF

chmod +x dist-cloudpanel/deploy-complete.sh

# 10. Criar script de verificação
echo "🔍 Criando script de verificação..."
cat > dist-cloudpanel/verify-deployment.sh << 'EOF'
#!/bin/bash
echo "🔍 Verificando deployment no CloudPanel..."

# Verificar se a aplicação está rodando
echo "📊 Status da aplicação:"
pm2 status

# Verificar logs
echo "📋 Últimos logs:"
pm2 logs cyberteam-app --lines 10

# Verificar conectividade
echo "🌐 Testando conectividade:"
curl -I https://seu-dominio.com || echo "❌ Erro de conectividade"

# Verificar banco de dados
echo "🗄️ Testando banco de dados:"
npx prisma db pull --schema=prisma/schema.prisma || echo "❌ Erro de banco de dados"

# Verificar arquivos essenciais
echo "📁 Verificando arquivos essenciais:"
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json"
[ -f ".htaccess" ] && echo "✅ .htaccess" || echo "❌ .htaccess"
[ -f ".env.local" ] && echo "✅ .env.local" || echo "❌ .env.local"
[ -d ".next" ] && echo "✅ .next" || echo "❌ .next"
[ -d "public" ] && echo "✅ public" || echo "❌ public"

# Verificar permissões
echo "🔐 Verificando permissões:"
[ -r ".htaccess" ] && echo "✅ .htaccess legível" || echo "❌ .htaccess não legível"
[ -w "public/uploads" ] && echo "✅ public/uploads gravável" || echo "❌ public/uploads não gravável"

echo "✅ Verificação concluída!"
EOF

chmod +x dist-cloudpanel/verify-deployment.sh

# 11. Criar script de limpeza
echo "🧹 Criando script de limpeza..."
cat > dist-cloudpanel/cleanup.sh << 'EOF'
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

# Limpar logs antigos
find logs -name "*.log" -mtime +7 -delete

echo "✅ Limpeza concluída!"
EOF

chmod +x dist-cloudpanel/cleanup.sh

# 12. Criar README específico para CloudPanel
echo "📖 Criando README para CloudPanel..."
cat > dist-cloudpanel/README-CLOUDPANEL.md << EOF
# 🚀 CyberTeam.Zone - Deploy CloudPanel

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
- `nginx-cloudpanel.conf` - Configuração Nginx
- `package.json` - Dependências Node.js

## 🚀 Deploy Rápido no CloudPanel

### 1. Upload dos Arquivos
```bash
# Via SCP
scp -r dist-cloudpanel/* usuario@seu-servidor:/home/cyberteam/htdocs/seu-dominio.com/

# Via SFTP (FileZilla)
# Host: seu-servidor
# Username: seu-usuario
# Remote Directory: /home/cyberteam/htdocs/seu-dominio.com/
```

### 2. Configurar no CloudPanel
1. **Criar Site**: Vá em "Sites" → "Add Site"
2. **Configurar Node.js**: Vá em "Node.js" → "Add Node.js App"
3. **Criar Banco**: Vá em "Databases" → "Add Database"
4. **Configurar SSL**: Ative SSL no painel

### 3. Executar Instalação
```bash
# Acesse o servidor via SSH
ssh usuario@seu-servidor

# Navegue para o diretório
cd /home/cyberteam/htdocs/seu-dominio.com

# Execute a instalação
bash install-cloudpanel.sh
```

### 4. Configurar Nginx
```bash
# Copiar configuração Nginx
sudo cp nginx-cloudpanel.conf /home/cyberteam/conf/nginx/conf.d/seu-dominio.com.conf

# Recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx
```

## 🔧 Comandos Úteis

\`\`\`bash
# Instalar dependências
bash install-cloudpanel.sh

# Deploy completo
bash deploy-complete.sh

# Verificar deployment
bash verify-deployment.sh

# Limpeza
bash cleanup.sh

# Ver logs
pm2 logs cyberteam-app

# Reiniciar
pm2 restart cyberteam-app

# Status
pm2 status
\`\`\`

## 📞 Suporte

Para problemas específicos do CloudPanel:
1. Consulte a documentação oficial do CloudPanel
2. Verifique os logs: \`pm2 logs cyberteam-app\`
3. Verifique o Nginx: \`sudo nginx -t\`
4. Entre em contato com o suporte do CloudPanel

## ⚠️ Importante

- O CloudPanel gerencia SSL e Nginx automaticamente
- Use PM2 para gerenciar o processo Node.js
- Monitore os logs regularmente
- Faça backup do banco de dados
- Mantenha o sistema atualizado
EOF

echo "✅ Compilação para CloudPanel concluída!"
echo ""
echo "📁 Arquivos compilados em: dist-cloudpanel/"
echo "📋 Próximos passos:"
echo "1. Faça upload da pasta dist-cloudpanel/ para o servidor CloudPanel"
echo "2. Configure o site no CloudPanel"
echo "3. Configure o Node.js no CloudPanel"
echo "4. Configure o banco de dados MySQL"
echo "5. Execute o script de instalação"
echo "6. Configure o Nginx para proxy reverso"
echo ""
echo "📁 Arquivos criados:"
echo "- dist-cloudpanel/ (pasta completa para upload)"
echo "- .htaccess (configuração Apache)"
echo "- ecosystem.config.js (configuração PM2)"
echo "- nginx-cloudpanel.conf (configuração Nginx)"
echo "- install-cloudpanel.sh (script de instalação)"
echo "- deploy-complete.sh (script de deploy completo)"
echo "- verify-deployment.sh (script de verificação)"
echo "- cleanup.sh (script de limpeza)"
echo "- README-CLOUDPANEL.md (documentação específica)"
echo ""
echo "🌐 Para mais detalhes, consulte: CLOUDPANEL_DEPLOY.md"
