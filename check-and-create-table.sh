#!/bin/bash

echo "🔍 Verificando se a tabela ImageStorage existe..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Erro: Variáveis de ambiente não configuradas"
  echo "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

echo "✅ Variáveis de ambiente configuradas"

# SQL para verificar se a tabela existe
CHECK_TABLE_SQL="
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'ImageStorage'
);
"

echo "📋 Execute este SQL no Supabase Dashboard para verificar se a tabela existe:"
echo "----------------------------------------------------------------------------------------------------"
echo "$CHECK_TABLE_SQL"
echo "----------------------------------------------------------------------------------------------------"

# SQL para criar a tabela se não existir
CREATE_TABLE_SQL="
-- Criar tabela ImageStorage se não existir
CREATE TABLE IF NOT EXISTS \"ImageStorage\" (
  \"id\" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  \"filename\" TEXT UNIQUE NOT NULL,
  \"originalName\" TEXT NOT NULL,
  \"mimeType\" TEXT NOT NULL,
  \"size\" INTEGER NOT NULL,
  \"data\" BYTEA NOT NULL,
  \"uploadedBy\" TEXT,
  \"createdAt\" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  \"updatedAt\" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE UNIQUE INDEX IF NOT EXISTS \"ImageStorage_filename_key\" ON \"ImageStorage\"(\"filename\");
CREATE INDEX IF NOT EXISTS \"ImageStorage_uploadedBy_idx\" ON \"ImageStorage\"(\"uploadedBy\");
CREATE INDEX IF NOT EXISTS \"ImageStorage_createdAt_idx\" ON \"ImageStorage\"(\"createdAt\");

-- Verificar se foi criada
SELECT 'Tabela ImageStorage criada com sucesso!' as status;
"

echo ""
echo "📋 Se a tabela não existir, execute este SQL para criá-la:"
echo "----------------------------------------------------------------------------------------------------"
echo "$CREATE_TABLE_SQL"
echo "----------------------------------------------------------------------------------------------------"

echo ""
echo "🌐 Acesse: https://supabase.com/dashboard"
echo "1. Selecione seu projeto"
echo "2. Vá para SQL Editor"
echo "3. Cole e execute o SQL acima"
echo "4. Verifique se não há erros"

echo ""
echo "🧪 Para testar o upload após criar a tabela:"
echo "curl -X POST https://www.cyberteam.zone/api/upload \\"
echo "  -F \"file=@test-image.jpg\" \\"
echo "  -H \"Content-Type: multipart/form-data\""
