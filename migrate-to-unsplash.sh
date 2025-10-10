#!/bin/bash

echo "🔧 Migrando imagens dos cursos para URLs funcionais..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Erro: Variáveis de ambiente não configuradas"
  echo "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

echo "✅ Variáveis de ambiente configuradas"

# SQL para migrar imagens para URLs do Unsplash
MIGRATE_TO_UNSPLASH_SQL="
-- Migrar todas as imagens para URLs do Unsplash (solução permanente)
UPDATE \"Course\" 
SET coverImage = CASE 
  WHEN title ILIKE '%teste%' THEN 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop'
  WHEN title ILIKE '%appsec%' OR title ILIKE '%app sec%' THEN 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
  WHEN title ILIKE '%active directory%' THEN 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop'
  WHEN title ILIKE '%cyber defense%' OR title ILIKE '%defense%' THEN 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  WHEN title ILIKE '%fundamento%' OR title ILIKE '%fundamento%' THEN 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
  WHEN title ILIKE '%pipe%' OR title ILIKE '%ci/cd%' OR title ILIKE '%cicd%' THEN 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop'
  ELSE 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop'
END
WHERE coverImage LIKE '/uploads/%' OR coverImage IS NULL OR coverImage = '';
"

echo "📋 Execute este SQL no Supabase Dashboard para migrar para URLs do Unsplash:"
echo "----------------------------------------------------------------------------------------------------"
echo "$MIGRATE_TO_UNSPLASH_SQL"
echo "----------------------------------------------------------------------------------------------------"

# SQL para verificar o resultado
VERIFY_SQL="
-- Verificar o resultado da migração
SELECT 
  id,
  title,
  coverImage,
  CASE 
    WHEN coverImage LIKE 'https://images.unsplash.com/%' THEN 'UNSPLASH_URL'
    WHEN coverImage LIKE '/uploads/%' THEN 'LOCAL_PATH'
    WHEN coverImage LIKE '/api/images/%' THEN 'DATABASE_ID'
    WHEN coverImage IS NULL OR coverImage = '' THEN 'EMPTY'
    ELSE 'OTHER'
  END as image_type
FROM \"Course\" 
ORDER BY createdAt DESC;
"

echo ""
echo "📋 Para verificar o resultado, execute este SQL:"
echo "----------------------------------------------------------------------------------------------------"
echo "$VERIFY_SQL"
echo "----------------------------------------------------------------------------------------------------"

echo ""
echo "🎯 Vantagens da migração para Unsplash:"
echo "✅ URLs funcionam em produção"
echo "✅ Imagens de alta qualidade"
echo "✅ Carregamento rápido"
echo "✅ Sem necessidade de deploy de arquivos"
echo "✅ Temas relacionados a tecnologia/cybersecurity"

echo ""
echo "🌐 Acesse: https://supabase.com/dashboard"
echo "1. Selecione seu projeto"
echo "2. Vá para SQL Editor"
echo "3. Execute primeiro o SQL de migração"
echo "4. Execute o SQL de verificação"
echo "5. Teste o catálogo de cursos"

echo ""
echo "🧪 Para testar uma URL específica:"
echo "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop"
