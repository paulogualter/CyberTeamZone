#!/bin/bash

echo "🔍 Verificando dados dos cursos no banco de dados..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Erro: Variáveis de ambiente não configuradas"
  echo "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

echo "✅ Variáveis de ambiente configuradas"

# SQL para verificar cursos e suas imagens
CHECK_COURSES_SQL="
-- Verificar todos os cursos e suas imagens de capa
SELECT 
  id,
  title,
  coverImage,
  CASE 
    WHEN coverImage IS NULL THEN 'NULL'
    WHEN coverImage = '' THEN 'EMPTY'
    WHEN coverImage LIKE '/api/images/%' THEN 'DATABASE_URL'
    WHEN coverImage LIKE '%.png' OR coverImage LIKE '%.jpg' OR coverImage LIKE '%.jpeg' OR coverImage LIKE '%.webp' THEN 'FILENAME'
    ELSE 'OTHER'
  END as image_type
FROM \"Course\" 
ORDER BY createdAt DESC;
"

echo "📋 Execute este SQL no Supabase Dashboard para verificar os cursos:"
echo "----------------------------------------------------------------------------------------------------"
echo "$CHECK_COURSES_SQL"
echo "----------------------------------------------------------------------------------------------------"

echo ""
echo "🖼️ Imagens disponíveis na pasta /public/uploads (primeiras 10):"
echo "----------------------------------------"
find public/uploads -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" | head -10 | while read -r file; do
  filename=$(basename "$file")
  echo "📸 $filename"
done

echo ""
echo "🔧 Para corrigir os cursos, execute este SQL (substitua pelos IDs reais):"
echo "----------------------------------------------------------------------------------------------------"
echo "-- Exemplo de correção para cursos com URLs de banco de dados:"
echo "-- UPDATE \"Course\" SET coverImage = '1757777271763-atacandoMainframes.png' WHERE id = 'course_id_here';"
echo "-- UPDATE \"Course\" SET coverImage = '1757782861646-Atacando_PIPE_CICD.webp' WHERE id = 'course_id_here';"
echo "-- UPDATE \"Course\" SET coverImage = '1757784422047-Humanoid Crab Image.png' WHERE id = 'course_id_here';"
echo ""
echo "-- Para cursos sem imagem, definir uma imagem padrão:"
echo "-- UPDATE \"Course\" SET coverImage = '1757777271763-atacandoMainframes.png' WHERE coverImage IS NULL OR coverImage = '';"
echo "----------------------------------------------------------------------------------------------------"

echo ""
echo "🧪 Para testar uma imagem específica:"
echo "1. Acesse: https://seudominio.com/api/uploads/1757777271763-atacandoMainframes.png"
echo "2. Se carregar, a imagem existe e está acessível"
echo "3. Se der 404, há problema na API de uploads"

echo ""
echo "🌐 Acesse: https://supabase.com/dashboard"
echo "1. Selecione seu projeto"
echo "2. Vá para SQL Editor"
echo "3. Execute o SQL de verificação"
echo "4. Execute o SQL de correção com os IDs corretos"
