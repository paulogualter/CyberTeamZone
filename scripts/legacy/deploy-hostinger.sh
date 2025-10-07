#!/bin/bash

# Script de Deploy para Hostinger
# Execute este script a partir de qualquer diretório

set -e

echo "🚀 Iniciando deploy para Hostinger..."

# Ir para a raiz do projeto (pai deste script)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📁 Diretório do projeto: $PROJECT_ROOT"

# 0. Verificações iniciais
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  echo "❌ package.json não encontrado em $PROJECT_ROOT"
  exit 1
fi

if [ ! -f "$PROJECT_ROOT/prisma/schema.prisma" ]; then
  echo "❌ prisma/schema.prisma não encontrado. Verifique os arquivos enviados."
  exit 1
fi

# 1. Instalar dependências
echo "📦 Instalando dependências..."
if [ -f "$PROJECT_ROOT/package-lock.json" ]; then
  npm ci --omit=dev || npm install --omit=dev
else
  npm install --omit=dev
fi

# 2. Gerar cliente Prisma
echo "🗄️ Gerando cliente Prisma..."
npx prisma generate --schema=prisma/schema.prisma

# 3. Aplicar migrações do banco
echo "🔄 Aplicando migrações do banco..."
npx prisma db push --schema=prisma/schema.prisma

# 4. Popular dados iniciais (opcional)
if [ -f "$PROJECT_ROOT/scripts/setup-database.js" ]; then
  echo "🌱 Populando dados iniciais..."
  node scripts/setup-database.js || true
fi
if [ -f "$PROJECT_ROOT/scripts/seed-secure-data.js" ]; then
  node scripts/seed-secure-data.js || true
fi

# 5. Criar usuário admin (opcional)
if [ -f "$PROJECT_ROOT/scripts/create-admin.js" ]; then
  echo "👤 Criando usuário admin..."
  node scripts/create-admin.js || true
fi

# 6. Sincronizar instrutores/escudos (opcional)
if [ -f "$PROJECT_ROOT/scripts/sync-instructors.js" ]; then
  echo "🛡️ Sincronizando instrutores/escudos..."
  node scripts/sync-instructors.js || true
fi

# 7. Garantir diretório de uploads
echo "🧾 Garantindo diretório de uploads..."
mkdir -p "$PROJECT_ROOT/public/uploads"

# 8. Limpar cache
echo "🧹 Limpando cache..."
rm -rf .next || true
rm -rf node_modules/.cache || true

# 9. Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

# 10. Configurar permissões (se existir)
echo "🔐 Configurando permissões..."
[ -d "$PROJECT_ROOT/public/uploads" ] && chmod 755 "$PROJECT_ROOT/public/uploads" || true
[ -f "$PROJECT_ROOT/.env.local" ] && chmod 640 "$PROJECT_ROOT/.env.local" || true

# 11. Fim
echo "🎉 Deploy concluído!"
echo "Para iniciar a aplicação, execute: npm start"

echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no .env.local"
echo "2. Configure o webhook do Stripe"
echo "3. Configure o SSL/HTTPS"
echo "4. Teste a aplicação"
