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
