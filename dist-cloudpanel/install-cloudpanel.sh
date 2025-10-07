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
