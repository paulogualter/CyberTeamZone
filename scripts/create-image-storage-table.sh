#!/bin/bash

# Script para criar a tabela ImageStorage no Supabase
# Execute este script após configurar as variáveis de ambiente

echo "🚀 Criando tabela ImageStorage no Supabase..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Variáveis de ambiente do Supabase não configuradas"
    echo "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Criar a tabela usando curl
curl -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS \"ImageStorage\" (
      \"id\" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      \"filename\" TEXT UNIQUE NOT NULL,
      \"originalName\" TEXT NOT NULL,
      \"mimeType\" TEXT NOT NULL,
      \"size\" INTEGER NOT NULL,
      \"data\" BYTEA NOT NULL,
      \"uploadedBy\" TEXT,
      \"createdAt\" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      \"updatedAt\" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );"
  }'

echo ""
echo "✅ Tabela ImageStorage criada com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique se a tabela foi criada no Supabase Dashboard"
echo "2. Teste o upload de uma imagem"
echo "3. Verifique se a imagem é exibida corretamente"
