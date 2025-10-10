#!/bin/bash

echo "🔄 Migrando cursos para usar imagens da pasta /public/uploads..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Erro: Variáveis de ambiente não configuradas"
  echo "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

echo "✅ Variáveis de ambiente configuradas"

# SQL para listar cursos com coverImage
LIST_COURSES_SQL="
SELECT id, title, coverImage 
FROM \"Course\" 
WHERE coverImage IS NOT NULL AND coverImage != '';
"

echo "📋 Execute este SQL no Supabase Dashboard para listar cursos com imagens:"
echo "----------------------------------------------------------------------------------------------------"
echo "$LIST_COURSES_SQL"
echo "----------------------------------------------------------------------------------------------------"

# SQL para atualizar cursos com imagens da pasta uploads
UPDATE_COURSES_SQL="
-- Atualizar cursos para usar imagens da pasta uploads
-- Substitua os IDs pelos IDs reais dos seus cursos

-- Exemplo 1: Se o curso tem coverImage = '/api/images/abc123' e você quer usar '1757777271763-atacandoMainframes.png'
-- UPDATE \"Course\" SET coverImage = '1757777271763-atacandoMainframes.png' WHERE id = 'course_id_here';

-- Exemplo 2: Se o curso tem coverImage = '/api/images/def456' e você quer usar '1757782861646-Atacando_PIPE_CICD.webp'
-- UPDATE \"Course\" SET coverImage = '1757782861646-Atacando_PIPE_CICD.webp' WHERE id = 'course_id_here';

-- Exemplo 3: Se o curso tem coverImage = '/api/images/ghi789' e você quer usar '1757784422047-Humanoid Crab Image.png'
-- UPDATE \"Course\" SET coverImage = '1757784422047-Humanoid Crab Image.png' WHERE id = 'course_id_here';

-- Para atualizar todos os cursos de uma vez (CUIDADO: isso vai sobrescrever todas as imagens):
-- UPDATE \"Course\" SET coverImage = '1757777271763-atacandoMainframes.png' WHERE coverImage LIKE '/api/images/%';

-- Para verificar o resultado:
-- SELECT id, title, coverImage FROM \"Course\" WHERE coverImage IS NOT NULL;
"

echo ""
echo "📋 Para atualizar os cursos, execute este SQL no Supabase Dashboard:"
echo "----------------------------------------------------------------------------------------------------"
echo "$UPDATE_COURSES_SQL"
echo "----------------------------------------------------------------------------------------------------"

echo ""
echo "🖼️ Imagens disponíveis na pasta /public/uploads:"
echo "----------------------------------------"
find public/uploads -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" | head -10 | while read -r file; do
  filename=$(basename "$file")
  echo "📸 $filename"
done

echo ""
echo "🌐 Acesse: https://supabase.com/dashboard"
echo "1. Selecione seu projeto"
echo "2. Vá para SQL Editor"
echo "3. Execute primeiro o SQL de listagem"
echo "4. Execute o SQL de atualização com os IDs corretos"
echo "5. Verifique o resultado"

echo ""
echo "🧪 Para testar após a migração:"
echo "1. Acesse o catálogo de cursos"
echo "2. Verifique se as imagens são exibidas"
echo "3. Se não funcionar, verifique os logs do console"
