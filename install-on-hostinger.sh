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
